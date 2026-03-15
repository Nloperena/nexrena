import { ProjectPhase, Task } from './types'
import { genId } from './store'

const webPhases = (): ProjectPhase[] => [
  { id: genId(), name: 'Discovery', tasks: [
    { id: genId(), title: 'Brand & competitor audit', status: 'todo' },
    { id: genId(), title: 'Sitemap + page structure', status: 'todo' },
    { id: genId(), title: 'Kick-off call completed', status: 'todo' },
  ] as Task[] },
  { id: genId(), name: 'Strategy', tasks: [
    { id: genId(), title: 'Wireframes delivered', status: 'todo' },
    { id: genId(), title: 'Client strategy approval', status: 'todo' },
  ] as Task[] },
  { id: genId(), name: 'Execution', tasks: [
    { id: genId(), title: 'Development build', status: 'todo' },
    { id: genId(), title: 'Content integration', status: 'todo' },
    { id: genId(), title: 'SEO on-page setup', status: 'todo' },
  ] as Task[] },
  { id: genId(), name: 'Delivery', tasks: [
    { id: genId(), title: 'QA across devices', status: 'todo' },
    { id: genId(), title: 'Client review round', status: 'todo' },
    { id: genId(), title: 'Launch + go-live', status: 'todo' },
  ] as Task[] },
]

const seoPhases = (): ProjectPhase[] => [
  { id: genId(), name: 'Discovery', tasks: [
    { id: genId(), title: 'Technical SEO audit', status: 'todo' },
    { id: genId(), title: 'Keyword research', status: 'todo' },
    { id: genId(), title: 'Competitor analysis', status: 'todo' },
  ] as Task[] },
  { id: genId(), name: 'Strategy', tasks: [
    { id: genId(), title: 'SEO roadmap delivered', status: 'todo' },
    { id: genId(), title: 'Client approval', status: 'todo' },
  ] as Task[] },
  { id: genId(), name: 'Execution', tasks: [
    { id: genId(), title: 'On-page optimizations', status: 'todo' },
    { id: genId(), title: 'Content brief + publishing', status: 'todo' },
    { id: genId(), title: 'Link building outreach', status: 'todo' },
  ] as Task[] },
  { id: genId(), name: 'Monthly Review', tasks: [
    { id: genId(), title: 'Monthly report delivered', status: 'todo' },
    { id: genId(), title: 'Strategy adjustment', status: 'todo' },
  ] as Task[] },
]

export function defaultPhases(type: string): ProjectPhase[] {
  if (type === 'seo') return seoPhases()
  return webPhases()
}
