import type { PublicChatMessage } from './types'

export async function callGemini(
  systemPrompt: string,
  messages: PublicChatMessage[],
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 320,
      },
    }),
  })

  if (!res.ok) {
    console.error('Gemini sales assistant error:', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
}

export function isLlmConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim())
}
