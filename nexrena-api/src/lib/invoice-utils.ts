type LineItem = { quantity: number; rate: number; taxable?: boolean }

export type InvoicePhase = 'deposit' | 'balance' | 'full' | 'subscription'

export function nextInvoiceNumber(existing: string[]): string {
  const year = new Date().getFullYear()
  const prefix = `NXR-${year}-`
  const nums = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.replace(prefix, ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

export function invoicePhaseLabel(phase: InvoicePhase | string | null | undefined): string | null {
  switch (phase) {
    case 'deposit':
      return 'Project deposit (50%)'
    case 'balance':
      return 'Final payment (50%) — due on completion'
    case 'subscription':
      return 'Subscription'
    case 'full':
      return null
    default:
      return null
  }
}

export function checkoutProductName(invoice: {
  number: string
  invoicePhase?: string | null
  projectName?: string | null
}): string {
  const phaseLabel = invoicePhaseLabel(invoice.invoicePhase)
  if (phaseLabel) return phaseLabel
  return `Invoice ${invoice.number}`
}

export function invoiceSubtotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)
}

export function invoiceTaxAmount(lineItems: LineItem[], taxRate?: number | null): number {
  if (!taxRate || taxRate <= 0) return 0
  const taxable = lineItems
    .filter((item) => item.taxable)
    .reduce((sum, item) => sum + item.quantity * item.rate, 0)
  return taxable * (taxRate / 100)
}

export function invoiceTotal(lineItems: LineItem[], taxRate?: number | null): number {
  return invoiceSubtotal(lineItems) + invoiceTaxAmount(lineItems, taxRate)
}

/** Prisma filter: invoices visible to a signed-in portal client */
export function portalInvoiceWhere(contactId: string, email: string) {
  return {
    AND: [
      {
        OR: [
          { contactId },
          { clientEmail: { equals: email, mode: 'insensitive' as const } },
        ],
      },
      { status: { notIn: ['draft', 'cancelled'] } },
    ],
  }
}

export function parseLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (item): item is LineItem =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as LineItem).quantity === 'number' &&
      typeof (item as LineItem).rate === 'number',
  )
}
