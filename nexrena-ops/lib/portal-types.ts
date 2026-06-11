export type PortalAccount = {
  id: string
  email: string
  name: string
  company: string | null
  contactId: string
  createdAt?: string
}

export type PortalProject = {
  id: string
  name: string
  clientName: string
  status: string
  type: string
  value: number
  startDate: string
  endDate?: string | null
}

export type PortalInvoiceLineItem = {
  id?: string
  description?: string
  quantity: number
  rate: number
  taxable?: boolean
}

export type InvoicePhase = 'deposit' | 'balance' | 'full' | 'subscription'

export type PortalInvoice = {
  id: string
  number: string
  clientName: string
  status: string
  issueDate: string
  dueDate: string
  projectName?: string | null
  projectId?: string | null
  lineItems: PortalInvoiceLineItem[]
  taxRate?: number | null
  paidDate?: string | null
  notes?: string | null
  invoicePhase?: InvoicePhase | string | null
  depositOfInvoiceId?: string | null
  total: number
}

export type PortalProposal = {
  id: string
  title: string
  status: string
  validUntil: string
  clientName: string
}

export type ServiceRequestStatus = 'new' | 'reviewing' | 'quoted' | 'accepted' | 'declined' | 'closed'

export type PortalAssetCategory = 'logo' | 'photos' | 'documents' | 'other'

export type PortalAsset = {
  id: string
  contactId: string
  serviceRequestId?: string | null
  projectId?: string | null
  folderId?: string | null
  filename: string
  contentType: string
  sizeBytes: number
  blobUrl: string
  pathname: string
  category?: PortalAssetCategory | string | null
  note?: string | null
  createdAt: string
}

export type PortalFolder = {
  id: string
  contactId: string
  name: string
  parentId: string | null
  createdAt: string
}

export type MessageAttachment = {
  id: string
  messageId: string
  filename: string
  mimeType: string
  sizeBytes: number
  pathname: string
  createdAt: string
}

export type PortalMessage = {
  id: string
  subject: string
  message: string
  status: string
  threadId: string
  replyToMessageId?: string | null
  direction: 'client' | 'admin'
  readByClient: boolean
  readByAdmin: boolean
  createdAt: string
  attachments?: MessageAttachment[]
}

export type PortalMessageThread = {
  threadId: string
  subject: string
  updatedAt: string
  lastMessagePreview?: string
  unreadByClient: number
  unreadByAdmin: number
  messages: PortalMessage[]
}

export type PortalServiceRequest = {
  id: string
  contactId: string
  projectType: string
  description: string
  budget?: string | null
  timeline?: string | null
  status: ServiceRequestStatus
  source: string
  createdAt: string
  updatedAt: string
  assets?: PortalAsset[]
}

export type PortalSubscription = {
  id: string
  contactId: string
  description: string
  amount: number
  interval: string
  status: string
  nextBillingDate: string
}

export type PortalFormSubmission = {
  id: string
  siteKey: string
  formName: string
  submitterName: string
  submitterEmail: string
  fields: Record<string, unknown>
  pageUrl?: string | null
  status: string
  createdAt: string
}
