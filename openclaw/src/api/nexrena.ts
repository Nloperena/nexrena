import { config } from '../config'

interface Contact {
  id: string; name: string; company: string; email: string; phone?: string
  billingAddress?: string; industry: string; stage: string; value: number
  notes?: string; createdAt: string; updatedAt: string
}

interface Project {
  id: string; name: string; clientName: string; contactId?: string
  type: string; status: string; startDate: string; endDate?: string
  value: number; phases: unknown[]; notes?: string; createdAt: string
}

interface Invoice {
  id: string; number: string; clientName: string; clientCompany?: string
  clientEmail?: string; clientAddress?: string; contactId?: string
  projectId?: string; projectName?: string; status: string
  lineItems: { description: string; quantity: number; rate: number }[]
  issueDate: string; dueDate: string; netTerms?: string
  taxRate?: number; paidDate?: string; notes?: string; createdAt: string
}

interface Lead {
  id: string; name: string; company?: string; email: string
  budget?: string; projectType?: string; message: string
  source: string; createdAt: string
}

async function request<T>(method: string, path: string): Promise<T> {
  const res = await fetch(`${config.api.url}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(config.api.key ? { Authorization: `Bearer ${config.api.key}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`API ${method} ${path} → ${res.status}`)
  return res.json() as Promise<T>
}

export const nexrenaApi = {
  contacts:  () => request<Contact[]>('GET', '/contacts'),
  projects:  () => request<Project[]>('GET', '/projects'),
  invoices:  () => request<Invoice[]>('GET', '/invoices'),
  leads:     () => request<Lead[]>('GET', '/leads'),
}

export type { Contact, Project, Invoice, Lead }
