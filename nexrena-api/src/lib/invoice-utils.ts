type LineItem = { quantity: number; rate: number; taxable?: boolean }

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
