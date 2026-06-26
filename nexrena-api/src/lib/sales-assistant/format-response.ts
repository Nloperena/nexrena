import type { ChatIntent } from './types'

/** Strip markdown and normalize text for plain chat display */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.+?)\]\([^)]+\)/g, '$1')
}

function ensureCompleteEnding(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (/[.!?]$/.test(trimmed)) return trimmed

  const lastStop = Math.max(
    trimmed.lastIndexOf('.'),
    trimmed.lastIndexOf('!'),
    trimmed.lastIndexOf('?'),
  )
  if (lastStop > trimmed.length * 0.55) {
    return trimmed.slice(0, lastStop + 1).trim()
  }
  return `${trimmed.replace(/[,;:—-]+$/, '')}.`
}

function toShortParagraphs(text: string): string {
  const cleaned = stripMarkdown(text)
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Collapse single newlines inside paragraphs (LLM line wraps)
  const blocks = cleaned.split(/\n\n+/).map((block) =>
    block.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ').trim(),
  )

  return blocks.filter(Boolean).slice(0, 3).join('\n\n')
}

const PLAN_PITCH =
  'Most businesses we work with choose the Growth plan at $249/mo — 5 pages, hosting, analytics, and 60 minutes of edits included.'

export function formatAssistantMessage(raw: string, intent?: ChatIntent): string {
  let text = toShortParagraphs(raw)
  text = ensureCompleteEnding(text)

  // Remove weak trailing filler the model often adds
  text = text.replace(/\s*(?:which you can find|see our (?:website|pricing page)|learn more on our site)[^.]*\.?$/i, '')

  const isSalesIntent =
    intent &&
    ['pricing', 'waas', 'local_business', 'greeting', 'general', 'services_overview', 'web_design'].includes(
      intent,
    )

  if (isSalesIntent && !/\$249|\$149|\$399|growth plan|launch plan|lead engine/i.test(text)) {
    text = text ? `${text}\n\n${PLAN_PITCH}` : PLAN_PITCH
  }

  if (isSalesIntent && !/pricing page|get started|schedule|compare plans|which plan/i.test(text)) {
    text = `${text}\n\nCompare plans on our pricing page, or tell me your business type and I will recommend the right tier.`
  }

  return ensureCompleteEnding(toShortParagraphs(text))
}
