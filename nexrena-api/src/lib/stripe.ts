import Stripe from 'stripe'

let stripeClient: Stripe | null | undefined

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(): Stripe | null {
  if (stripeClient !== undefined) return stripeClient
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    stripeClient = null
    return null
  }
  stripeClient = new Stripe(key, {
    apiVersion: '2025-04-30.basil',
  })
  return stripeClient
}

export function portalReturnUrl(path = '/?tab=sign-in'): string {
  const base = process.env.PORTAL_URL || 'https://nexrena-ops.vercel.app'
  return `${base.replace(/\/$/, '')}${path}`
}
