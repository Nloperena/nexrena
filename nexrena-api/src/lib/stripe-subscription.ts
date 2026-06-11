import { randomUUID } from 'crypto'
import type { Subscription } from '@prisma/client'
import { prisma } from './prisma'
import { nextInvoiceNumber } from './invoice-utils'
import { ensureStripeCustomer } from './stripe-customer'
import { getStripe, portalReturnUrl } from './stripe'

function stripeRecurring(interval: string): { interval: 'month' | 'year'; interval_count?: number } {
  if (interval === 'quarterly') return { interval: 'month', interval_count: 3 }
  if (interval === 'annually') return { interval: 'year' }
  return { interval: 'month' }
}

export async function ensureStripePriceForSubscription(sub: Subscription): Promise<string> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')

  if (sub.stripePriceId) {
    try {
      const price = await stripe.prices.retrieve(sub.stripePriceId)
      if (price.active) return sub.stripePriceId
    } catch {
      /* recreate below */
    }
  }

  const product = await stripe.products.create({
    name: sub.description,
    metadata: { nexrenaSubscriptionId: sub.id, contactId: sub.contactId },
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(sub.amount * 100),
    currency: 'usd',
    recurring: stripeRecurring(sub.interval),
    metadata: { nexrenaSubscriptionId: sub.id },
  })

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { stripePriceId: price.id },
  })

  return price.id
}

export async function createSubscriptionCheckoutSession(params: {
  contactId: string
  subscriptionIds?: string[]
  successUrl?: string
  cancelUrl?: string
}) {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY on the API.')

  const where = {
    contactId: params.contactId,
    status: 'active' as const,
    stripeSubscriptionId: null,
    ...(params.subscriptionIds?.length ? { id: { in: params.subscriptionIds } } : {}),
  }

  const subs = await prisma.subscription.findMany({ where, orderBy: { createdAt: 'asc' } })
  if (subs.length === 0) {
    throw new Error('No subscriptions are eligible for autopay (already active or not found)')
  }

  const customerId = await ensureStripeCustomer(params.contactId)
  if (!customerId) throw new Error('Could not create Stripe customer')

  const lineItems = await Promise.all(
    subs.map(async (sub) => ({
      price: await ensureStripePriceForSubscription(sub),
      quantity: 1,
    })),
  )

  const nexrenaIds = subs.map((s) => s.id).join(',')

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: lineItems,
    subscription_data: {
      metadata: {
        contactId: params.contactId,
        nexrenaSubscriptionIds: nexrenaIds,
      },
    },
    metadata: {
      checkoutType: 'subscription',
      contactId: params.contactId,
      nexrenaSubscriptionIds: nexrenaIds,
    },
    success_url: params.successUrl ?? `${portalReturnUrl('/?tab=sign-in')}&subscribed=1`,
    cancel_url: params.cancelUrl ?? `${portalReturnUrl('/?tab=sign-in')}&subscribed=0`,
  })

  return { url: session.url, sessionId: session.id, subscriptionIds: subs.map((s) => s.id) }
}

export async function linkSubscriptionsFromCheckout(session: Record<string, unknown>): Promise<void> {
  const stripe = getStripe()
  if (!stripe) return

  const stripeSubId =
    typeof session.subscription === 'string'
      ? session.subscription
      : typeof (session.subscription as { id?: string } | null)?.id === 'string'
        ? (session.subscription as { id: string }).id
        : null

  if (!stripeSubId) return

  const metadata = session.metadata as Record<string, string> | undefined
  const localIds = (metadata?.nexrenaSubscriptionIds ?? '').split(',').filter(Boolean)
  if (localIds.length === 0) return

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId, { expand: ['items.data.price'] })
  const items = stripeSub.items.data

  for (const localId of localIds) {
    const localSub = await prisma.subscription.findUnique({ where: { id: localId } })
    if (!localSub?.stripePriceId) continue

    const item = items.find((i) => i.price.id === localSub.stripePriceId)
    if (!item) continue

    await prisma.subscription.update({
      where: { id: localId },
      data: {
        stripeSubscriptionId: stripeSubId,
        stripeSubscriptionItemId: item.id,
      },
    })
  }

  console.log(`[stripe] linked ${localIds.length} subscription(s) to ${stripeSubId}`)
}

