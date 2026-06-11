import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

const WARREN_CONTACT_ID = 'warren-daughtridge-ttag'
const WARREN_SUBSCRIPTION_ID = 'sub-warren-website-hosting'
const WARREN_PROJECT_ID = 'proj-warren-website-upgrade'
const WARREN_DEPOSIT_INVOICE_ID = 'inv-warren-upgrade-deposit'
const WARREN_BALANCE_INVOICE_ID = 'inv-warren-upgrade-balance'

function firstOfNextMonth(): string {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

async function seed() {
  const now = new Date().toISOString()
  const today = now.slice(0, 10)

  await prisma.contact.upsert({
    where: { id: WARREN_CONTACT_ID },
    create: {
      id: WARREN_CONTACT_ID,
      name: 'Warren Daughtridge',
      company: 'The Two Azalea Group, LLC',
      email: 'warren@twoazaleagroup.com',
      phone: '252.406.3102',
      billingAddress: '117 Manchester Ct, Rocky Mount, NC 27803-5907',
      industry: 'professional',
      stage: 'won',
      value: 0,
      notes: 'SDVOSB. President, Founder. Site: ttag-fawn.vercel.app. Suppliers: Silver Defender, Aluf Plastics, Sterillium, Clear 360, InspireAR.',
      createdAt: now,
      updatedAt: now,
    },
    update: {
      name: 'Warren Daughtridge',
      company: 'The Two Azalea Group, LLC',
      email: 'warren@twoazaleagroup.com',
      phone: '252.406.3102',
      billingAddress: '117 Manchester Ct, Rocky Mount, NC 27803-5907',
      industry: 'professional',
      stage: 'won',
      notes: 'SDVOSB. President, Founder. Site: ttag-fawn.vercel.app. Suppliers: Silver Defender, Aluf Plastics, Sterillium, Clear 360, InspireAR.',
      updatedAt: now,
    },
  })

  await prisma.subscription.upsert({
    where: { id: WARREN_SUBSCRIPTION_ID },
    create: {
      id: WARREN_SUBSCRIPTION_ID,
      contactId: WARREN_CONTACT_ID,
      description: 'Website Hosting',
      amount: 20,
      interval: 'monthly',
      status: 'active',
      billingDay: 1,
      nextBillingDate: firstOfNextMonth(),
      skipNext: false,
      netTerms: 'net30',
      notes: 'Hosting for Two Azalea Group site (ttag-fawn.vercel.app).',
      createdAt: now,
    },
    update: {
      description: 'Website Hosting',
      amount: 20,
      interval: 'monthly',
      status: 'active',
      billingDay: 1,
      netTerms: 'net30',
      notes: 'Hosting for Two Azalea Group site (ttag-fawn.vercel.app).',
    },
  })

  await prisma.project.upsert({
    where: { id: WARREN_PROJECT_ID },
    create: {
      id: WARREN_PROJECT_ID,
      name: 'TTAG Website Upgrade',
      clientName: 'Warren Daughtridge',
      contactId: WARREN_CONTACT_ID,
      type: 'web',
      status: 'execution',
      startDate: today,
      value: 2500,
      phases: [
        {
          id: randomUUID(),
          name: 'Discovery',
          tasks: [{ id: randomUUID(), title: 'Content audit', status: 'done' }],
        },
        {
          id: randomUUID(),
          name: 'Execution',
          tasks: [{ id: randomUUID(), title: 'Homepage refresh', status: 'in_progress' }],
        },
      ],
      notes: '50/50 billing: $1,250 deposit (sent) + $1,250 balance on delivery.',
      createdAt: now,
    },
    update: {
      name: 'TTAG Website Upgrade',
      clientName: 'Warren Daughtridge',
      contactId: WARREN_CONTACT_ID,
      type: 'web',
      status: 'execution',
      value: 2500,
      notes: '50/50 billing: $1,250 deposit (sent) + $1,250 balance on delivery.',
    },
  })

  await prisma.invoice.upsert({
    where: { id: WARREN_DEPOSIT_INVOICE_ID },
    create: {
      id: WARREN_DEPOSIT_INVOICE_ID,
      number: `NXR-${new Date().getFullYear()}-901`,
      clientName: 'Warren Daughtridge',
      clientCompany: 'The Two Azalea Group, LLC',
      clientEmail: 'warren@twoazaleagroup.com',
      clientAddress: '117 Manchester Ct, Rocky Mount, NC 27803-5907',
      contactId: WARREN_CONTACT_ID,
      projectId: WARREN_PROJECT_ID,
      projectName: 'TTAG Website Upgrade',
      status: 'sent',
      invoicePhase: 'deposit',
      lineItems: [
        {
          id: randomUUID(),
          description: 'Project deposit (50%) — TTAG website upgrade',
          quantity: 1,
          rate: 1250,
          taxable: false,
        },
      ],
      issueDate: today,
      dueDate: today,
      netTerms: 'net15',
      notes: '50% deposit due at project start.',
      createdAt: now,
    },
    update: {
      status: 'sent',
      invoicePhase: 'deposit',
      projectId: WARREN_PROJECT_ID,
      projectName: 'TTAG Website Upgrade',
    },
  })

  await prisma.invoice.upsert({
    where: { id: WARREN_BALANCE_INVOICE_ID },
    create: {
      id: WARREN_BALANCE_INVOICE_ID,
      number: `NXR-${new Date().getFullYear()}-902`,
      clientName: 'Warren Daughtridge',
      clientCompany: 'The Two Azalea Group, LLC',
      clientEmail: 'warren@twoazaleagroup.com',
      clientAddress: '117 Manchester Ct, Rocky Mount, NC 27803-5907',
      contactId: WARREN_CONTACT_ID,
      projectId: WARREN_PROJECT_ID,
      projectName: 'TTAG Website Upgrade',
      status: 'draft',
      invoicePhase: 'balance',
      depositOfInvoiceId: WARREN_DEPOSIT_INVOICE_ID,
      lineItems: [
        {
          id: randomUUID(),
          description: 'Final payment (50%) — TTAG website upgrade',
          quantity: 1,
          rate: 1250,
          taxable: false,
        },
      ],
      issueDate: today,
      dueDate: today,
      netTerms: 'net15',
      notes: '50% balance due on project completion. Sent when project is marked delivered.',
      createdAt: now,
    },
    update: {
      status: 'draft',
      invoicePhase: 'balance',
      depositOfInvoiceId: WARREN_DEPOSIT_INVOICE_ID,
      projectId: WARREN_PROJECT_ID,
      projectName: 'TTAG Website Upgrade',
    },
  })

  console.log('Seed complete: Warren Daughtridge (contact, hosting sub, website upgrade 50/50 invoices)')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
