/**
 * Upsert CRM contact for NicoLoperena.com form submissions.
 * Run on Heroku after deploying sites.ts: heroku run node scripts/ensure-nicoloperena-contact.mjs -a nexrena-api
 */
import { PrismaClient } from '@prisma/client'

const CONTACT_ID = 'nicholas-loperena-portfolio'
const prisma = new PrismaClient()

async function main() {
  const now = new Date().toISOString()
  await prisma.contact.upsert({
    where: { id: CONTACT_ID },
    create: {
      id: CONTACT_ID,
      name: 'Nicholas Loperena',
      company: 'NicoLoperena.com',
      email: 'nicholasloperena@gmail.com',
      industry: 'professional',
      stage: 'won',
      value: 0,
      notes: 'Personal portfolio site — form leads from nicoloperena.com intake modal.',
      createdAt: now,
      updatedAt: now,
    },
    update: {
      name: 'Nicholas Loperena',
      company: 'NicoLoperena.com',
      email: 'nicholasloperena@gmail.com',
      notes: 'Personal portfolio site — form leads from nicoloperena.com intake modal.',
      updatedAt: now,
    },
  })
  console.log(`Contact ${CONTACT_ID} ready.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
