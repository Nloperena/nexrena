const { PrismaClient } = require('@prisma/client')
const { randomBytes, scryptSync } = require('crypto')
const prisma = new PrismaClient()

const JOE_CONTACT_ID = 'joe-loperena-furniture-packages'
const JOE_SUB_HOSTING_ID = 'sub-fpu-website-hosting'
const JOE_SUB_ANALYTICS_ID = 'sub-fpu-website-analytics'
const JOE_PORTAL_EMAIL = 'joe@furniturepackagesusa.com'
const JOE_PORTAL_PASSWORD = 'JoeDemo2026!'

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
    where: { id: JOE_CONTACT_ID },
    create: {
      id: JOE_CONTACT_ID,
      name: 'Joe',
      company: 'Furniture Packages USA',
      email: JOE_PORTAL_EMAIL,
      phone: '407-348-8848',
      billingAddress: '2440 Tesoro Court, Kissimmee, FL 34744',
      industry: 'other',
      stage: 'won',
      value: 0,
      notes: 'Portal: joe@furniturepackagesusa.com. Billing contact: accounts@furniturepackagesusa.com. Site: furniturepackagesusa.com.',
      createdAt: now,
      updatedAt: now,
    },
    update: {
      name: 'Joe',
      company: 'Furniture Packages USA',
      email: JOE_PORTAL_EMAIL,
      phone: '407-348-8848',
      billingAddress: '2440 Tesoro Court, Kissimmee, FL 34744',
      industry: 'other',
      stage: 'won',
      notes: 'Portal: joe@furniturepackagesusa.com. Billing contact: accounts@furniturepackagesusa.com. Site: furniturepackagesusa.com.',
      updatedAt: now,
    },
  })

  for (const sub of [
    {
      id: JOE_SUB_HOSTING_ID,
      description: 'Website Hosting',
      notes: 'Hosting for Furniture Packages USA (furniturepackagesusa.com).',
    },
    {
      id: JOE_SUB_ANALYTICS_ID,
      description: 'Website Analytics',
      notes: 'Analytics for Furniture Packages USA site.',
    },
  ]) {
    await prisma.subscription.upsert({
      where: { id: sub.id },
      create: {
        id: sub.id,
        contactId: JOE_CONTACT_ID,
        description: sub.description,
        amount: 20,
        interval: 'monthly',
        status: 'active',
        billingDay: 1,
        nextBillingDate: firstOfNextMonth(),
        skipNext: false,
        netTerms: 'net30',
        notes: sub.notes,
        createdAt: now,
      },
      update: {
        description: sub.description,
        amount: 20,
        interval: 'monthly',
        status: 'active',
        billingDay: 1,
        netTerms: 'net30',
        notes: sub.notes,
      },
    })
  }

  await prisma.portalAccount.upsert({
    where: { email: JOE_PORTAL_EMAIL },
    create: {
      email: JOE_PORTAL_EMAIL,
      passwordHash: hashPassword(JOE_PORTAL_PASSWORD),
      name: 'Joe',
      company: 'Furniture Packages USA',
      contactId: JOE_CONTACT_ID,
    },
    update: {
      passwordHash: hashPassword(JOE_PORTAL_PASSWORD),
      name: 'Joe',
      company: 'Furniture Packages USA',
      contactId: JOE_CONTACT_ID,
    },
  })

  for (const resource of [
    {
      id: 'res-fpu-live',
      type: 'live_site',
      title: 'Furniture Packages USA Website',
      url: 'https://furniturepackagesusa.com',
      description: 'Your public website at furniturepackagesusa.com.',
    },
    {
      id: 'res-fpu-github',
      type: 'github',
      title: 'FPUSA Website Source',
      url: 'https://github.com/Nloperena/FPUSA-NEXTJS-Template/tree/main/fpusa-astro-production',
      description: 'Astro production site source on GitHub.',
    },
  ]) {
    await prisma.clientResource.upsert({
      where: { id: resource.id },
      create: {
        ...resource,
        contactId: JOE_CONTACT_ID,
      },
      update: {
        type: resource.type,
        title: resource.title,
        url: resource.url,
        description: resource.description,
      },
    })
  }

  console.log('Joe / Furniture Packages USA seeded:')
  console.log(`  - Portal: ${JOE_PORTAL_EMAIL}`)
  console.log('  - Subscriptions: Website Hosting $20/mo, Website Analytics $20/mo')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
