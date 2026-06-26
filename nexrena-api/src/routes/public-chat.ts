import { Router } from 'express'
import { generateSalesAssistantReply } from '../lib/sales-assistant'
import { BOT_REPLY, checkChatSpam, isLikelyBot } from '../lib/chat-spam-guard'

const router = Router()

function clientIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() || req.ip || 'unknown'
  return req.ip ?? 'unknown'
}

/** POST /api/chat */
router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const { messages, sessionId, pageUrl } = body

  if (!messages) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  if (isLikelyBot(body)) {
    res.json({ message: BOT_REPLY, configured: true, sessionId: sessionId ?? null, actions: [] })
    return
  }

  const spam = checkChatSpam(clientIp(req))
  if (!spam.ok) {
    res.status(spam.status).json({ error: spam.error })
    return
  }

  try {
    const result = await generateSalesAssistantReply(
      {
        messages,
        sessionId: typeof sessionId === 'string' ? sessionId : undefined,
        pageUrl: typeof pageUrl === 'string' ? pageUrl : undefined,
      },
      { ip: clientIp(req) },
    )
    res.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Chat request failed'
    if (msg === 'messages must include at least one user message') {
      res.status(400).json({ error: msg })
      return
    }
    console.error('Public chat error:', err)
    res.status(500).json({ error: 'Could not generate a response. Try again shortly.' })
  }
})

export default router
