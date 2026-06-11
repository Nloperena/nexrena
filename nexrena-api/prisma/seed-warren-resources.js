const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const WARREN_CONTACT_ID = 'warren-daughtridge-ttag'
const TTAG_REPO = 'https://github.com/Nloperena/TTAG.git'
const TTAG_LIVE = 'https://ttag-fawn.vercel.app'
const ASTRO_REBUILD_REPO = 'https://github.com/Nloperena/LoperenaPortfolio2026/tree/main/astro-rebuild'
const WARREN_RESOURCES = [
  {
    id: 'res-warren-ttag-github',
    type: 'github',
    title: 'TTAG Live Website',
    url: TTAG_REPO,
    description: 'Your live Two Azalea Group website code — Astro site deployed to Vercel.',
    linkUpgradeInvoice: false,
  },
  {
    id: 'res-warren-ttag-live',
    type: 'live_site',
    title: 'TTAG Live Site',
    url: TTAG_LIVE,
    description: 'Your public website at ttag-fawn.vercel.app.',
    linkUpgradeInvoice: false,
  },
  {
    id: 'res-warren-ttag-upgrade',
    type: 'github',
    title: 'Website Upgrade (Astro rebuild)',
    url: ASTRO_REBUILD_REPO,
    description: 'Astro static one-pager delivered Dec 2025 — source in the LoperenaPortfolio2026 astro-rebuild folder.',
    linkUpgradeInvoice: true,
  },
]

async function seed() {
  const upgradeInvoice = await prisma.invoice.findFirst({
    where: {
      contactId: WARREN_CONTACT_ID,
      projectName: 'Astro static one-pager website',
    },
    orderBy: { issueDate: 'desc' },
  })

  for (const item of WARREN_RESOURCES) {
    await prisma.clientResource.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        contactId: WARREN_CONTACT_ID,
        type: item.type,
        title: item.title,
        url: item.url,
        description: item.description,
        relatedInvoiceId: item.linkUpgradeInvoice ? upgradeInvoice?.id ?? null : null,
      },
      update: {
        type: item.type,
        title: item.title,
        url: item.url,
        description: item.description,
        relatedInvoiceId: item.linkUpgradeInvoice ? upgradeInvoice?.id ?? null : null,
      },
    })
  }

  console.log('Warren client resources seeded:')
  for (const item of WARREN_RESOURCES) {
    console.log(`  - ${item.title} (${item.type})`)
  }
  if (upgradeInvoice) {
    console.log(`  - Website upgrade linked to invoice ${upgradeInvoice.number}`)
  }
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
