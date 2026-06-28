import { Router } from 'express'
import { logChatTurn } from '../lib/sales-assistant/analytics'
import type { QualificationProfile } from '../lib/sales-assistant/types'
import { getSiteConfig } from '../lib/sites'

const router = Router()

/**
 * POST /api/chat-ingest
 *
 * Record-only ingest for externally-hosted site assistants (e.g. FPUSA's "Jax",
 * which runs on its own backend). Stores the REAL visitor message + the REAL
 * assistant reply as a chat session/turns so the conversation shows up in the
 * ops inbox exactly like a native chat — without re-generating a reply.
 *
 * Auth: Authorization: Bearer <API_KEY> (applied at mount).
 */
router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const siteKey = typeof body.siteKey === 'string' ? body.siteKey : 'nexrena'
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
  const userMessage = typeof body.userMessage === 'string' ? body.userMessage : ''
  const assistantReply = typeof body.assistantReply === 'string' ? body.assistantReply : ''
  const pageUrl = typeof body.pageUrl === 'string' ? body.pageUrl : undefined
  const quoteReady = body.quoteReady === true
  const qualification =
    body.qualification && typeof body.qualification === 'object'
      ? (body.qualification as QualificationProfile)
      : undefined

  if (!getSiteConfig(siteKey)) {
    res.status(400).json({ error: `Unknown siteKey: ${siteKey}` })
    return
  }
  if (!sessionId || !userMessage || !assistantReply) {
    res.status(400).json({ error: 'sessionId, userMessage, and assistantReply are required' })
    return
  }

  // Sequential so the user turn is timestamped before the assistant turn.
  await logChatTurn({
    sessionId,
    siteKey,
    pageUrl,
    role: 'user',
    content: userMessage,
    qualification,
    leadScore: quoteReady ? 50 : undefined,
  })
  await logChatTurn({
    sessionId,
    siteKey,
    pageUrl,
    role: 'assistant',
    content: assistantReply,
    qualification,
    grounded: true,
    leadScore: quoteReady ? 50 : undefined,
  })

  res.json({ ok: true, sessionId })
})

export default router
