import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import type { UIMessage } from 'ai'
import { streamCopilotToExpress } from '../lib/copilot/agent'
import type { CopilotContext } from '../lib/copilot/types'
import { executeConfirmedAction } from '../lib/copilot/executor'

const router = Router()

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Too many AI requests, try again later.' },
})

function teamContext(currentPath: string): CopilotContext {
  return {
    userId: 'team',
    persona: 'team',
    currentPath: currentPath || '/',
  }
}

/** POST /api/ops/ai/chat */
router.post('/ai/chat', aiLimiter, async (req, res) => {
  const { messages, currentPath } = req.body as {
    messages?: UIMessage[]
    currentPath?: string
  }

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  try {
    await streamCopilotToExpress(res, teamContext(currentPath ?? '/'), messages)
  } catch (err) {
    console.error('Ops copilot chat error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Copilot stream failed' })
    }
  }
})

/** POST /api/ops/ai/confirm — HMAC-confirmed high-risk actions (no LLM) */
router.post('/ai/confirm', aiLimiter, async (req, res) => {
  const { token, currentPath } = req.body as { token?: string; currentPath?: string }
  if (!token) {
    res.status(400).json({ error: 'token is required' })
    return
  }

  const ctx = teamContext(currentPath ?? '/')
  const result = await executeConfirmedAction(token, ctx)
  res.json(result)
})

export default router
