export type PublicChatRole = 'user' | 'assistant'

export type PublicChatMessage = {
  role: PublicChatRole
  content: string
}

const MESSAGE_MAX = 500
const HISTORY_MAX = 8
const MIN_MESSAGE_LEN = 2

const SYSTEM_PROMPT = `You are the Nexrena website assistant — a helpful, concise guide for visitors exploring Nexrena, a premium B2B digital growth agency.

You can help visitors:
- Understand Nexrena's services (web design, SEO, full-service growth, WaaS)
- Learn about pricing approach and how to get started
- Point them to the contact form, schedule page, or portal for next steps

Rules:
- Never invent specific prices, project timelines, or client names.
- Keep replies short (2–4 sentences unless the visitor asks for detail).
- Use a warm, professional tone matching Nexrena's premium brand.
- If they want a quote or to start a project, suggest the contact page or scheduling a call.
- Do not discuss unrelated topics at length — gently redirect to Nexrena services.`

function sanitizeMessages(raw: unknown): PublicChatMessage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (m): m is PublicChatMessage =>
        typeof m === 'object' &&
        m !== null &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    )
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MESSAGE_MAX) }))
    .filter((m) => m.content.length >= MIN_MESSAGE_LEN)
    .slice(-HISTORY_MAX)
}

function fallbackReply(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  if (/hello|hi|hey|good (morning|afternoon|evening)/.test(lower)) {
    return "Hello! I'm the Nexrena assistant. I can help you learn about our web design, SEO, and growth services. What are you looking to build or improve?"
  }

  if (/price|cost|budget|how much|rate/.test(lower)) {
    return 'Pricing depends on scope — websites, SEO retainers, and full-service growth plans are tailored to each client. Visit our Pricing page or contact us with your project details for a custom quote.'
  }

  if (/seo|search|rank|google/.test(lower)) {
    return 'Nexrena offers technical SEO, content strategy, and ongoing optimization for B2B brands. We focus on sustainable organic growth, not quick fixes. Want to discuss your current site?'
  }

  if (/web|website|design|redesign|build/.test(lower)) {
    return 'We design premium B2B websites — from marketing sites to headless builds with strong performance and conversion focus. Tell me about your industry and goals, or head to Contact to start a conversation.'
  }

  if (/contact|call|meeting|schedule|talk|reach/.test(lower)) {
    return 'You can reach us through the Contact page on this site or book a call on our Schedule page. Nico and the team typically respond within one business day.'
  }

  if (/portal|client|login|account/.test(lower)) {
    return 'Existing clients can sign in at nexrena.com/portal. For account or billing questions, use Messages inside the portal or contact us directly.'
  }

  return "I'm here to help you learn about Nexrena's digital growth services. Ask about web design, SEO, pricing, or how to get started — or use Contact to speak with the team directly."
}

async function callGemini(messages: PublicChatMessage[]): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 400,
      },
    }),
  })

  if (!res.ok) {
    console.error('Gemini public chat error:', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  return text || null
}

export function isPublicChatConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}

export function validatePublicChatInput(rawMessages: unknown): PublicChatMessage[] {
  const messages = sanitizeMessages(rawMessages)
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) {
    throw new Error('messages must include at least one user message')
  }
  return messages
}

export async function generatePublicChatReply(
  rawMessages: unknown,
): Promise<{ message: string; configured: boolean }> {
  const messages = validatePublicChatInput(rawMessages)
  const lastUser = messages.filter((m) => m.role === 'user').at(-1)!
  const configured = isPublicChatConfigured()

  let message: string | null = null
  if (configured) {
    message = await callGemini(messages)
  }

  if (!message) {
    message = fallbackReply(lastUser.content)
  }

  return { message, configured }
}
