import { companyKnowledge } from './company'
import { servicesKnowledge } from './services'
import { pricingKnowledge } from './pricing'
import { portfolioKnowledge } from './portfolio'
import { faqKnowledge } from './faqs'
import { processKnowledge, objectionsKnowledge, policiesKnowledge } from './process'
import type { KnowledgeChunk, KnowledgeCategory } from '../types'

export const ALL_KNOWLEDGE_CHUNKS: KnowledgeChunk[] = [
  ...companyKnowledge,
  ...servicesKnowledge,
  ...pricingKnowledge,
  ...portfolioKnowledge,
  ...faqKnowledge,
  ...processKnowledge,
  ...objectionsKnowledge,
  ...policiesKnowledge,
]

export function chunksByCategory(category: KnowledgeCategory): KnowledgeChunk[] {
  return ALL_KNOWLEDGE_CHUNKS.filter((c) => c.category === category)
}

export function chunkById(id: string): KnowledgeChunk | undefined {
  return ALL_KNOWLEDGE_CHUNKS.find((c) => c.id === id)
}
