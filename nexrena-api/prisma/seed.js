const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const WARREN_CONTACT_ID = 'warren-daughtridge-ttag'
const WARREN_SUBSCRIPTION_ID = 'sub-warren-website-hosting'

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

  console.log('Seed complete: Warren Daughtridge (contact + $20/mo Website Hosting subscription)')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
