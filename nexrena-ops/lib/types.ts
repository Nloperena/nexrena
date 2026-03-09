export type DealStage = 'lead' | 'contacted' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost'

export interface Contact {
  id: string
  name: string
  company: string
  email: string
  phone?: string
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

export interface Invoice {
  id: string
  number: string
  clientName: string
  contactId?: string
  projectId?: string
  status: InvoiceStatus
  lineItems: InvoiceLineItem[]
  issueDate: string
  dueDate: string
  paidDate?: string
  notes?: string
  createdAt: string
}
