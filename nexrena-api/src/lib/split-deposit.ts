import { randomUUID } from 'crypto'
import { prisma } from './prisma'
import { nextInvoiceNumber } from './invoice-utils'

export type InvoicePhase = 'deposit' | 'balance' | 'full' | 'subscription'

export type SplitDepositInput = {
  total: number
  projectId: string
  contactId: string
  description?: string
  taxRate?: number
  netTerms?: string
}

export type SplitDepositResult = {
  deposit: Awaited<ReturnType<typeof prisma.invoice.create>>
  balance: Awaited<ReturnType<typeof prisma.invoice.create>>
}

function halfAmount(total: number): number {
  return Math.round(total * 50) / 100
}

export async function createSplitDepositInvoices(
  input: SplitDepositInput,
): Promise<SplitDepositResult> {
  const { total, projectId, contactId, description, taxRate, netTerms } = input

  if (!total || total <= 0) {
    throw new Error('total must be greater than zero')
  }
  if (!projectId || !contactId) {
    throw new Error('projectId and contactId are required')
  }

  const [contact, project, existingNumbers] = await Promise.all([
    prisma.contact.findUnique({ where: { id: contactId } }),
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.invoice.findMany({ select: { number: true } }),
  ])

  if (!contact) throw new Error('Contact not found')
  if (!project) throw new Error('Project not found')

  const depositAmount = halfAmount(total)
  const balanceAmount = Math.round((total - depositAmount) * 100) / 100
  const projectLabel = project.name
  const serviceDesc = description ?? `${projectLabel} — project services`
  const today = new Date().toISOString().slice(0, 10)
  const createdAt = new Date().toISOString()

  const depositNumber = nextInvoiceNumber(existingNumbers.map((i) => i.number))
  const balanceNumber = nextInvoiceNumber([...existingNumbers.map((i) => i.number), depositNumber])

  const depositId = randomUUID()
  const balanceId = randomUUID()

  const deposit = await prisma.invoice.create({
    data: {
      id: depositId,
      number: depositNumber,
      clientName: contact.name,
      clientCompany: contact.company,
      clientEmail: contact.email,
      clientAddress: contact.billingAddress ?? undefined,
      contactId,
      projectId,
      projectName: projectLabel,
      status: 'sent',
      invoicePhase: 'deposit',
      lineItems: [
        {
          id: randomUUID(),
          description: `Project deposit (50%) — ${serviceDesc}`,
          quantity: 1,
          rate: depositAmount,
          taxable: false,
        },
      ],
      issueDate: today,
      dueDate: today,
      netTerms: netTerms ?? 'net15',
      taxRate: taxRate ?? null,
      notes: '50% deposit due at project start. Balance invoice sent on delivery.',
      createdAt,
    },
  })

  const balance = await prisma.invoice.create({
    data: {
      id: balanceId,
      number: balanceNumber,
      clientName: contact.name,
      clientCompany: contact.company,
      clientEmail: contact.email,
      clientAddress: contact.billingAddress ?? undefined,
      contactId,
      projectId,
      projectName: projectLabel,
      status: 'draft',
      invoicePhase: 'balance',
      depositOfInvoiceId: depositId,
      lineItems: [
        {
          id: randomUUID(),
          description: `Final payment (50%) — ${serviceDesc}`,
          quantity: 1,
          rate: balanceAmount,
          taxable: false,
        },
      ],
      issueDate: today,
      dueDate: today,
      netTerms: netTerms ?? 'net15',
      taxRate: taxRate ?? null,
      notes: '50% balance due on project completion. Sent when project is marked delivered.',
      createdAt,
    },
  })

  return { deposit, balance }
}

export async function deliverProjectAndSendBalance(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) throw new Error('Project not found')

  const balanceInvoice = await prisma.invoice.findFirst({
    where: {
      projectId,
      invoicePhase: 'balance',
      status: 'draft',
    },
    orderBy: { createdAt: 'desc' },
  })

  const today = new Date().toISOString().slice(0, 10)
  const daysMap: Record<string, number> = { net15: 15, net30: 30 }
  const netTerms = balanceInvoice?.netTerms ?? 'net15'
  const dueDays = daysMap[netTerms] ?? 15
  const dueD = new Date(today)
  dueD.setDate(dueD.getDate() + dueDays)
  const dueDate = dueD.toISOString().slice(0, 10)

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      status: 'delivered',
      endDate: today,
    },
  })

  let sentBalance = null
  if (balanceInvoice) {
    sentBalance = await prisma.invoice.update({
      where: { id: balanceInvoice.id },
      data: {
        status: 'sent',
        issueDate: today,
        dueDate,
      },
    })
  }

  return { project: updatedProject, balanceInvoice: sentBalance }
}
