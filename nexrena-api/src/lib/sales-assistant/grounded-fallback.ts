import type { ChatIntent, PublicChatMessage } from './types'
import { formatAssistantMessage } from './format-response'
import { nextQualificationQuestion } from './qualification'
import { recommendServices } from './recommendations'

const PRICING_SALES_REPLY = `We offer Website-as-a-Service from $149/mo — design, hosting, maintenance, and support included, with no huge upfront build fee.

Launch is $149/mo (up to 3 pages). Growth is $249/mo and our most popular pick: 5 pages, analytics, and 60 minutes of monthly edits. Lead Engine is $399/mo+ for businesses that want ongoing optimization.

If you are a local or growing business, I would start with Growth. Compare all tiers on our pricing page, or tell me what you do and I will confirm the fit.`

const GREETING_REPLY = `Good to meet you. I can help you find the right Nexrena plan — monthly website care from $149/mo, or custom B2B builds when you need more.

What are you trying to fix: more leads, a new site, or SEO?`

/** Grounded reply when LLM unavailable */
export function generateGroundedReply(
  userMessage: string,
  intent: ChatIntent,
  messages: PublicChatMessage[],
): string {
  if (intent === 'existing_customer') {
    return formatAssistantMessage(
      'For billing and account help, sign in at nexrena.com/portal. For urgent issues, use Messages in the portal or our contact form.',
      intent,
    )
  }

  if (intent === 'off_topic') {
    return formatAssistantMessage(
      "I focus on Nexrena websites, SEO, and growth plans. What are you trying to improve — leads, a redesign, or search visibility?",
      intent,
    )
  }

  if (intent === 'greeting') {
    return formatAssistantMessage(GREETING_REPLY, intent)
  }

  if (intent === 'pricing' || intent === 'waas' || intent === 'local_business') {
    const followUp = nextQualificationQuestion({})
    const extra =
      followUp && messages.filter((m) => m.role === 'user').length <= 2 ? `\n\n${followUp}` : ''
    return formatAssistantMessage(PRICING_SALES_REPLY + extra, intent)
  }

  const recs = recommendServices({}, intent)
  const rec = recs[0]
  if (rec) {
    return formatAssistantMessage(
      `${rec.rationale} I would look at ${rec.service}${rec.tier ? ` (${rec.tier})` : ''}.\n\nWant me to compare this with our monthly plans, or are you ready to view pricing?`,
      intent,
    )
  }

  return formatAssistantMessage(
    "I can point you to the right plan once I know your goal — more leads, a new site, or SEO. Our Growth plan at $249/mo is where most businesses start.",
    intent,
  )
}
