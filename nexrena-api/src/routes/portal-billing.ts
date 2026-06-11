import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { createInvoiceCheckoutSession } from '../lib/stripe-billing'
import { isStripeConfigured, portalReturnUrl } from '../lib/stripe'
import { portalInvoiceWhere } from '../lib/invoice-utils'

const router = Router()

/** GET /api/portal/billing/status */
router.get('/status', requirePortalAuth, async (_req, res) => {
  res.json({
    stripeEnabled: isStripeConfigured(),
    portalUrl: process.env.PORTAL_URL ?? null,
  })
})

/** GET /api/portal/billing/subscriptions */
router.get('/subscriptions', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const subs = await prisma.subscription.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(subs)
})

/** POST /api/portal/billing/checkout — pay an invoice via Stripe Checkout */
router.post('/checkout', requirePortalAuth, async (req, res) => {
  const { invoiceId } = req.body as { invoiceId?: string }
  if (!invoiceId) {
    res.status(400).json({ error: 'invoiceId is required' })
    return
  }

  if (!isStripeConfigured()) {
    res.status(503).json({
      error: 'Online payments are not configured yet. Contact Nexrena to pay this invoice.',
      stripeEnabled: false,
    })
    return
  }

  try {
    const session = await createInvoiceCheckoutSession({
      contactId: req.portalUser!.contactId,
      invoiceId,
      successUrl: `${portalReturnUrl('/?tab=sign-in')}&paid=1`,
      cancelUrl: `${portalReturnUrl('/?tab=sign-in')}&paid=0`,
    })
    res.json(session)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Checkout failed' })
  }
})

/** GET /api/portal/billing/invoices — unpaid/sent invoices eligible for payment */
router.get('/invoices', requirePortalAuth, async (req, res) => {
  const { contactId, email } = req.portalUser!
  const invoices = await prisma.invoice.findMany({
    where: {
      ...portalInvoiceWhere(contactId, email),
      status: { in: ['sent', 'overdue'] },
    },
    orderBy: { dueDate: 'asc' },
    select: {
      id: true,
      number: true,
      status: true,
      dueDate: true,
      projectName: true,
      lineItems: true,
      taxRate: true,
    },
  })
  res.json(invoices)
})

export default router
