import { randomUUID } from 'crypto'
import { prisma } from './prisma'
import { nextInvoiceNumber } from './invoice-utils'
import { getCatalogProduct, type CatalogProduct } from './product-catalog'
import { ensureStripeCustomer } from './stripe-customer'
import { getStripe, portalReturnUrl } from './stripe'
import { linkSubscriptionsFromCheckout } from './stripe-subscription'
import { notifyNewLead } from './notify'

function addMonths(isoDate: string, months: number): string {
  const d = new Date(isoDate)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

async function ensureStripePriceForProduct(product: CatalogProduct, localSubId: string): Promise<string> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured')

  const stripeProduct = await stripe.products.create({
    name: product.name,
    description: product.description,
    metadata: { nexrenaProductSku: product.sku, nexrenaSubscriptionId: localSubId },
  })

  const recurring =
    product.interval === 'annually'
      ? { interval: 'year' as const }
      : product.interval === 'quarterly'
        ? { interval: 'month' as const, interval_count: 3 }
        : { interval: 'month' as const }

  const price = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: product.priceCents,
    currency: 'usd',
    recurring,
    metadata: { nexrenaProductSku: product.sku, nexrenaSubscriptionId: localSubId },
  })

  return price.id
}

export async function createProductCheckoutSession(params: {
  contactId: string
  accountId: string
  sku: string
  successUrl?: string
  cancelUrl?: string
}) {
  const product = getCatalogProduct(params.sku)
  if (!product) throw new Error('Unknown product')

  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY on the API.')

  const customerId = await ensureStripeCustomer(params.contactId)
  if (!customerId) throw new Error('Could not create Stripe customer')

  const successUrl = params.successUrl ?? `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=1`
  const cancelUrl = params.cancelUrl ?? `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=0`

  if (product.kind === 'one_time') {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: product.priceCents,
            product_data: {
              name: product.name,
              description: product.description,
              metadata: { nexrenaProductSku: product.sku },
            },
          },
        },
      ],
      metadata: {
        checkoutType: 'product',
        productSku: product.sku,
        contactId: params.contactId,
        portalAccountId: params.accountId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    return { url: session.url, sessionId: session.id, sku: product.sku }
  }

  const today = new Date().toISOString().slice(0, 10)
  const subId = randomUUID()
  const priceId = await ensureStripePriceForProduct(product, subId)

  await prisma.subscription.create({
    data: {
      id: subId,
      contactId: params.contactId,
      description: product.name,
      amount: product.priceCents / 100,
      interval: product.interval ?? 'monthly',
      status: 'active',
      billingDay: 1,
      nextBillingDate: addMonths(today, 1),
      notes: `productSku:${product.sku}`,
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
        productSku: product.sku,
        nexrenaSubscriptionIds: subId,
      },
    },
    metadata: {
      checkoutType: 'product',
      productSku: product.sku,
      contactId: params.contactId,
      portalAccountId: params.accountId,
      nexrenaSubscriptionIds: subId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return { url: session.url, sessionId: session.id, sku: product.sku, subscriptionId: subId }
}

async function createPaidProductInvoice(params: {
  contactId: string
  product: CatalogProduct
  paymentIntent?: string
}) {
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
      projectName: params.product.name,
      status: 'paid',
      lineItems: [
        {
          id: randomUUID(),
          description: params.product.name,
          quantity: 1,
          rate: params.product.priceCents / 100,
          taxable: false,
        },
      ],
      issueDate: today,
      dueDate: today,
      paidDate: today,
      paidVia: 'stripe',
      invoicePhase: 'full',
      notes: `productSku:${params.product.sku}`,
      stripePaymentIntentId: params.paymentIntent,
      createdAt: new Date().toISOString(),
    },
  })
}

async function createProductServiceRequest(params: {
  contactId: string
  accountId?: string
  product: CatalogProduct
  source: string
}) {
  const account = params.accountId
    ? await prisma.portalAccount.findUnique({ where: { id: params.accountId } })
    : null

  await prisma.serviceRequest.create({
    data: {
      contactId: params.contactId,
      portalAccountId: account?.id ?? null,
      projectType: params.product.projectType,
      description: `Purchased ${params.product.name} (${params.product.sku}). ${params.product.description}`,
      budget: params.product.priceLabel,
      timeline: params.product.kind === 'recurring' ? 'Ongoing subscription' : 'Standard delivery',
      source: params.source,
      status: 'new',
      internalNotes: `Auto-created from product checkout: ${params.product.sku}`,
    },
  })

  if (account) {
    notifyNewLead({
      name: account.name,
      email: account.email,
      company: account.company ?? undefined,
      message: `Product purchase: ${params.product.name}`,
      projectType: params.product.projectType,
      budget: params.product.priceLabel,
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

  const product = getCatalogProduct(sku)
  if (!product) return true

  const mode = typeof session.mode === 'string' ? session.mode : undefined
  const paymentIntent =
    typeof session.payment_intent === 'string' ? session.payment_intent : undefined

  if (mode === 'subscription' || product.kind === 'recurring') {
    await linkSubscriptionsFromCheckout(session)
    await createProductServiceRequest({
      contactId,
      accountId,
      product,
      source: 'portal-shop',
    })
    console.log(`[stripe] fulfilled recurring product ${sku} for ${contactId}`)
    return true
  }

  await createPaidProductInvoice({ contactId, product, paymentIntent })
  await createProductServiceRequest({
    contactId,
    accountId,
    product,
    source: 'portal-shop',
  })
  console.log(`[stripe] fulfilled one-time product ${sku} for ${contactId}`)
  return true
}
