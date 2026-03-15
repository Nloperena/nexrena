/** Shared project-defaults used by the proposal→project conversion. */

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

type TaskStatus = 'todo'

interface Task { id: string; title: string; status: TaskStatus }
interface Phase { id: string; name: string; tasks: Task[] }

const webPhases = (): Phase[] => [
  { id: makeId(), name: 'Discovery', tasks: [
    { id: makeId(), title: 'Brand & competitor audit', status: 'todo' },
    { id: makeId(), title: 'Sitemap + page structure', status: 'todo' },
    { id: makeId(), title: 'Kick-off call completed', status: 'todo' },
  ]},
  { id: makeId(), name: 'Strategy', tasks: [
    { id: makeId(), title: 'Wireframes delivered', status: 'todo' },
    { id: makeId(), title: 'Client strategy approval', status: 'todo' },
  ]},
  { id: makeId(), name: 'Execution', tasks: [
    { id: makeId(), title: 'Development build', status: 'todo' },
    { id: makeId(), title: 'Content integration', status: 'todo' },
    { id: makeId(), title: 'SEO on-page setup', status: 'todo' },
  ]},
  { id: makeId(), name: 'Delivery', tasks: [
    { id: makeId(), title: 'QA across devices', status: 'todo' },
    { id: makeId(), title: 'Client review round', status: 'todo' },
    { id: makeId(), title: 'Launch + go-live', status: 'todo' },
  ]},
]

const seoPhases = (): Phase[] => [
  { id: makeId(), name: 'Discovery', tasks: [
    { id: makeId(), title: 'Technical SEO audit', status: 'todo' },
    { id: makeId(), title: 'Keyword research', status: 'todo' },
    { id: makeId(), title: 'Competitor analysis', status: 'todo' },
  ]},
  { id: makeId(), name: 'Strategy', tasks: [
    { id: makeId(), title: 'SEO roadmap delivered', status: 'todo' },
    { id: makeId(), title: 'Client approval', status: 'todo' },
  ]},
  { id: makeId(), name: 'Execution', tasks: [
    { id: makeId(), title: 'On-page optimizations', status: 'todo' },
    { id: makeId(), title: 'Content brief + publishing', status: 'todo' },
    { id: makeId(), title: 'Link building outreach', status: 'todo' },
  ]},
  { id: makeId(), name: 'Monthly Review', tasks: [
    { id: makeId(), title: 'Monthly report delivered', status: 'todo' },
    { id: makeId(), title: 'Strategy adjustment', status: 'todo' },
  ]},
]

export type ProjectType = 'web' | 'seo' | 'both'

const SEO_TERMS = /seo|search|growth|content|retainer|audit/i
const WEB_TERMS = /web|design|develop|shopify|astro|next\.?js|headless|commerce/i

export function inferProjectType(serviceDescriptions: string[]): ProjectType {
  const combined = serviceDescriptions.join(' ')
  const hasSeo = SEO_TERMS.test(combined)
  const hasWeb = WEB_TERMS.test(combined)
  if (hasSeo && hasWeb) return 'both'
  if (hasSeo) return 'seo'
  return 'web'
}

export function buildPhases(type: ProjectType): Phase[] {
  if (type === 'seo') return seoPhases()
  if (type === 'both') return [...webPhases(), ...seoPhases()].slice(0, 4)
  return webPhases()
}

export function buildProjectNotes(scopeOfWork: string, timeline?: string | null, notes?: string | null): string {
  const parts: string[] = []
  if (scopeOfWork) parts.push(`Scope of Work:\n${scopeOfWork}`)
  if (timeline) parts.push(`Timeline: ${timeline}`)
  if (notes) parts.push(`Notes:\n${notes}`)
  return parts.join('\n\n')
}
