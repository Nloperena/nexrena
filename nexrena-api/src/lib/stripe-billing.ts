import { prisma } from './prisma'
import { checkoutProductName, invoiceTotal, parseLineItems, portalInvoiceWhere } from './invoice-utils'
import { getStripe } from './stripe'
import { ensureStripeCustomer } from './stripe-customer'
import {
  cancelStripeSubscriptionItem,
  linkSubscriptionsFromCheckout,
  recordStripeSubscriptionInvoicePaid,
  syncLocalSubscriptionsFromStripe,
} from './stripe-subscription'
import { handleProductCheckoutCompleted } from './stripe-products'

export { ensureStripeCustomer } from './stripe-customer'

function invoiceAmountCents(invoice: { lineItems: unknown; taxRate?: number | null }): number {
  const lineItems = parseLineItems(invoice.lineItems)
  return Math.round(invoiceTotal(lineItems, invoice.taxRate) * 100)
}

function buildInvoiceCheckoutLineItem(invoice: {
  number: string
  invoicePhase?: string | null
  projectName?: string | null
  notes?: string | null
  lineItems: unknown
  taxRate?: number | null
}) {
  const amountCents = invoiceAmountCents(invoice)
  if (amountCents <= 0) throw new Error(`Invoice ${invoice.number} total must be greater than zero`)
  return {
    quantity: 1,
    price_data: {
      currency: 'usd',
      unit_amount: amountCents,
      product_data: {
        name: checkoutProductName(invoice),
        description: invoice.projectName ?? invoice.notes ?? undefined,
      },
    },
  }
}

export async function createInvoiceCheckoutSession(params: {
  contactId: string
  invoiceId: string
  successUrl?: string
  cancelUrl?: string
}) {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY on the API.')
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: params.invoiceId, contactId: params.contactId },
  })
  if (!invoice) throw new Error('Invoice not found')
  if (invoice.status === 'paid') throw new Error('Invoice is already paid')

  const customerId = await ensureStripeCustomer(params.contactId)
  if (!customerId) throw new Error('Could not create Stripe customer')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [buildInvoiceCheckoutLineItem(invoice)],
    metadata: {
      contactId: params.contactId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
    },
    success_url: params.successUrl ?? `${process.env.PORTAL_URL ?? 'https://nexrena-ops.vercel.app'}/?paid=1`,
    cancel_url: params.cancelUrl ?? `${process.env.PORTAL_URL ?? 'https://nexrena-ops.vercel.app'}/?paid=0`,
  })

  return { url: session.url, sessionId: session.id }
}

export async function createBalanceCheckoutSession(params: {
  contactId: string
  email: string
  successUrl?: string
  cancelUrl?: string
}) {
  const stripe = getStripe()
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY on the API.')
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      ...portalInvoiceWhere(params.contactId, params.email),
      status: { in: ['sent', 'overdue'] },
    },
    orderBy: { dueDate: 'asc' },
  })

  if (invoices.length === 0) throw new Error('No unpaid invoices')

  const customerId = await ensureStripeCustomer(params.contactId)
  if (!customerId) throw new Error('Could not create Stripe customer')

  const line_items = invoices.map((invoice) => buildInvoiceCheckoutLineItem(invoice))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items,
    metadata: {
      checkoutType: 'balance',
      contactId: params.contactId,
      invoiceIds: invoices.map((inv) => inv.id).join(','),
      invoiceCount: String(invoices.length),
    },
    success_url: params.successUrl ?? `${process.env.PORTAL_URL ?? 'https://nexrena-ops.vercel.app'}/?paid=1`,
    cancel_url: params.cancelUrl ?? `${process.env.PORTAL_URL ?? 'https://nexrena-ops.vercel.app'}/?paid=0`,
  })

  return {
    url: session.url,
    sessionId: session.id,
    invoiceIds: invoices.map((inv) => inv.id),
    totalCents: line_items.reduce((sum, item) => sum + item.price_data.unit_amount, 0),
  }
}

export async function cancelStripeSubscription(
  sub: import('@prisma/client').Subscription,
  atPeriodEnd: boolean,
): Promise<void> {
  await cancelStripeSubscriptionItem(sub, atPeriodEnd)
}
export async function handleStripeWebhookEvent(event: { type: string; data: { object: unknown } }) {
  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutCompleted(asRecord(event.data.object))
      break
    case 'invoice.paid':
      await onStripeInvoicePaid(asRecord(event.data.object))
      break
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await onStripeSubscriptionChange(asRecord(event.data.object))
      break
    default:
      console.log(`[stripe] unhandled event ${event.type}`)
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>
}

async function onCheckoutCompleted(session: Record<string, unknown>) {
  const metadata = session.metadata as Record<string, string> | undefined
  const mode = typeof session.mode === 'string' ? session.mode : undefined

  if (metadata?.checkoutType === 'product') {
    await handleProductCheckoutCompleted(session)
    return
  }

  if (metadata?.checkoutType === 'subscription' || mode === 'subscription') {
    await linkSubscriptionsFromCheckout(session)
    return
  }

  if (metadata?.checkoutType === 'balance') {
    const invoiceIds = metadata.invoiceIds?.split(',').filter(Boolean) ?? []
    await markInvoicesPaidFromCheckout(invoiceIds, metadata.contactId, session.payment_intent)
    return
  }

  const invoiceId = metadata?.invoiceId
  if (!invoiceId) return

  await markInvoicesPaidFromCheckout([invoiceId], metadata?.contactId, session.payment_intent)
}

async function markInvoicesPaidFromCheckout(
  invoiceIds: string[],
  contactId: string | undefined,
  paymentIntent: unknown,
) {
  if (invoiceIds.length === 0) return

  const today = new Date().toISOString().slice(0, 10)
  const where: { id: { in: string[] }; status: { not: 'paid' }; contactId?: string } = {
    id: { in: invoiceIds },
    status: { not: 'paid' },
  }
  if (contactId) where.contactId = contactId

  const result = await prisma.invoice.updateMany({
    where,
    data: {
      status: 'paid',
      paidDate: today,
      paidVia: 'stripe',
      stripePaymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : undefined,
    },
  })
  console.log(`[stripe] marked ${result.count} invoice(s) paid via checkout`)
}

async function onStripeInvoicePaid(stripeInvoice: Record<string, unknown>) {
  const metadata = stripeInvoice.metadata as Record<string, string> | undefined
  const invoiceId = metadata?.invoiceId

  if (invoiceId) {
    const today = new Date().toISOString().slice(0, 10)
    await prisma.invoice.updateMany({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidDate: today,
        paidVia: 'stripe',
        stripeInvoiceId: typeof stripeInvoice.id === 'string' ? stripeInvoice.id : undefined,
      },
    })
    return
  }

  await recordStripeSubscriptionInvoicePaid(stripeInvoice)
}

async function onStripeSubscriptionChange(stripeSub: Record<string, unknown>) {
  await syncLocalSubscriptionsFromStripe(stripeSub)
}