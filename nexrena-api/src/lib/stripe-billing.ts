import type Stripe from 'stripe'
import { prisma } from './prisma'
import { getStripe } from './stripe'

export async function ensureStripeCustomer(contactId: string): Promise<string | null> {
  const stripe = getStripe()
  if (!stripe) return null

  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (!contact) return null
  if (contact.stripeCustomerId) return contact.stripeCustomerId

  const customer = await stripe.customers.create({
    email: contact.email,
    name: contact.name,
    metadata: { contactId: contact.id, company: contact.company },
  })

  await prisma.contact.update({
    where: { id: contact.id },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
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
            name: `Invoice ${invoice.number}`,
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

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break
    case 'invoice.paid':
      await onStripeInvoicePaid(event.data.object as Stripe.Invoice)
      break
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await onStripeSubscriptionChange(event.data.object as Stripe.Subscription)
      break
    default:
      console.log(`[stripe] unhandled event ${event.type}`)
  }
}

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.invoiceId
  if (!invoiceId) return

  const today = new Date().toISOString().slice(0, 10)
  await prisma.invoice.updateMany({
    where: { id: invoiceId },
    data: {
      status: 'paid',
      paidDate: today,
      paidVia: 'stripe',
      stripePaymentIntentId:
        typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
    },
  })
  console.log(`[stripe] marked invoice ${invoiceId} paid via checkout`)
}

async function onStripeInvoicePaid(stripeInvoice: Stripe.Invoice) {
  const invoiceId = stripeInvoice.metadata?.invoiceId
  if (!invoiceId) return

  const today = new Date().toISOString().slice(0, 10)
  await prisma.invoice.updateMany({
    where: { id: invoiceId },
    data: {
      status: 'paid',
      paidDate: today,
      paidVia: 'stripe',
      stripeInvoiceId: stripeInvoice.id,
    },
  })
}

async function onStripeSubscriptionChange(stripeSub: Stripe.Subscription) {
  const localId = stripeSub.metadata?.subscriptionId
  if (!localId) return

  const statusMap: Record<string, string> = {
    active: 'active',
    paused: 'paused',
    canceled: 'cancelled',
    unpaid: 'paused',
    past_due: 'active',
  }
  const status = statusMap[stripeSub.status] ?? 'active'

  await prisma.subscription.updateMany({
    where: { id: localId },
    data: {
      status,
      stripeSubscriptionId: stripeSub.id,
    },
  })
}
