export type DealStage = 'lead' | 'contacted' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Contact {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  billingAddress?: string
  industry: 'industrial' | 'ecommerce' | 'realestate' | 'professional' | 'other'
  stage: DealStage
  value: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = 'not_started' | 'discovery' | 'strategy' | 'execution' | 'review' | 'delivered' | 'on_hold'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  dueDate?: string
  assignee?: string
}

export interface ProjectPhase {
  id: string
  name: string
  tasks: Task[]
}

export interface Project {
  id: string
  name: string
  clientName: string
  contactId?: string
  type: 'web' | 'seo' | 'both'
  status: ProjectStatus
  startDate: string
  endDate?: string
  value: number
  phases: ProjectPhase[]
  notes?: string
  createdAt: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

export type NetTerms = 'net15' | 'net30' | 'custom'

export interface Invoice {
  id: string
  number: string
  clientName: string
  clientCompany?: string
  clientEmail?: string
  clientAddress?: string
  contactId?: string
  projectId?: string
  projectName?: string
  status: InvoiceStatus
  lineItems: InvoiceLineItem[]
  issueDate: string
  dueDate: string
  netTerms?: NetTerms
  taxRate?: number
  paidDate?: string
  notes?: string
  createdAt: string
}

// ── Website Leads ────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost'

export interface Lead {
  id: string
  name: string
  company?: string
  email: string
  budget?: string
  projectType?: string
  message: string
  source: string
  status: LeadStatus
  createdAt: string
}

// ── Time Entries ─────────────────────────────────────────────────────────

export interface TimeEntry {
  id: string
  projectId?: string
  projectName: string
  description: string
  hours: number
  date: string
  billable: boolean
  billed: boolean
  createdAt: string
}

// ── Proposals ────────────────────────────────────────────────────────────

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired'

export interface ProposalService {
  id: string
  description: string
  price: number
  notes?: string
}

export interface Proposal {
  id: string
  title: string
  contactId?: string
  clientName: string
  clientCompany?: string
  clientEmail?: string
  services: ProposalService[]
  discount: number
  status: ProposalStatus
  validUntil: string
  scopeOfWork: string
  timeline?: string
  notes?: string
  createdAt: string
}

// ── Expenses ─────────────────────────────────────────────────────────────

export type ExpenseCategory = 'software' | 'contractors' | 'hosting' | 'marketing' | 'office' | 'other'

export interface Expense {
  id: string
  projectId?: string
  projectName?: string
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  vendor?: string
  notes?: string
  createdAt: string
}
