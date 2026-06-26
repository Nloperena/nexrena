import { ALL_KNOWLEDGE_CHUNKS } from './index'
import { fpusaKnowledge } from './fpusa'
import { nicoloperenaKnowledge } from './nicoloperena'
import { ttagKnowledge } from './ttag'
import type { ChatKnowledgeProfile, KnowledgeChunk } from '../types'

const BY_PROFILE: Record<ChatKnowledgeProfile, KnowledgeChunk[]> = {
  nexrena: ALL_KNOWLEDGE_CHUNKS,
  fpusa: fpusaKnowledge,
  nicoloperena: nicoloperenaKnowledge,
  ttag: ttagKnowledge,
}

export function knowledgeForProfile(profile: ChatKnowledgeProfile): KnowledgeChunk[] {
  return BY_PROFILE[profile] ?? ALL_KNOWLEDGE_CHUNKS
}
