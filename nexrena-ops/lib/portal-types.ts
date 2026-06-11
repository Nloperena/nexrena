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

export type PortalInvoice = {
  id: string
  number: string
  clientName: string
  status: string
  issueDate: string
  dueDate: string
  projectName?: string | null
  lineItems: PortalInvoiceLineItem[]
  taxRate?: number | null
  paidDate?: string | null
  notes?: string | null
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
  filename: string
  contentType: string
  sizeBytes: number
  blobUrl: string
  pathname: string
  category?: PortalAssetCategory | string | null
  note?: string | null
  createdAt: string
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
