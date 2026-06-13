import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requirePortalAuth, optionalPortalAuth } from '../middleware/portal-auth'
import { isStripeConfigured, portalReturnUrl } from '../lib/stripe'
import {
  CATEGORY_ORDER,
  UNIVERSAL_SCOPE_LANGUAGE,
  catalogServiceForClient,
  getCatalogService,
  listCatalogServices,
  type ServiceCategory,
} from '../lib/service-catalog'
import { createProductCheckoutSession } from '../lib/stripe-products'

const router = Router()

const VALID_CATEGORIES = new Set<ServiceCategory>(CATEGORY_ORDER)

/** GET /api/portal/products — full service menu (?category=website-plan|...) */
router.get('/', optionalPortalAuth, async (req, res) => {
  const raw = req.query.category as string | undefined
  const category =
    raw && VALID_CATEGORIES.has(raw as ServiceCategory) ? (raw as ServiceCategory) : undefined
  let services = listCatalogServices(category).map(catalogServiceForClient)

  let isOwner = false
  if (req.portalUser) {
    isOwner = ['joe@furniturepackagesusa.com', 'warren@twoazaleagroup.com'].includes(req.portalUser.email)
  }

  if (!isOwner) {
    // Hide hosting and analytics from non-owners
    services = services.filter(s => s.sku !== 'plan-hosting' && s.sku !== 'plan-analytics')
  } else {
    // Apply discount for owners
    services = services.map(s => {
      if (s.sku === 'plan-hosting' || s.sku === 'plan-analytics') {
        return {
          ...s,
          priceLabel: '$20/mo',
          priceCents: 2000,
          badge: 'Owner Exclusive Discount'
        }
      }
      return s
    })
  }

  res.json({
    scopeLanguage: UNIVERSAL_SCOPE_LANGUAGE,
    categories: CATEGORY_ORDER,
    services,
  })
})

/** POST /api/portal/products/checkout — buy a catalog service */
router.post('/checkout', requirePortalAuth, async (req, res) => {
  const { sku } = req.body as { sku?: string }
  if (!sku?.trim()) {
    res.status(400).json({ error: 'sku is required' })
    return
  }

  if (!isStripeConfigured()) {
    res.status(503).json({
      error: 'Online checkout is not available yet. Contact Nexrena to purchase.',
      stripeEnabled: false,
    })
    return
  }

  try {
    const session = await createProductCheckoutSession({
      contactId: req.portalUser!.contactId,
      accountId: req.portalUser!.accountId,
      sku: sku.trim(),
      email: req.portalUser!.email,
      successUrl: `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=1`,
      cancelUrl: `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=0`,
    })
    res.json(session)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Checkout failed' })
  }
})

/** POST /api/portal/products/quote — request scope review for advanced/scoped services */
router.post('/quote', requirePortalAuth, async (req, res) => {
  const { sku, message } = req.body as { sku?: string; message?: string }
  if (!sku?.trim()) {
    res.status(400).json({ error: 'sku is required' })
    return
  }

  const service = getCatalogService(sku.trim())
  if (!service) {
    res.status(404).json({ error: 'Unknown service' })
    return
  }

  const account = await prisma.portalAccount.findUnique({
    where: { id: req.portalUser!.accountId },
  })

  const row = await prisma.serviceRequest.create({
    data: {
      contactId: req.portalUser!.contactId,
      portalAccountId: account?.id ?? null,
      projectType: service.projectType,
      description: message?.trim()
        || `Quote request: ${service.name} (${service.sku}). ${service.scopeBoundary}`,
      budget: service.priceLabel,
      timeline: 'Pending scope review',
      source: 'portal-shop-quote',
      status: 'new',
      internalNotes: `Quote request for ${service.sku}`,
    },
  })

  res.status(201).json({ ok: true, requestId: row.id })
})

export default router
