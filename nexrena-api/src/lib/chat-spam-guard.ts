/** In-memory spam guards for public chat (resets on process restart). */

const COOLDOWN_MS = 2500
const DAILY_CAP = 30
const DAY_MS = 24 * 60 * 60 * 1000

type IpRecord = { lastAt: number; dayStart: number; dayCount: number }

const ipRecords = new Map<string, IpRecord>()

function pruneStale(now: number) {
  if (ipRecords.size < 5000) return
  for (const [ip, rec] of ipRecords) {
    if (now - rec.lastAt > DAY_MS) ipRecords.delete(ip)
  }
}

export type SpamCheckResult =
  | { ok: true }
  | { ok: false; status: number; error: string }

export function checkChatSpam(ip: string): SpamCheckResult {
  const now = Date.now()
  pruneStale(now)

  const rec = ipRecords.get(ip) ?? { lastAt: 0, dayStart: now, dayCount: 0 }

  if (now - rec.dayStart > DAY_MS) {
    rec.dayStart = now
    rec.dayCount = 0
  }

  if (rec.dayCount >= DAILY_CAP) {
    return { ok: false, status: 429, error: 'Daily chat limit reached. Try again tomorrow or contact us directly.' }
  }

  if (now - rec.lastAt < COOLDOWN_MS) {
    return { ok: false, status: 429, error: 'Please wait a moment before sending another message.' }
  }

  rec.lastAt = now
  rec.dayCount += 1
  ipRecords.set(ip, rec)
  return { ok: true }
}

export function isLikelyBot(body: Record<string, unknown>): boolean {
  const honeypot = body._hp
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) return true
  if (typeof honeypot === 'number' && honeypot !== 0) return true

  const messages = body.messages
  if (!Array.isArray(messages) || messages.length === 0) return false

  const last = messages[messages.length - 1] as { content?: string } | undefined
  const content = typeof last?.content === 'string' ? last.content : ''

  // Obvious spam patterns
  if (/https?:\/\//i.test(content) && content.length > 200) return true
  if ((content.match(/[A-Z]/g)?.length ?? 0) > content.length * 0.7 && content.length > 80) return true

  return false
}

export const BOT_REPLY =
  "Thanks for your message! If you'd like to discuss a project, visit our Contact page or schedule a call."
