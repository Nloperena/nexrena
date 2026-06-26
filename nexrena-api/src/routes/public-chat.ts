import { Router } from 'express'
import { generateSalesAssistantReply } from '../lib/sales-assistant'
import { BOT_REPLY, checkChatSpam, isLikelyBot } from '../lib/chat-spam-guard'
import { publicChatConfig, resolveSiteFromRequest } from '../lib/site-chat'

const router = Router()

function clientIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0]?.trim() || req.ip || 'unknown'
  return req.ip ?? 'unknown'
}

/** GET /api/chat/config?siteKey=fpusa — public widget branding */
router.get('/config', (req, res) => {
  const { siteKey } = resolveSiteFromRequest(req, req.query.siteKey)
  const config = publicChatConfig(siteKey)
  if (!config) {
    res.status(404).json({ error: 'Chat not enabled for this site' })
    return
  }
  res.json(config)
})

/** POST /api/chat */
router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const { messages, sessionId, pageUrl, intakeSubmit, siteKey: bodySiteKey } = body
  const { siteKey, config: site } = resolveSiteFromRequest(req, bodySiteKey)

  if (!messages && !intakeSubmit) {
    res.status(400).json({ error: 'messages array is required' })
    return
  }

  if (isLikelyBot(body)) {
    res.json({ message: BOT_REPLY, configured: true, sessionId: sessionId ?? null, siteKey, actions: [] })
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
        messages: messages ?? [],
        sessionId: typeof sessionId === 'string' ? sessionId : undefined,
        pageUrl: typeof pageUrl === 'string' ? pageUrl : undefined,
        siteKey,
        intakeSubmit:
          intakeSubmit &&
          typeof intakeSubmit === 'object' &&
          typeof (intakeSubmit as { name?: string }).name === 'string' &&
          typeof (intakeSubmit as { email?: string }).email === 'string'
            ? (intakeSubmit as {
                name: string
                email: string
                company?: string
                message?: string
              })
            : undefined,
      },
      {
        ip: clientIp(req),
        site: {
          siteKey,
          siteLabel: site.label,
          contactId: site.contactId,
          chat: site.chat,
        },
        siteConfig: site,
      },
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