export async function recordStripeSubscriptionInvoicePaid(stripeInvoice: Record<string, unknown>): Promise<void> {
  const subscriptionRef = stripeInvoice.subscription
  const stripeSubId =
    typeof subscriptionRef === 'string'
      ? subscriptionRef
      : typeof (subscriptionRef as { id?: string } | null)?.id === 'string'
        ? (subscriptionRef as { id: string }).id
        : null

  if (!stripeSubId) return

  const localSubs = await prisma.subscription.findMany({
    where: { stripeSubscriptionId: stripeSubId, status: { in: ['active', 'paused'] } },
  })
  if (localSubs.length === 0) return

  const stripeInvoiceId = typeof stripeInvoice.id === 'string' ? stripeInvoice.id : null
  if (stripeInvoiceId) {
    const existing = await prisma.invoice.findFirst({
      where: { stripeInvoiceId },
    })
    if (existing) return
  }

  const contact = await prisma.contact.findUnique({ where: { id: localSubs[0].contactId } })
  const today = new Date().toISOString().slice(0, 10)
  const existingNumbers = (await prisma.invoice.findMany({ select: { number: true } })).map((i) => i.number)
  const invoiceNumber = nextInvoiceNumber(existingNumbers)

  const amountPaid =
    typeof stripeInvoice.amount_paid === 'number' ? stripeInvoice.amount_paid / 100 : localSubs.reduce((s, sub) => s + sub.amount, 0)

  await prisma.invoice.create({
    data: {
      id: randomUUID(),
      number: invoiceNumber,
      clientName: contact?.name ?? 'Unknown',
      clientCompany: contact?.company ?? undefined,
      clientEmail: contact?.email ?? undefined,
      contactId: localSubs[0].contactId,
      status: 'paid',
      lineItems: localSubs.map((sub) => ({
        id: randomUUID(),
        description: sub.description,
        quantity: 1,
        rate: sub.amount,
      })),
      issueDate: today,
      dueDate: today,
      paidDate: today,
      paidVia: 'stripe',
      stripeInvoiceId: stripeInvoiceId ?? undefined,
      invoicePhase: 'subscription',
      notes: `Stripe subscription renewal (${stripeSubId})`,
      createdAt: new Date().toISOString(),
    },
  })

  for (const sub of localSubs) {
    const next = advanceBillingDate(sub.nextBillingDate, sub.interval)
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { nextBillingDate: next },
    })
  }

  console.log(`[stripe] recorded subscription invoice ${invoiceNumber} ($${amountPaid})`)
}

function advanceBillingDate(dateStr: string, interval: string): string {
  const d = new Date(dateStr)
  if (interval === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (interval === 'quarterly') d.setMonth(d.getMonth() + 3)
  else if (interval === 'annually') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export async function cancelStripeSubscriptionItem(
  sub: Subscription,
  atPeriodEnd: boolean,
): Promise<void> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')

  if (!sub.stripeSubscriptionId) return

  if (sub.stripeSubscriptionItemId && !atPeriodEnd) {
    await stripe.subscriptionItems.del(sub.stripeSubscriptionItemId)
    return
  }

  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)
  const otherLocal = await prisma.subscription.count({
    where: {
      stripeSubscriptionId: sub.stripeSubscriptionId,
      id: { not: sub.id },
      status: 'active',
    },
  })

  if (otherLocal === 0 || stripeSub.items.data.length <= 1) {
    if (atPeriodEnd) {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true })
    } else {
      await stripe.subscriptions.cancel(sub.stripeSubscriptionId)
    }
    return
  }

  if (sub.stripeSubscriptionItemId) {
    await stripe.subscriptionItems.del(sub.stripeSubscriptionItemId)
  }
}

export async function syncLocalSubscriptionsFromStripe(stripeSub: Record<string, unknown>): Promise<void> {
  const stripeSubId = typeof stripeSub.id === 'string' ? stripeSub.id : null
  if (!stripeSubId) return

  const statusMap: Record<string, string> = {
    active: 'active',
    paused: 'paused',
    canceled: 'cancelled',
    unpaid: 'paused',
    past_due: 'active',
    incomplete: 'paused',
    incomplete_expired: 'cancelled',
    trialing: 'active',
  }
  const rawStatus = typeof stripeSub.status === 'string' ? stripeSub.status : 'active'
  const status = statusMap[rawStatus] ?? 'active'

  const metadata = stripeSub.metadata as Record<string, string> | undefined
  const localIds = (metadata?.nexrenaSubscriptionIds ?? '').split(',').filter(Boolean)

  if (localIds.length > 0) {
    await prisma.subscription.updateMany({
      where: { id: { in: localIds } },
      data: { status, stripeSubscriptionId: stripeSubId },
    })
    return
  }

  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: stripeSubId },
    data: { status },
  })
}
