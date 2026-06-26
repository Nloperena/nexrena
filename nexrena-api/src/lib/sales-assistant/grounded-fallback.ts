import type { ChatIntent, PublicChatMessage } from './types'
import { retrieveKnowledge } from './retrieval'
import { nextQualificationQuestion } from './qualification'
import { recommendServices } from './recommendations'

/** Grounded reply when LLM unavailable — uses retrieval, not generic loops */
export function generateGroundedReply(
  userMessage: string,
  intent: ChatIntent,
  messages: PublicChatMessage[],
): string {
  const { chunks, topScore } = retrieveKnowledge(userMessage, intent, 4)

  if (intent === 'existing_customer') {
    return 'For billing, messages, and account help, sign in at nexrena.com/portal. For urgent account issues, use Messages in the portal or email through our contact page.'
  }

  if (intent === 'off_topic') {
    return "That's outside what I can help with here — I'm focused on Nexrena's web, SEO, and growth services. What are you trying to improve on your site or in search?"
  }

  if (intent === 'greeting') {
    return "Hi — I'm here to help you figure out if Nexrena is the right fit and what path makes sense. Are you exploring a new site, SEO, or a managed monthly plan?"
  }

  if (topScore >= 4 && chunks.length > 0) {
    const primary = chunks[0]
    const secondary = chunks[1]
    let reply = primary.content

    if (intent === 'pricing') {
      const pricingChunks = chunks.filter((c) => c.category === 'pricing').slice(0, 2)
      if (pricingChunks.length) reply = pricingChunks.map((c) => c.content).join(' ')
    }

    if (secondary && topScore >= 8) {
      reply += ` ${secondary.content.split('.')[0]}.`
    }

    const recs = recommendServices({}, intent)
    if (['pricing', 'web_design', 'seo'].includes(intent) && recs[0]) {
      reply += ` Likely fit: ${recs[0].service} — see nexrena.com${recs[0].href}`
    }

    const followUp = nextQualificationQuestion({})
    if (followUp && messages.filter((m) => m.role === 'user').length <= 2) {
      reply += ` ${followUp}`
    }

    return trimToSentences(reply, 6)
  }

  return "I don't have enough detail in our published materials to answer that precisely — Nico can on a quick discovery call. What's your main goal: more leads, better SEO, or a new site?"
}

function trimToSentences(text: string, maxSentences: number): string {
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  return parts.slice(0, maxSentences).join(' ')
}
