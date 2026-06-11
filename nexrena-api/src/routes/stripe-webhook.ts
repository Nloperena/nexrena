import { Router } from 'express'
import { getStripe } from '../lib/stripe'
import { handleStripeWebhookEvent } from '../lib/stripe-billing'

const router = Router()

/** POST /api/stripe/webhook — raw body required (mounted before express.json) */
router.post('/', async (req, res) => {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !secret) {
    res.status(503).json({ error: 'Stripe webhook not configured' })
    return
  }

  const signature = req.headers['stripe-signature']
  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ error: 'Missing stripe-signature header' })
    return
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, signature, secret)
    await handleStripeWebhookEvent(event)
    res.json({ received: true })
  } catch (err) {
    console.error('[stripe webhook]', err)
    res.status(400).json({ error: err instanceof Error ? err.message : 'Webhook error' })
  }
})

export default router
