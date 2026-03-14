import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { config } from '../config'

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey })

// In dev (tsx), __dirname is src/llm; in prod (compiled), it's dist/llm.
// The .md file lives in src/llm — resolve relative to project root for reliability.
const promptPath = path.resolve(__dirname, '..', '..', 'src', 'llm', 'system-prompt.md')
const fallbackPath = path.join(__dirname, 'system-prompt.md')
const systemPrompt = fs.readFileSync(
  fs.existsSync(promptPath) ? promptPath : fallbackPath,
  'utf-8',
)

export interface LlmMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function ask(
  userMessage: string,
  dataContext: string,
  history: LlmMessage[] = [],
): Promise<string> {
  const fullSystem = dataContext
    ? `${systemPrompt}\n\n---\n\n## CURRENT BUSINESS DATA\n\n${dataContext}`
    : systemPrompt

  const messages: LlmMessage[] = [
    ...history,
    { role: 'user', content: userMessage },
  ]

  const res = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: fullSystem,
    messages,
  })

  const block = res.content[0]
  return block.type === 'text' ? block.text : '[No text response from LLM]'
}
