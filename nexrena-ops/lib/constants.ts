// Nexrena service catalog — used in invoice line item dropdown
export const NEXRENA_SERVICES = [
  'Web Design & Development',
  'Headless Commerce Build',
  'Shopify Development',
  'Next.js / Astro Development',
  'SEO & Search Growth',
  'Technical SEO Audit',
  'Content Strategy',
  'Full-Service Growth Retainer',
  'Discovery & Strategy Session',
  'Monthly Maintenance / Support',
] as const

export const DEFAULT_PAYMENT_TERMS =
  'Payment is due within 15 days of invoice date. Nexrena LLC accepts payment via ACH bank transfer, wire transfer, or Stripe. A 1.5% monthly late fee applies to overdue balances. Thank you for your business.'

export const NET_TERMS_OPTIONS = [
  { value: 'net15', label: 'NET 15', days: 15 },
  { value: 'net30', label: 'NET 30', days: 30 },
  { value: 'custom', label: 'Custom', days: 0 },
] as const

export const EXPENSE_CATEGORIES = [
  { value: 'software', label: 'Software & Tools' },
  { value: 'contractors', label: 'Contractors' },
  { value: 'hosting', label: 'Hosting & Domains' },
  { value: 'marketing', label: 'Marketing & Ads' },
  { value: 'office', label: 'Office & Equipment' },
  { value: 'other', label: 'Other' },
] as const
