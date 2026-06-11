const { PrismaClient } = require('@prisma/client')
const { randomBytes, scryptSync } = require('crypto')
const prisma = new PrismaClient()

const WARREN_CONTACT_ID = 'warren-daughtridge-ttag'
const WARREN_SUBSCRIPTION_ID = 'sub-warren-website-hosting'
const WARREN_PORTAL_EMAIL = 'warren@twoazaleagroup.com'
const WARREN_PORTAL_PASSWORD = 'WarrenDemo2026!'
const JOE_CONTACT_ID = 'joe-loperena-furniture-packages'

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function firstOfNextMonth() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

async function seed() {
  const now = new Date().toISOString()

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

  await prisma.contact.upsert({
    where: { id: JOE_CONTACT_ID },
    create: {
      id: JOE_CONTACT_ID,
      name: 'Joe Loperena',
      company: 'Furniture Packages USA',
      email: 'accounts@furniturepackagesusa.com',
      phone: '407-348-8848',
      billingAddress: '2440 Tesoro Court, Kissimmee, FL 34744',
      industry: 'other',
      stage: 'won',
      value: 0,
      notes: 'Client record for Furniture Packages USA.',
      createdAt: now,
      updatedAt: now,
    },
    update: {
      name: 'Joe Loperena',
      company: 'Furniture Packages USA',
      email: 'accounts@furniturepackagesusa.com',
      phone: '407-348-8848',
      billingAddress: '2440 Tesoro Court, Kissimmee, FL 34744',
      industry: 'other',
      stage: 'won',
      value: 0,
      notes: 'Client record for Furniture Packages USA.',
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

  await prisma.portalAccount.upsert({
    where: { email: WARREN_PORTAL_EMAIL },
    create: {
      email: WARREN_PORTAL_EMAIL,
      passwordHash: hashPassword(WARREN_PORTAL_PASSWORD),
      name: 'Warren Daughtridge',
      company: 'The Two Azalea Group, LLC',
      contactId: WARREN_CONTACT_ID,
    },
    update: {
      passwordHash: hashPassword(WARREN_PORTAL_PASSWORD),
      name: 'Warren Daughtridge',
      company: 'The Two Azalea Group, LLC',
      contactId: WARREN_CONTACT_ID,
    },
  })

  const warrenInvoiceCount = await prisma.invoice.count({ where: { contactId: WARREN_CONTACT_ID } })
  if (warrenInvoiceCount === 0) {
    const existing = await prisma.invoice.findMany({ select: { number: true } })
    const numbers = existing.map((i) => i.number)
    const nextNum = (year) => {
      const prefix = `NXR-${year}-`
      const nums = numbers.filter((n) => n.startsWith(prefix)).map((n) => parseInt(n.replace(prefix, ''), 10)).filter((n) => !isNaN(n))
      const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
      const num = `${prefix}${String(next).padStart(3, '0')}`
      numbers.push(num)
      return num
    }
    const addDays = (dateStr, days) => {
      const d = new Date(dateStr)
      d.setDate(d.getDate() + days)
      return d.toISOString().slice(0, 10)
    }
    const client = {
      clientName: 'Warren Daughtridge',
      clientCompany: 'The Two Azalea Group, LLC',
      clientEmail: WARREN_PORTAL_EMAIL,
      clientAddress: '117 Manchester Ct, Rocky Mount, NC 27803-5907',
      contactId: WARREN_CONTACT_ID,
    }
    const samples = [
      { number: nextNum(2025), projectName: 'Astro static one-pager website', status: 'paid', rate: 400, issueDate: '2025-12-18', paidDate: '2025-12-18', createdAt: '2025-12-18T12:00:00.000Z' },
      { number: nextNum(2026), projectName: 'Website Hosting', status: 'paid', rate: 20, issueDate: '2026-01-18', paidDate: '2026-01-18', createdAt: '2026-01-18T12:00:00.000Z' },
      { number: nextNum(2026), projectName: 'Website Hosting', status: 'sent', rate: 20, issueDate: '2026-02-18', paidDate: null, createdAt: '2026-02-18T12:00:00.000Z' },
    ]
    for (const s of samples) {
      await prisma.invoice.create({
        data: {
          ...client,
          id: require('crypto').randomUUID(),
          number: s.number,
          projectName: s.projectName,
          status: s.status,
          lineItems: [{ id: require('crypto').randomUUID(), description: s.projectName, quantity: 1, rate: s.rate }],
          issueDate: s.issueDate,
          dueDate: addDays(s.issueDate, 30),
          netTerms: 'net30',
          paidDate: s.paidDate,
          notes: s.projectName,
          createdAt: s.createdAt,
        },
      })
    }
    console.log(`Seed: added ${samples.length} Warren demo invoices`)
  }

  const upgradeInvoice = await prisma.invoice.findFirst({
    where: { contactId: WARREN_CONTACT_ID, projectName: 'Astro static one-pager website' },
    orderBy: { issueDate: 'desc' },
  })
  const warrenResources = [
    { id: 'res-warren-ttag-github', type: 'github', title: 'TTAG Live Website', url: 'https://github.com/Nloperena/TTAG.git', description: 'Your live Two Azalea Group website code — Astro site deployed to Vercel.', linkUpgrade: false },
    { id: 'res-warren-ttag-live', type: 'live_site', title: 'TTAG Live Site', url: 'https://ttag-fawn.vercel.app', description: 'Your public website at ttag-fawn.vercel.app.', linkUpgrade: false },
    { id: 'res-warren-ttag-upgrade', type: 'github', title: 'Website Upgrade (Astro rebuild)', url: 'https://github.com/Nloperena/LoperenaPortfolio2026/tree/main/astro-rebuild', description: 'Astro static one-pager delivered Dec 2025 — source in the LoperenaPortfolio2026 astro-rebuild folder.', linkUpgrade: true },
  ]
  for (const r of warrenResources) {
    await prisma.clientResource.upsert({
      where: { id: r.id },
      create: {
        id: r.id,
        contactId: WARREN_CONTACT_ID,
        type: r.type,
        title: r.title,
        url: r.url,
        description: r.description,
        relatedInvoiceId: r.linkUpgrade ? upgradeInvoice?.id ?? null : null,
      },
      update: {
        type: r.type,
        title: r.title,
        url: r.url,
        description: r.description,
        relatedInvoiceId: r.linkUpgrade ? upgradeInvoice?.id ?? null : null,
      },
    })
  }

  console.log('Seed complete: Warren Daughtridge + Joe Loperena contacts; Warren hosting subscription + portal account')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
