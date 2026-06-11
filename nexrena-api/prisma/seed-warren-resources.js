const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const WARREN_CONTACT_ID = 'warren-daughtridge-ttag'
const TTAG_LIVE = 'https://www.thetwoazaleagroup.com'
const ASTRO_REBUILD_REPO = 'https://github.com/Nloperena/LoperenaPortfolio2026/tree/main/astro-rebuild'
const WARREN_RESOURCES = [
  {
    id: 'res-warren-ttag-live',
    type: 'live_site',
    title: 'Two Azalea Group Website',
    url: TTAG_LIVE,
    description: 'Your public website at thetwoazaleagroup.com.',
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
  await prisma.clientResource.deleteMany({ where: { id: 'res-warren-ttag-github' } })

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
