import { nexrenaApi, Contact, Project, Invoice, Lead } from '../api/nexrena'
import { currency, shortDate, daysUntil, daysAgo } from '../utils/formatters'

export interface BusinessSnapshot {
  contacts: Contact[]
  projects: Project[]
  invoices: Invoice[]
  leads: Lead[]
}

export async function fetchSnapshot(): Promise<BusinessSnapshot> {
  const [contacts, projects, invoices, leads] = await Promise.all([
    nexrenaApi.contacts().catch(() => [] as Contact[]),
    nexrenaApi.projects().catch(() => [] as Project[]),
    nexrenaApi.invoices().catch(() => [] as Invoice[]),
    nexrenaApi.leads().catch(() => [] as Lead[]),
  ])
  return { contacts, projects, invoices, leads }
}

function invoiceTotal(inv: Invoice): number {
  const sub = inv.lineItems.reduce((s, l) => s + l.quantity * l.rate, 0)
  return inv.taxRate ? sub + sub * (inv.taxRate / 100) : sub
}

export function buildFullContext(snap: BusinessSnapshot): string {
  const sections: string[] = []

  const activeProjects = snap.projects.filter(p => !['delivered', 'on_hold'].includes(p.status))
  const overdueInvoices = snap.invoices.filter(i => i.status === 'overdue')
  const unpaidInvoices = snap.invoices.filter(i => i.status === 'sent')
  const activeContacts = snap.contacts.filter(c => !['won', 'lost'].includes(c.stage))
  const recentLeads = snap.leads.slice(0, 10)

  sections.push(formatProjects(activeProjects, 'Active Projects'))
  sections.push(formatPipeline(activeContacts))
  sections.push(formatInvoices(overdueInvoices, unpaidInvoices))
  if (recentLeads.length) sections.push(formatLeads(recentLeads))

  return sections.filter(Boolean).join('\n\n')
}

export function buildProjectContext(snap: BusinessSnapshot): string {
  return formatProjects(snap.projects, 'All Projects')
}

export function buildFinancialContext(snap: BusinessSnapshot): string {
  const sections: string[] = []

  const paid = snap.invoices.filter(i => i.status === 'paid')
  const sent = snap.invoices.filter(i => i.status === 'sent')
  const overdue = snap.invoices.filter(i => i.status === 'overdue')
  const draft = snap.invoices.filter(i => i.status === 'draft')

  const totalCollected = paid.reduce((s, i) => s + invoiceTotal(i), 0)
  const totalOutstanding = [...sent, ...overdue].reduce((s, i) => s + invoiceTotal(i), 0)
  const totalOverdue = overdue.reduce((s, i) => s + invoiceTotal(i), 0)

  sections.push(`### Revenue Summary
- **Total collected:** ${currency(totalCollected)}
- **Outstanding:** ${currency(totalOutstanding)}
- **Overdue:** ${currency(totalOverdue)}
- **Draft invoices:** ${draft.length}`)

  if (overdue.length) {
    sections.push('### Overdue Invoices\n' + overdue.map(i =>
      `- ${i.number} — ${i.clientName} — ${currency(invoiceTotal(i))} — due ${shortDate(i.dueDate)} (${daysAgo(i.dueDate)}d overdue)`
    ).join('\n'))
  }

  if (sent.length) {
    sections.push('### Awaiting Payment\n' + sent.map(i =>
      `- ${i.number} — ${i.clientName} — ${currency(invoiceTotal(i))} — due ${shortDate(i.dueDate)} (${daysUntil(i.dueDate)}d)`
    ).join('\n'))
  }

  return sections.join('\n\n')
}

export function buildStandupContext(snap: BusinessSnapshot): string {
  const sections: string[] = []

  const active = snap.projects.filter(p => !['delivered', 'on_hold'].includes(p.status))
  const approaching = snap.projects.filter(p => p.endDate && daysUntil(p.endDate) <= 2 && daysUntil(p.endDate) >= 0)
  const stale = snap.projects.filter(p => p.status !== 'delivered' && daysAgo(p.createdAt) > 5)
  const overdue = snap.invoices.filter(i => i.status === 'overdue')
  const followUps = snap.contacts.filter(c => ['contacted', 'proposal'].includes(c.stage) && daysAgo(c.updatedAt) > 5)

  sections.push(formatProjects(active, 'Active Projects'))
  if (approaching.length) sections.push('### Approaching Deadlines\n' + approaching.map(p => `- **${p.name}** (${p.clientName}) — due ${shortDate(p.endDate!)}`).join('\n'))
  if (stale.length) sections.push('### Stale Projects (no update 5+ days)\n' + stale.map(p => `- **${p.name}** — status: ${p.status}`).join('\n'))
  if (overdue.length) sections.push('### Overdue Invoices\n' + overdue.map(i => `- ${i.number} — ${i.clientName} — ${currency(invoiceTotal(i))}`).join('\n'))
  if (followUps.length) sections.push('### Follow-ups Due\n' + followUps.map(c => `- **${c.name}** (${c.company}) — stage: ${c.stage}, last updated ${daysAgo(c.updatedAt)}d ago`).join('\n'))

  return sections.filter(Boolean).join('\n\n')
}

function formatProjects(projects: Project[], title: string): string {
  if (!projects.length) return `### ${title}\nNo projects found.`
  return `### ${title}\n` + projects.map(p => {
    const deadline = p.endDate ? ` — due ${shortDate(p.endDate)}` : ''
    return `- **${p.name}** (${p.clientName}) — ${p.status} — ${currency(p.value)}${deadline}`
  }).join('\n')
}

function formatPipeline(contacts: Contact[]): string {
  if (!contacts.length) return '### Sales Pipeline\nPipeline is empty — consider an outreach sprint.'
  return '### Sales Pipeline\n' + contacts.map(c =>
    `- **${c.name}** @ ${c.company} — stage: ${c.stage} — est. ${currency(c.value)}`
  ).join('\n')
}

function formatInvoices(overdue: Invoice[], unpaid: Invoice[]): string {
  const lines: string[] = ['### Invoice Status']
  if (overdue.length) lines.push(`**${overdue.length} OVERDUE:** ` + overdue.map(i => `${i.number} (${i.clientName}, ${currency(invoiceTotal(i))})`).join(', '))
  if (unpaid.length) lines.push(`**${unpaid.length} awaiting payment:** ` + unpaid.map(i => `${i.number} (${i.clientName})`).join(', '))
  if (!overdue.length && !unpaid.length) lines.push('All invoices up to date.')
  return lines.join('\n')
}

function formatLeads(leads: Lead[]): string {
  return '### Recent Leads\n' + leads.map(l =>
    `- **${l.name}**${l.company ? ` @ ${l.company}` : ''} — ${l.email} — ${shortDate(l.createdAt)}`
  ).join('\n')
}
