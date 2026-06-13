import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { requirePortalAuth } from '../middleware/portal-auth'
import { generatePortalAiReply } from '../lib/portal-ai'

const router = Router()

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Too many AI requests, try again later.' },
  keyGenerator: (req) => req.portalUser?.accountId ?? req.ip ?? 'unknown',
})

/** POST /api/portal/ai/chat */
router.post('/chat', requirePortalAuth, aiLimiter, async (req, res) => {
  const { messages } = req.body as { messages?: unknown }

  if (!messages) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  try {
    const result = await generatePortalAiReply(req.portalUser!.accountId, messages)
    res.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI request failed'
    if (msg === 'messages must include at least one user message') {
      res.status(400).json({ error: msg })
      return
    }
    if (msg === 'Account not found') {
      res.status(404).json({ error: msg })
      return
    }
    console.error('Portal AI chat error:', err)
    res.status(500).json({ error: 'Could not generate a response. Try again shortly.' })
  }
})

export default router
