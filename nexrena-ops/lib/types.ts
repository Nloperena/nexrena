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
export type InvoicePhase = 'deposit' | 'balance' | 'full' | 'subscription'

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  taxable?: boolean
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
  invoicePhase?: InvoicePhase
  depositOfInvoiceId?: string
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

export interface PortalAccount {
  id: string
  email: string
  name: string
  company?: string | null
  contactId: string
  createdAt: string
  updatedAt: string
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
  projectId?: string
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

// ── Subscriptions ─────────────────────────────────────────────────────────

export type SubscriptionInterval = 'monthly' | 'quarterly' | 'annually'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'

export interface Subscription {
  id: string
  contactId: string
  contactName?: string
  contactCompany?: string
  description: string
  amount: number
  interval: SubscriptionInterval
  status: SubscriptionStatus
  billingDay: number
  nextBillingDate: string
  skipNext: boolean
  netTerms?: string
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

// ── Portal service requests ──────────────────────────────────────────────

export type ServiceRequestStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'closed'

export interface PortalAssetRecord {
  id: string
  contactId: string
  contactName?: string
  contactCompany?: string
  contactEmail?: string
  serviceRequestId?: string | null
  folderId?: string | null
  filename: string
  contentType: string
  sizeBytes: number
  blobUrl: string
  pathname: string
  category?: string | null
  note?: string | null
  createdAt: string
}

export interface PortalFolderRecord {
  id: string
  contactId: string
  contactName?: string
  contactCompany?: string
  contactEmail?: string
  name: string
  parentId: string | null
  createdAt: string
}

export interface ServiceRequest {
  id: string
  contactId: string
  contactName?: string
  contactCompany?: string
  contactEmail?: string
  portalAccountId?: string | null
  projectType: string
  description: string
  budget?: string | null
  timeline?: string | null
  status: ServiceRequestStatus
  source: string
  createdAt: string
  updatedAt: string
  assets?: PortalAssetRecord[]
}

// ── Client portal messages ───────────────────────────────────────────────

export type ClientMessageStatus = 'unread' | 'read'

export interface MessageAttachmentRecord {
  id: string
  messageId: string
  filename: string
  mimeType: string
  sizeBytes: number
  pathname: string
  createdAt: string
}

export interface ClientMessage {
  id: string
  portalAccountId?: string | null
  contactId?: string | null
  clientName?: string | null
  clientEmail?: string | null
  companyName?: string | null
  subject: string
  message: string
  status: ClientMessageStatus
  threadId: string
  replyToMessageId?: string | null
  direction: 'client' | 'admin'
  readByClient: boolean
  readByAdmin: boolean
  createdAt: string
  attachments?: MessageAttachmentRecord[]
}

export interface MessageThread {
  threadId: string
  subject: string
  clientName?: string | null
  clientEmail?: string | null
  companyName?: string | null
  contactId?: string | null
  updatedAt: string
  lastMessagePreview?: string
  unreadByClient: number
  unreadByAdmin: number
  messages: ClientMessage[]
}

// ── Client website form submissions ────────────────────────────────────────

export type FormSubmissionStatus = 'new' | 'read'

export interface FormSubmission {
  id: string
  contactId: string
  siteKey: string
  formName: string
  submitterName: string
  submitterEmail: string
  fields: Record<string, unknown>
  pageUrl?: string | null
  status: FormSubmissionStatus
  createdAt: string
}

// ── Client portal resources ────────────────────────────────────────────────

export type ClientResourceType = 'github' | 'live_site' | 'staging'

export interface ClientResourceRecord {
  id: string
  contactId: string
  type: ClientResourceType
  title: string
  url: string
  description?: string | null
  relatedInvoiceId?: string | null
  createdAt: string
  contactName?: string
  contactCompany?: string
  contactEmail?: string
}
