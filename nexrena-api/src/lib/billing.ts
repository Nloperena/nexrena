import { prisma } from './prisma'
import { randomUUID } from 'crypto'

type BillingResult = { generated: number; skipped: number; errors: string[] }

function advanceDate(dateStr: string, interval: string): string {
  const d = new Date(dateStr)
  if (interval === 'monthly') {
    d.setMonth(d.getMonth() + 1)
  } else if (interval === 'quarterly') {
    d.setMonth(d.getMonth() + 3)
  } else if (interval === 'annually') {
    d.setFullYear(d.getFullYear() + 1)
  }
  return d.toISOString().slice(0, 10)
}

function nextInvoiceNumber(existing: string[]): string {
  const year = new Date().getFullYear()
  const prefix = `NXR-${year}-`
  const nums = existing
    .filter(n => n.startsWith(prefix))
    .map(n => parseInt(n.replace(prefix, ''), 10))
    .filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

export async function runDueBilling(): Promise<BillingResult> {
  const today = new Date().toISOString().slice(0, 10)
  const result: BillingResult = { generated: 0, skipped: 0, errors: [] }

  const dueSubs = await prisma.subscription.findMany({
    where: { status: 'active', nextBillingDate: { lte: today } },
  })

  if (dueSubs.length === 0) return result

  const existingInvoices = await prisma.invoice.findMany({ select: { number: true } })
  const existingNumbers = existingInvoices.map(i => i.number)

  for (const sub of dueSubs) {
    if (sub.skipNext) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { skipNext: false, nextBillingDate: advanceDate(sub.nextBillingDate, sub.interval) },
      })
      result.skipped++
      continue
    }

    try {
      const contact = await prisma.contact.findUnique({ where: { id: sub.contactId } })
      const invoiceNumber = nextInvoiceNumber(existingNumbers)
      existingNumbers.push(invoiceNumber)

      const issueDate = today
      const daysMap: Record<string, number> = { net15: 15, net30: 30 }
      const days = sub.netTerms ? (daysMap[sub.netTerms] ?? 15) : 15
      const dueD = new Date(issueDate)
      dueD.setDate(dueD.getDate() + days)
      const dueDate = dueD.toISOString().slice(0, 10)

      await prisma.invoice.create({
        data: {
          id: randomUUID(),
          number: invoiceNumber,
          clientName: contact?.name ?? 'Unknown',
          clientCompany: contact?.company ?? undefined,
          clientEmail: contact?.email ?? undefined,
          clientAddress: contact?.billingAddress ?? undefined,
          contactId: sub.contactId,
          status: 'draft',
          lineItems: [{ id: randomUUID(), description: sub.description, quantity: 1, rate: sub.amount }],
          issueDate,
          dueDate,
          netTerms: sub.netTerms ?? 'net15',
          notes: `Auto-generated from subscription: ${sub.description}`,
          createdAt: new Date().toISOString(),
        },
      })

      await prisma.subscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: advanceDate(sub.nextBillingDate, sub.interval) },
      })

      result.generated++
    } catch (err) {
      result.errors.push(`Sub ${sub.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return result
}
