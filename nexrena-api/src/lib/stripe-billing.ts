import { prisma } from './prisma'
import { checkoutProductName } from './invoice-utils'
import { getStripe } from './stripe'
import { ensureStripeCustomer } from './stripe-customer'
import {
  cancelStripeSubscriptionItem,
  linkSubscriptionsFromCheckout,
  recordStripeSubscriptionInvoicePaid,
  syncLocalSubscriptionsFromStripe,
} from './stripe-subscription'

export { ensureStripeCustomer } from './stripe-customer'
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

  const lineItems = Array.isArray(invoice.lineItems)
    ? (invoice.lineItems as { description?: string; quantity?: number; rate?: number }[])
    : []
  const amountCents = Math.round(
    lineItems.reduce((sum, item) => sum + (item.quantity ?? 1) * (item.rate ?? 0), 0) * 100,
  )
  if (amountCents <= 0) throw new Error('Invoice total must be greater than zero')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: amountCents,
          product_data: {
            name: checkoutProductName(invoice),
            description: invoice.projectName ?? invoice.notes ?? undefined,
          },
        },
      },
    ],
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

  if (metadata?.checkoutType === 'subscription' || mode === 'subscription') {
    await linkSubscriptionsFromCheckout(session)
    return
  }

  const invoiceId = metadata?.invoiceId
  if (!invoiceId) return

  const paymentIntent = session.payment_intent
  const today = new Date().toISOString().slice(0, 10)
  await prisma.invoice.updateMany({
    where: { id: invoiceId },
    data: {
      status: 'paid',
      paidDate: today,
      paidVia: 'stripe',
      stripePaymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : undefined,
    },
  })
  console.log(`[stripe] marked invoice ${invoiceId} paid via checkout`)
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