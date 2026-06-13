import { randomUUID } from 'crypto'
import { prisma } from './prisma'
import { nextInvoiceNumber } from './invoice-utils'
import { getCatalogService, type CatalogService } from './service-catalog'
import { ensureStripeCustomer } from './stripe-customer'
import { getStripe, portalReturnUrl } from './stripe'
import { linkSubscriptionsFromCheckout } from './stripe-subscription'
import { notifyNewLead } from './notify'

function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function serviceSummary(service: CatalogService): string {
  return service.bestFor ?? service.scopeBoundary
}

async function ensureStripePriceForService(service: CatalogService, localSubId: string): Promise<string> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')
  if (service.priceCents == null) throw new Error('This service requires a custom quote')

  const stripeProduct = await stripe.products.create({
    name: service.name,
    description: serviceSummary(service).slice(0, 500),
    metadata: { nexrenaProductSku: service.sku, nexrenaSubscriptionId: localSubId },
  })

  const price = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: service.priceCents,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { nexrenaProductSku: service.sku, nexrenaSubscriptionId: localSubId },
  })

  return price.id
}

export async function createProductCheckoutSession(params: {
  contactId: string
  accountId: string
  sku: string
  successUrl?: string
  cancelUrl?: string
  email?: string
}) {
  const baseService = getCatalogService(params.sku)
  if (!baseService) throw new Error('Unknown service')
  
  let service = { ...baseService }
  if (params.email) {
    const isOwner = ['joe@furniturepackagesusa.com', 'warren@twoazaleagroup.com'].includes(params.email)
    if (isOwner && (service.sku === 'plan-hosting' || service.sku === 'plan-analytics')) {
      service.priceCents = 2000
      service.priceLabel = '$20/mo'
    }
  }

  if (!service.checkoutEnabled) {
    throw new Error('This service requires a scope review before purchase. Request a quote instead.')
  }
  if (service.priceCents == null || service.priceCents <= 0) {
    throw new Error('This service requires a custom quote')
  }

  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY on the API.')

  const customerId = await ensureStripeCustomer(params.contactId)
  if (!customerId) throw new Error('Could not create Stripe customer')

  const successUrl = params.successUrl ?? `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=1`
  const cancelUrl = params.cancelUrl ?? `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=0`

  if (service.kind === 'one_time') {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: service.priceCents,
            product_data: {
              name: service.name,
              description: serviceSummary(service).slice(0, 500),
              metadata: { nexrenaProductSku: service.sku },
            },
          },
        },
      ],
      metadata: {
        checkoutType: 'product',
        productSku: service.sku,
        contactId: params.contactId,
        portalAccountId: params.accountId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return { url: session.url, sessionId: session.id, sku: service.sku }
  }

  const today = new Date().toISOString().slice(0, 10)
  const subId = randomUUID()
  const priceId = await ensureStripePriceForService(service, subId)

  await prisma.subscription.create({
    data: {
      id: subId,
      contactId: params.contactId,
      description: service.name,
      amount: service.priceCents / 100,
      interval: service.interval ?? 'monthly',
      status: 'active',
      billingDay: 1,
      nextBillingDate: addMonths(today, 1),
      notes: `productSku:${service.sku}`,
      stripePriceId: priceId,
      createdAt: new Date().toISOString(),
    },
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: {
        contactId: params.contactId,
        productSku: service.sku,
        nexrenaSubscriptionIds: subId,
      },
    },
    metadata: {
      checkoutType: 'product',
      productSku: service.sku,
      contactId: params.contactId,
      portalAccountId: params.accountId,
      nexrenaSubscriptionIds: subId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return { url: session.url, sessionId: session.id, sku: service.sku, subscriptionId: subId }
}

async function createPaidProductInvoice(params: {
  contactId: string
  service: CatalogService
  paymentIntent?: string
}) {
  if (params.service.priceCents == null) return

  const contact = await prisma.contact.findUnique({ where: { id: params.contactId } })
  const today = new Date().toISOString().slice(0, 10)
  const existingNumbers = (await prisma.invoice.findMany({ select: { number: true } })).map((i) => i.number)

  await prisma.invoice.create({
    data: {
      id: randomUUID(),
      number: nextInvoiceNumber(existingNumbers),
      clientName: contact?.name ?? 'Unknown',
      clientCompany: contact?.company ?? undefined,
      clientEmail: contact?.email ?? undefined,
      contactId: params.contactId,
      projectName: params.service.name,
      status: 'paid',
      lineItems: [
        {
          id: randomUUID(),
          description: params.service.name,
          quantity: 1,
          rate: params.service.priceCents / 100,
          taxable: false,
        },
      ],
      issueDate: today,
      dueDate: today,
      paidDate: today,
      paidVia: 'stripe',
      invoicePhase: 'full',
      notes: `productSku:${params.service.sku}`,
      stripePaymentIntentId: params.paymentIntent,
      createdAt: new Date().toISOString(),
    },
  })
}

async function createProductServiceRequest(params: {
  contactId: string
  accountId?: string
  service: CatalogService
  source: string
  note?: string
}) {
  const account = params.accountId
    ? await prisma.portalAccount.findUnique({ where: { id: params.accountId } })
    : null

  await prisma.serviceRequest.create({
    data: {
      contactId: params.contactId,
      portalAccountId: account?.id ?? null,
      projectType: params.service.projectType,
      description: params.note
        ?? `Purchased ${params.service.name} (${params.service.sku}). ${params.service.scopeBoundary}`,
      budget: params.service.priceLabel,
      timeline: params.service.kind === 'recurring' ? 'Ongoing subscription' : 'Standard delivery',
      source: params.source,
      status: 'new',
      internalNotes: `Service order: ${params.service.sku}`,
    },
  })

  if (account) {
    notifyNewLead({
      name: account.name,
      email: account.email,
      company: account.company ?? undefined,
      message: `Service order: ${params.service.name}`,
      projectType: params.service.projectType,
      budget: params.service.priceLabel,
    }).catch(() => {})
  }
}

export async function handleProductCheckoutCompleted(session: Record<string, unknown>): Promise<boolean> {
  const metadata = session.metadata as Record<string, string> | undefined
  if (metadata?.checkoutType !== 'product') return false

  const sku = metadata.productSku
  const contactId = metadata.contactId
  const accountId = metadata.portalAccountId
  if (!sku || !contactId) return true

  const baseService = getCatalogService(sku)
  if (!baseService) return true

  let service = { ...baseService }
  const contact = await prisma.contact.findUnique({ where: { id: contactId } })
  if (contact?.email) {
    const isOwner = ['joe@furniturepackagesusa.com', 'warren@twoazaleagroup.com'].includes(contact.email)
    if (isOwner && (service.sku === 'plan-hosting' || service.sku === 'plan-analytics')) {
      service.priceCents = 2000
      service.priceLabel = '$20/mo'
    }
  }

  const mode = typeof session.mode === 'string' ? session.mode : undefined
  const paymentIntent =
    typeof session.payment_intent === 'string' ? session.payment_intent : undefined

  if (mode === 'subscription' || service.kind === 'recurring') {
    await linkSubscriptionsFromCheckout(session)
    await createProductServiceRequest({
      contactId,
      accountId,
      service,
      source: 'portal-shop',
    })
    console.log(`[stripe] fulfilled recurring service ${sku} for ${contactId}`)
    return true
  }

  await createPaidProductInvoice({ contactId, service, paymentIntent })
  await createProductServiceRequest({
    contactId,
    accountId,
    service,
    source: 'portal-shop',
  })
  console.log(`[stripe] fulfilled one-time service ${sku} for ${contactId}`)
  return true
}
