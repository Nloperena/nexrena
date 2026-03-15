import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import cron from 'node-cron'
import { requireAuth } from './middleware/auth'

import contactRoutes from './routes/contacts'
import projectRoutes from './routes/projects'
import invoiceRoutes from './routes/invoices'
import leadRoutes from './routes/leads'
import timeEntryRoutes from './routes/time-entries'
import proposalRoutes from './routes/proposals'
import expenseRoutes from './routes/expenses'
import subscriptionRoutes from './routes/subscriptions'
import { runDueBilling } from './lib/billing'

const app = express()
const PORT = process.env.PORT || 4000

// ── CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

// Also allow all Vercel preview deployments for nexrena projects
const VERCEL_PREVIEW_RE = /^https:\/\/nexrena[\w-]*\.vercel\.app$/

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true  // curl, Postman, server-to-server
  if (allowedOrigins.includes(origin)) return true
  if (VERCEL_PREVIEW_RE.test(origin)) return true
  return false
}

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true)
    // Log but don't throw — throwing can crash the process in some scenarios
    console.warn(`[CORS] rejected origin: ${origin}`)
    callback(null, false)
  },
  credentials: true,
}))

app.use(express.json())

// ── Rate limit on public lead endpoint ───────────────────────────────────
const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many submissions, try again later.' } })

// ── Routes ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/api/leads', leadLimiter, leadRoutes)           // POST is public, GET is auth-guarded inside
app.use('/api/contacts', requireAuth, contactRoutes)
app.use('/api/projects', requireAuth, projectRoutes)
app.use('/api/invoices', requireAuth, invoiceRoutes)
app.use('/api/time-entries', requireAuth, timeEntryRoutes)
app.use('/api/proposals', requireAuth, proposalRoutes)
app.use('/api/expenses', requireAuth, expenseRoutes)
app.use('/api/subscriptions', requireAuth, subscriptionRoutes)

// ── Global error handler ─────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Safety net — prevent unhandled rejections from crashing the process ──
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err)
})

app.listen(PORT, () => {
  console.log(`Nexrena API running on port ${PORT}`)
  // Run billing at 00:05 on the 1st of every month
  cron.schedule('5 0 1 * *', () => {
    runDueBilling()
      .then(r => console.log(`[billing] generated=${r.generated} skipped=${r.skipped} errors=${r.errors.length}`))
      .catch(err => console.error('[billing] cron error', err))
  })
})

