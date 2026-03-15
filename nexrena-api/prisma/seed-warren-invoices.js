const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')
const prisma = new PrismaClient()

const WARREN_CONTACT_ID = 'warren-daughtridge-ttag'
const WARREN_SUBSCRIPTION_ID = 'sub-warren-website-hosting'

function nextNumber(existing, year) {
  const prefix = `NXR-${year}-`
  const nums = existing
    .filter((n) => n.startsWith(prefix))
    .map((n) => parseInt(n.replace(prefix, ''), 10))
    .filter((n) => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

async function seed() {
  const contact = await prisma.contact.findUnique({ where: { id: WARREN_CONTACT_ID } })
  if (!contact) {
    throw new Error('Warren contact not found. Run main seed first.')
  }

  const existing = await prisma.invoice.findMany({ select: { number: true } })
  const numbers = existing.map((i) => i.number)

  const n2025_1 = nextNumber(numbers, 2025)
  numbers.push(n2025_1)
  const n2026_1 = nextNumber(numbers, 2026)
  numbers.push(n2026_1)
  const n2026_2 = nextNumber(numbers, 2026)
  numbers.push(n2026_2)
  const n2026_3 = nextNumber(numbers, 2026)
  numbers.push(n2026_3)

  const client = {
    clientName: contact.name,
    clientCompany: contact.company,
    clientEmail: contact.email,
    clientAddress: contact.billingAddress,
    contactId: contact.id,
  }

  const invoices = [
    {
      ...client,
      id: crypto.randomUUID(),
      number: n2025_1,
      projectName: 'Astro static one-pager website',
      status: 'paid',
      lineItems: [
        {
          id: crypto.randomUUID(),
          description: 'Astro static one-pager website',
          quantity: 1,
          rate: 400,
        },
      ],
      issueDate: '2025-12-18',
      dueDate: addDays('2025-12-18', 30),
      netTerms: 'net30',
      paidDate: '2025-12-18',
      notes: 'Website delivered Dec 2025. Paid in full.',
      createdAt: '2025-12-18T12:00:00.000Z',
    },
    {
      ...client,
      id: crypto.randomUUID(),
      number: n2026_1,
      projectName: 'Website Hosting',
      status: 'paid',
      lineItems: [
        { id: crypto.randomUUID(), description: 'Website Hosting', quantity: 1, rate: 20 },
      ],
      issueDate: '2026-01-18',
      dueDate: addDays('2026-01-18', 30),
      netTerms: 'net30',
      paidDate: '2026-01-18',
      notes: 'Monthly hosting — January 2026',
      createdAt: '2026-01-18T12:00:00.000Z',
    },
    {
      ...client,
      id: crypto.randomUUID(),
      number: n2026_2,
      projectName: 'Website Hosting',
      status: 'paid',
      lineItems: [
        { id: crypto.randomUUID(), description: 'Website Hosting', quantity: 1, rate: 20 },
      ],
      issueDate: '2026-02-18',
      dueDate: addDays('2026-02-18', 30),
      netTerms: 'net30',
      paidDate: '2026-02-18',
      notes: 'Monthly hosting — February 2026',
      createdAt: '2026-02-18T12:00:00.000Z',
    },
    {
      ...client,
      id: crypto.randomUUID(),
      number: n2026_3,
      projectName: 'Website Hosting',
      status: 'draft',
      lineItems: [
        { id: crypto.randomUUID(), description: 'Website Hosting', quantity: 1, rate: 20 },
      ],
      issueDate: '2026-03-18',
      dueDate: addDays('2026-03-18', 30),
      netTerms: 'net30',
      paidDate: null,
      notes: 'Monthly hosting — March 2026. Due March 18th.',
      createdAt: new Date().toISOString(),
    },
  ]

  for (const inv of invoices) {
    await prisma.invoice.create({ data: inv })
  }

  await prisma.subscription.update({
    where: { id: WARREN_SUBSCRIPTION_ID },
    data: {
      billingDay: 18,
      nextBillingDate: '2026-04-18',
    },
  })

  console.log('Warren invoice history added:')
  console.log('  - NXR-2025-xxx: Astro website $400 (Dec 2025, paid)')
  console.log('  - NXR-2026-xxx: Hosting Jan $20 (paid), Feb $20 (paid), Mar $20 (draft — send this one)')
  console.log('  - Subscription set to billing day 18, next due April 18')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
