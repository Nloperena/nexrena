import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import type { UIMessage } from 'ai'
import { requirePortalAuth } from '../middleware/portal-auth'
import { streamCopilotToExpress } from '../lib/copilot/agent'
import type { CopilotContext } from '../lib/copilot/types'

const router = Router()

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: 'Too many AI requests, try again later.' },
  keyGenerator: (req) => req.portalUser?.accountId ?? req.ip ?? 'unknown',
})

/** POST /api/portal/ai/chat */
router.post('/chat', requirePortalAuth, aiLimiter, async (req, res) => {
  const { messages, currentPath } = req.body as {
    messages?: UIMessage[]
    currentPath?: string
  }

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  const user = req.portalUser!
  const ctx: CopilotContext = {
    userId: user.accountId,
    persona: 'client',
    contactId: user.contactId,
    accountId: user.accountId,
    currentPath: currentPath || '/',
  }

  try {
    await streamCopilotToExpress(res, ctx, messages)
  } catch (err) {
    console.error('Portal copilot chat error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Could not generate a response. Try again shortly.' })
    }
  }
})

export default router
