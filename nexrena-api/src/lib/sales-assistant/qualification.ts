import type { ChatIntent, PublicChatMessage, QualificationField, QualificationProfile } from './types'

type ExtractRule = {
  field: QualificationField
  patterns: RegExp[]
}

const EXTRACT_RULES: ExtractRule[] = [
  {
    field: 'budget',
    patterns: [
      /\b(\$[\d,]+(?:k|\/mo| per month)?|\d+k\b|under \$\d+|around \$\d+|budget (?:is|of) \$\d+)/i,
      /\b(149|249|399)\s*(?:\/mo|per month|plan)?/i,
      /\b(10k|15k|25k|30k|50k)\b/i,
    ],
  },
  {
    field: 'timeline',
    patterns: [
      /\b(asap|urgent|this month|next month|q[1-4]|within \d+ weeks?|\d+ weeks?|by (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec))/i,
    ],
  },
  {
    field: 'industry',
    patterns: [
      /\b(manufactur(?:ing|er)|industrial|e-?commerce|law firm|consulting|accounting|healthcare|contractor|hvac|plumb(?:ing|er)|restaurant|salon|real estate|saas|b2b|b2c)\b/i,
    ],
  },
  {
    field: 'goals',
    patterns: [
      /\b(more leads|increase (?:traffic|conversion|sales|rankings)|redesign|rebrand|migrate|launch|new website|seo|rank higher|generate (?:mql|pipeline))\b/i,
    ],
  },
  {
    field: 'currentWebsite',
    patterns: [
      /\b(our (?:site|website) (?:is|at)|currently (?:on|using)|wordpress site|wix site|shopify store|https?:\/\/[^\s]+)/i,
    ],
  },
  {
    field: 'painPoint',
    patterns: [
      /\b(not getting leads|slow site|outdated|embarrassing|losing rankings|no one updates|hard to edit|agency failed|no traffic)\b/i,
    ],
  },
  {
    field: 'decisionMaker',
    patterns: [/\b(i(?:'m| am) (?:the )?(?:owner|ceo|founder|marketing director|cmo|vp))/i],
  },
]

export function extractQualificationFromText(text: string): Partial<QualificationProfile> {
  const found: Partial<QualificationProfile> = {}
  for (const rule of EXTRACT_RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern)
      if (match) {
        found[rule.field] = match[0].trim().slice(0, 120)
        break
      }
    }
  }
  return found
}

export function mergeQualification(
  existing: QualificationProfile,
  incoming: Partial<QualificationProfile>,
): QualificationProfile {
  return { ...existing, ...incoming }
}

export function updateQualificationFromConversation(
  messages: PublicChatMessage[],
): QualificationProfile {
  let profile: QualificationProfile = {}
  for (const msg of messages) {
    if (msg.role !== 'user') continue
    profile = mergeQualification(profile, extractQualificationFromText(msg.content))
  }
  return profile
}

export function computeLeadScore(profile: QualificationProfile, intent: ChatIntent): number {
  let score = 0
  const weights: Record<QualificationField, number> = {
    company: 8,
    industry: 6,
    goals: 12,
    timeline: 10,
    budget: 15,
    decisionMaker: 10,
    currentWebsite: 8,
    painPoint: 10,
  }
  for (const [field, value] of Object.entries(profile)) {
    if (value) score += weights[field as QualificationField] ?? 5
  }
  if (intent === 'discovery' || intent === 'pricing') score += 8
  if (intent === 'objection') score += 5
  return Math.min(100, score)
}

export function nextQualificationQuestion(profile: QualificationProfile): string | null {
  const order: Array<{ field: QualificationField; question: string }> = [
    { field: 'goals', question: 'What outcome matters most — more leads, better SEO, or a full rebuild?' },
    { field: 'currentWebsite', question: 'Do you have a current site URL or platform I should know about?' },
    { field: 'timeline', question: 'Is there a target launch date or event driving the timeline?' },
    { field: 'budget', question: 'Are you leaning toward a monthly WaaS plan or a one-time custom build?' },
    { field: 'industry', question: 'What industry are you in? That helps me point to relevant work.' },
  ]
  for (const item of order) {
    if (!profile[item.field]) return item.question
  }
  return null
}

export function qualificationSummary(profile: QualificationProfile): string {
  const lines: string[] = []
  const labels: Record<QualificationField, string> = {
    company: 'Company',
    industry: 'Industry',
    goals: 'Goals',
    timeline: 'Timeline',
    budget: 'Budget',
    decisionMaker: 'Decision maker',
    currentWebsite: 'Current site',
    painPoint: 'Pain point',
  }
  for (const [field, label] of Object.entries(labels)) {
    const val = profile[field as QualificationField]
    if (val) lines.push(`${label}: ${val}`)
  }
  return lines.length ? lines.join('\n') : 'No qualification signals captured yet.'
}
