import { INTENT_CATEGORY_BOOST } from './intent'
import type { ChatIntent, ChatKnowledgeProfile, KnowledgeChunk } from './types'
import { knowledgeForProfile } from './knowledge/profiles'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
  'don', 'now', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'what',
  'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'it',
  'its', 'they', 'them', 'their', 'about', 'tell', 'know',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s$+-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

function scoreChunk(chunk: KnowledgeChunk, tokens: string[], intent: ChatIntent): number {
  let score = 0
  const haystack = `${chunk.title} ${chunk.content} ${chunk.keywords.join(' ')}`.toLowerCase()

  for (const token of tokens) {
    if (haystack.includes(token)) score += 2
    for (const kw of chunk.keywords) {
      if (kw.includes(token) || token.includes(kw)) score += 3
    }
  }

  const boosted = INTENT_CATEGORY_BOOST[intent]
  if (boosted?.includes(chunk.category)) score += 4

  return score
}

export type RetrievalResult = {
  chunks: KnowledgeChunk[]
  contextBlock: string
  topScore: number
}

export function retrieveKnowledge(
  query: string,
  intent: import('./types').ChatIntent,
  limit = 5,
  profile: ChatKnowledgeProfile = 'nexrena',
): RetrievalResult {
  const pool = knowledgeForProfile(profile)
  const tokens = tokenize(query)
  const scored = pool.map((chunk) => ({
    chunk,
    score: scoreChunk(chunk, tokens, intent),
  }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  const top = scored.slice(0, limit).map((s) => s.chunk)
  const topScore = scored[0]?.score ?? 0

  if (top.length === 0) {
    const fallback = pool.find((c) => c.id.includes('overview')) ?? pool[0]
    if (fallback) top.push(fallback)
  }

  const contextBlock = top
    .map((c) => `[${c.category.toUpperCase()} · ${c.title} · source: ${c.source}]\n${c.content}`)
    .join('\n\n')

  return { chunks: top, contextBlock, topScore }
}

export function formatRetrievalForLog(chunks: KnowledgeChunk[]): string[] {
  return chunks.map((c) => c.id)
}
