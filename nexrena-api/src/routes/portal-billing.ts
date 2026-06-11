import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { cancelStripeSubscription, createInvoiceCheckoutSession } from '../lib/stripe-billing'
import { getStripe, isStripeConfigured, portalReturnUrl } from '../lib/stripe'
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
    where: { contactId, status: { in: ['active', 'paused'] } },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      contactId: true,
      description: true,
      amount: true,
      interval: true,
      status: true,
      nextBillingDate: true,
      stripeSubscriptionId: true,
    },
  })
  res.json(subs)
})

/** POST /api/portal/billing/subscriptions/:id/cancel */
router.post('/subscriptions/:id/cancel', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const { atPeriodEnd = true } = req.body as { atPeriodEnd?: boolean }

  const sub = await prisma.subscription.findFirst({
    where: { id: req.params.id, contactId },
  })
  if (!sub) {
    res.status(404).json({ error: 'Subscription not found' })
    return
  }
  if (sub.status === 'cancelled') {
    res.status(400).json({ error: 'Subscription is already cancelled' })
    return
  }

  try {
    if (sub.stripeSubscriptionId) {
      if (!getStripe()) {
        res.status(503).json({ error: 'Online billing is not configured. Contact Nexrena to cancel.' })
        return
      }
      await cancelStripeSubscription(sub.stripeSubscriptionId, atPeriodEnd)
      const updated = await prisma.subscription.update({
        where: { id: sub.id },
        data: atPeriodEnd ? { status: 'active' } : { status: 'cancelled' },
      })
      res.json(updated)
      return
    }

    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'cancelled' },
    })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Could not cancel subscription' })
  }
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
      error: 'Online payment is coming soon. Contact Nexrena to pay this invoice in the meantime.',
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
      projectId: true,
      lineItems: true,
      taxRate: true,
      invoicePhase: true,
      depositOfInvoiceId: true,
    },
  })
  res.json(invoices)
})

export default router
