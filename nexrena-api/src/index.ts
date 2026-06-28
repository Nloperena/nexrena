import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import cron from 'node-cron'
import { createHandler } from 'graphql-http/lib/use/express'
import { NoSchemaIntrospectionCustomRule } from 'graphql'
import { requireAuth } from './middleware/auth'
import { root as graphqlRoot, schema as graphqlSchema } from './graphql'

import contactRoutes from './routes/contacts'
import opsAiRoutes from './routes/ops-ai'
import projectRoutes from './routes/projects'
import invoiceRoutes from './routes/invoices'
import leadRoutes from './routes/leads'
import timeEntryRoutes from './routes/time-entries'
import proposalRoutes from './routes/proposals'
import expenseRoutes from './routes/expenses'
import subscriptionRoutes from './routes/subscriptions'
import portalRoutes from './routes/portal'
import serviceRequestRoutes from './routes/service-requests'
import portalAssetsOpsRoutes from './routes/portal-assets-ops'
import messageRoutes from './routes/messages'
import resourceRoutes from './routes/resources'
import stripeWebhookRoutes from './routes/stripe-webhook'
import formRoutes from './routes/forms'
import publicChatRoutes from './routes/public-chat'
import chatIngestRoutes from './routes/chat-ingest'
import chatSessionsOpsRoutes from './routes/chat-sessions-ops'
import portalFormSubmissionRoutes from './routes/portal-form-submissions'
import portalWebsiteMediaOpsRoutes from './routes/portal-website-media-ops'
import { handleOpsMessageStream, handlePortalMessageStream } from './lib/message-stream'
import { runDueBilling } from './lib/billing'
import { allSiteOrigins } from './lib/sites'

const app = express()
const PORT = process.env.PORT || 4000
app.disable('x-powered-by')
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  const requiredVars = ['API_KEY', 'DATABASE_URL']
  const missing = requiredVars.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// ── CORS ─────────────────────────────────────────────────────────────────
const allowedOrigins = [
  ...(process.env.CORS_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean),
  ...allSiteOrigins(),
]

// Also allow Vercel preview deployments for nexrena and TTAG projects
const VERCEL_PREVIEW_RE = /^https:\/\/(nexrena|ttag)[\w-]*\.vercel\.app$/

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

// Stripe webhook needs raw body — mount before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRoutes)

app.use(express.json({ limit: '1mb' }))

// ── Rate limit on public lead endpoint ───────────────────────────────────
const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many submissions, try again later.' } })
const portalAuthLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: { error: 'Too many attempts, try again later.' } })
const chatLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, message: { error: 'Too many chat messages, try again later.' } })
const graphqlLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, message: { error: 'Too many GraphQL requests, try again later.' } })

// ── Routes ───────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.all(
  '/api/graphql',
  graphqlLimiter,
  requireAuth,
  createHandler({
    schema: graphqlSchema,
    rootValue: graphqlRoot,
    validationRules: isProduction ? [NoSchemaIntrospectionCustomRule] : [],
  }),
)

app.use('/api/leads', leadLimiter, leadRoutes)           // POST is public, GET is auth-guarded inside
app.use('/api/forms', leadLimiter, formRoutes)           // POST /submit public; GET/PATCH auth inside
app.use('/api/chat', chatLimiter, publicChatRoutes)      // Public website chatbot (Gemini)
app.use('/api/chat-ingest', requireAuth, chatIngestRoutes) // Record-only ingest for external assistants (FPUSA Jax)
app.use('/api/chat-sessions', requireAuth, chatSessionsOpsRoutes)
app.use('/api/portal', portalAuthLimiter, portalRoutes) // register/login public; rest portal-auth inside
app.use('/api/service-requests', requireAuth, serviceRequestRoutes)
app.use('/api/portal-assets', requireAuth, portalAssetsOpsRoutes)
app.use('/api/portal-website-media', requireAuth, portalWebsiteMediaOpsRoutes)
app.use('/api/resources', requireAuth, resourceRoutes)
app.get('/api/messages/stream', handleOpsMessageStream)
app.get('/api/portal/messages/stream', handlePortalMessageStream)
app.use('/api/messages', requireAuth, messageRoutes)
app.use('/api/ops', requireAuth, opsAiRoutes)
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

