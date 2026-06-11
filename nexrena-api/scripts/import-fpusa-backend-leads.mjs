/**
 * One-time / repeatable import of fpusa-backend Heroku contact_submissions
 * into nexrena form_submissions (siteKey: fpusa).
 *
 * Usage (production):
 *   FPUSA_DATABASE_URL="<fpusa-backend DATABASE_URL>" node scripts/import-fpusa-backend-leads.mjs
 */
import pg from 'pg'
import { PrismaClient } from '@prisma/client'

const JOE_CONTACT_ID = 'joe-loperena-furniture-packages'
const SITE_KEY = 'fpusa'

const fpusaUrl = process.env.FPUSA_DATABASE_URL
if (!fpusaUrl) {
  console.error('FPUSA_DATABASE_URL is required (fpusa-backend Heroku DATABASE_URL).')
  process.exit(1)
}

const pgClient = new pg.Client({
  connectionString: fpusaUrl,
  ssl: { rejectUnauthorized: false },
})
const prisma = new PrismaClient()

function fullName(row) {
  return [row.first_name, row.last_name].filter(Boolean).join(' ').trim()
}

async function main() {
  await pgClient.connect()

  const { rows } = await pgClient.query(`
    SELECT id, first_name, last_name, email, phone, message, source, created_at
    FROM contact_submissions
    ORDER BY created_at ASC
  `)

  console.log(`Found ${rows.length} rows in fpusa-backend contact_submissions`)

  let imported = 0
  let skipped = 0

  const existingRows = await prisma.formSubmission.findMany({
    where: { siteKey: SITE_KEY },
    select: { fields: true },
  })
  const alreadyImported = new Set(
    existingRows
      .map((r) => {
        const f = r.fields
        return f && typeof f === 'object' && !Array.isArray(f)
          ? f.importedFromFpusaBackendId
          : null
      })
      .filter((id) => typeof id === 'string'),
  )

  for (const row of rows) {
    const legacyId = String(row.id)
    if (alreadyImported.has(legacyId)) {
      skipped++
      continue
    }
    const submitterName = fullName(row) || row.email
    const submitterEmail = String(row.email).trim().toLowerCase()
    const fields = {
      phone: row.phone ?? '',
      message: row.message ?? '',
      source: row.source ?? 'astro-contact',
      importedFromFpusaBackendId: legacyId,
    }

    await prisma.formSubmission.create({
      data: {
        contactId: JOE_CONTACT_ID,
        siteKey: SITE_KEY,
        formName: 'contact',
        submitterName,
        submitterEmail,
        fields,
        pageUrl: null,
        status: 'read',
        createdAt: row.created_at ?? new Date(),
      },
    })
    imported++
  }

  console.log(`Done. Imported ${imported}, skipped ${skipped} (already present).`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await pgClient.end()
    await prisma.$disconnect()
  })
