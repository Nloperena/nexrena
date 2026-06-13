import { Router } from 'express'
import { requirePortalAuth } from '../middleware/portal-auth'
import { isStripeConfigured, portalReturnUrl } from '../lib/stripe'
import { catalogProductForClient, listCatalogProducts, type ProductCategory } from '../lib/product-catalog'
import { createProductCheckoutSession } from '../lib/stripe-products'

const router = Router()

/** GET /api/portal/products — catalog (optional ?category=website|seo|extension) */
router.get('/', async (req, res) => {
  const category = req.query.category as ProductCategory | undefined
  const validCategories = new Set(['website', 'seo', 'extension'])
  const products = listCatalogProducts(
    category && validCategories.has(category) ? category : undefined,
  )
  res.json(products.map(catalogProductForClient))
})

/** POST /api/portal/products/checkout — buy a catalog product */
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
      successUrl: `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=1`,
      cancelUrl: `${portalReturnUrl('/?tab=sign-in')}&view=shop&purchased=0`,
    })
    res.json(session)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Checkout failed' })
  }
})

export default router
