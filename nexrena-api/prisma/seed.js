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

  console.log('Seed complete: Warren Daughtridge + Joe Loperena contacts; Warren hosting subscription + portal account')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
