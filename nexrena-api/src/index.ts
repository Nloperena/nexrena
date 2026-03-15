import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { requireAuth } from './middleware/auth'

import contactRoutes from './routes/contacts'
import projectRoutes from './routes/projects'
import invoiceRoutes from './routes/invoices'
import leadRoutes from './routes/leads'
import timeEntryRoutes from './routes/time-entries'
import proposalRoutes from './routes/proposals'
import expenseRoutes from './routes/expenses'

const app = express()
const PORT = process.env.PORT || 4000

// ── CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS: ${origin} not allowed`))
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

// ── Global error handler ─────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => console.log(`Nexrena API running on port ${PORT}`))

