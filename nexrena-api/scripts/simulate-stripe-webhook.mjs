/**
 * Simulates checkout.session.completed webhook against the API.
 * Usage: STRIPE_WEBHOOK_SECRET=whsec_... node scripts/simulate-stripe-webhook.mjs [invoiceId] [apiBase]
 */
import Stripe from 'stripe'

const invoiceId = process.argv[2] ?? 'mgyldtuz'
const apiBase =
  process.argv[3] ?? 'https://nexrena-api-5dc54effaa9f.herokuapp.com'
const secret = process.env.STRIPE_WEBHOOK_SECRET

if (!secret) {
  console.error('Set STRIPE_WEBHOOK_SECRET')
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder')

const payload = JSON.stringify({
  id: `evt_sim_${Date.now()}`,
  object: 'event',
  api_version: '2024-11-20.acacia',
  created: Math.floor(Date.now() / 1000),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_simulation',
      object: 'checkout.session',
      metadata: {
        invoiceId,
        contactId: 'warren-daughtridge-ttag',
        invoiceNumber: 'NXR-2026-009',
      },
      payment_intent: 'pi_test_simulation',
    },
  },
})

const signature = stripe.webhooks.generateTestHeaderString({
  payload,
  secret,
})

const res = await fetch(`${apiBase}/api/stripe/webhook`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': signature,
  },
  body: payload,
})

const body = await res.text()
console.log(`POST ${apiBase}/api/stripe/webhook → ${res.status}`)
console.log(body)
