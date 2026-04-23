import { buildSchema } from 'graphql'
import { prisma } from './lib/prisma'

const clamp = (value: number | undefined, min: number, max: number, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.max(min, Math.min(max, value))
}

const parseJson = (value: unknown) => JSON.stringify(value ?? null)
const nowIso = () => new Date().toISOString()

const requireText = (value: unknown, field: string, maxLength = 200) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} is required`)
  }
  const normalized = value.trim()
  if (normalized.length > maxLength) {
    throw new Error(`${field} must be <= ${maxLength} characters`)
  }
  return normalized
}

const optionalText = (value: unknown, field: string, maxLength = 200) => {
  if (value == null) return null
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string`)
  }
  const normalized = value.trim()
  if (!normalized) return null
  if (normalized.length > maxLength) {
    throw new Error(`${field} must be <= ${maxLength} characters`)
  }
  return normalized
}

const requireNumber = (value: unknown, field: string, min = 0, max = 1_000_000_000) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${field} must be a valid number`)
  }
  if (value < min || value > max) {
    throw new Error(`${field} must be between ${min} and ${max}`)
  }
  return value
}

const parseJsonString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} must be a JSON string`)
  }
  try {
    return JSON.parse(value)
  } catch {
    throw new Error(`${field} is not valid JSON`)
  }
}

export const schema = buildSchema(`
  type Query {
    health: Health!
    contacts(limit: Int = 50, offset: Int = 0): [Contact!]!
    projects(limit: Int = 50, offset: Int = 0): [Project!]!
    invoices(limit: Int = 50, offset: Int = 0): [Invoice!]!
    leads(limit: Int = 50, offset: Int = 0): [Lead!]!
    timeEntries(limit: Int = 50, offset: Int = 0): [TimeEntry!]!
    proposals(limit: Int = 50, offset: Int = 0): [Proposal!]!
    subscriptions(limit: Int = 50, offset: Int = 0): [Subscription!]!
    expenses(limit: Int = 50, offset: Int = 0): [Expense!]!
  }

  type Mutation {
    createContact(input: CreateContactInput!): Contact!
    createProject(input: CreateProjectInput!): Project!
    updateProjectStatus(input: UpdateProjectStatusInput!): Project!
  }

  input CreateContactInput {
    id: String!
    name: String!
    company: String!
    email: String!
    phone: String
    billingAddress: String
    industry: String!
    stage: String!
    value: Float = 0
    notes: String
  }

  input CreateProjectInput {
    id: String!
    name: String!
    clientName: String!
    contactId: String
    type: String!
    status: String!
    startDate: String!
    endDate: String
    value: Float = 0
    phases: String!
    notes: String
  }

  input UpdateProjectStatusInput {
    id: String!
    status: String!
    endDate: String
  }

  type Health {
    status: String!
  }

  type Contact {
    id: String!
    name: String!
    company: String!
    email: String!
    phone: String
    billingAddress: String
    industry: String!
    stage: String!
    value: Float!
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type Project {
    id: String!
    name: String!
    clientName: String!
    contactId: String
    type: String!
    status: String!
    startDate: String!
    endDate: String
    value: Float!
    phases: String!
    notes: String
    createdAt: String!
  }

  type Invoice {
    id: String!
    number: String!
    clientName: String!
    clientCompany: String
    clientEmail: String
    clientAddress: String
    contactId: String
    projectId: String
    projectName: String
    status: String!
    lineItems: String!
    issueDate: String!
    dueDate: String!
    netTerms: String
    taxRate: Float
    paidDate: String
    notes: String
    createdAt: String!
  }

  type Lead {
    id: String!
    name: String!
    company: String
    email: String!
    budget: String
    projectType: String
    message: String!
    source: String!
    status: String!
    createdAt: String!
  }

  type TimeEntry {
    id: String!
    projectId: String
    projectName: String!
    description: String!
    hours: Float!
    date: String!
    billable: Boolean!
    billed: Boolean!
    createdAt: String!
  }

  type Proposal {
    id: String!
    title: String!
    contactId: String
    projectId: String
    clientName: String!
    clientCompany: String
    clientEmail: String
    services: String!
    discount: Float!
    status: String!
    validUntil: String!
    scopeOfWork: String!
    timeline: String
    notes: String
    createdAt: String!
  }

  type Subscription {
    id: String!
    contactId: String!
    description: String!
    amount: Float!
    interval: String!
    status: String!
    billingDay: Int!
    nextBillingDate: String!
    skipNext: Boolean!
    netTerms: String
    notes: String
    createdAt: String!
  }

  type Expense {
    id: String!
    projectId: String
    projectName: String
    category: String!
    description: String!
    amount: Float!
    date: String!
    vendor: String
    notes: String
    createdAt: String!
  }
`)

export const root = {
  health: () => ({ status: 'ok' }),

  contacts: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    prisma.contact.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    }),

  projects: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    (await prisma.project.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    })).map((project) => ({ ...project, phases: parseJson(project.phases) })),

  invoices: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    (await prisma.invoice.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    })).map((invoice) => ({ ...invoice, lineItems: parseJson(invoice.lineItems) })),

  leads: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    (await prisma.lead.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    })).map((lead) => ({ ...lead, createdAt: lead.createdAt.toISOString() })),

  timeEntries: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    prisma.timeEntry.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    }),

  proposals: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    (await prisma.proposal.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    })).map((proposal) => ({ ...proposal, services: parseJson(proposal.services) })),

  subscriptions: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    prisma.subscription.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    }),

  expenses: async ({ limit, offset }: { limit?: number; offset?: number }) =>
    prisma.expense.findMany({
      take: clamp(limit, 1, 100, 50),
      skip: Math.max(offset ?? 0, 0),
      orderBy: { createdAt: 'desc' },
    }),

  createContact: async ({ input }: { input: Record<string, unknown> }) => {
    const timestamp = nowIso()
    return prisma.contact.create({
      data: {
        id: requireText(input.id, 'id', 64),
        name: requireText(input.name, 'name', 120),
        company: requireText(input.company, 'company', 140),
        email: requireText(input.email, 'email', 180),
        phone: optionalText(input.phone, 'phone', 40) ?? undefined,
        billingAddress: optionalText(input.billingAddress, 'billingAddress', 300) ?? undefined,
        industry: requireText(input.industry, 'industry', 100),
        stage: requireText(input.stage, 'stage', 100),
        value: requireNumber(input.value ?? 0, 'value'),
        notes: optionalText(input.notes, 'notes', 3000) ?? undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    })
  },

  createProject: async ({ input }: { input: Record<string, unknown> }) => {
    const project = await prisma.project.create({
      data: {
        id: requireText(input.id, 'id', 64),
        name: requireText(input.name, 'name', 140),
        clientName: requireText(input.clientName, 'clientName', 140),
        contactId: optionalText(input.contactId, 'contactId', 64) ?? undefined,
        type: requireText(input.type, 'type', 100),
        status: requireText(input.status, 'status', 100),
        startDate: requireText(input.startDate, 'startDate', 50),
        endDate: optionalText(input.endDate, 'endDate', 50) ?? undefined,
        value: requireNumber(input.value ?? 0, 'value'),
        phases: parseJsonString(input.phases, 'phases'),
        notes: optionalText(input.notes, 'notes', 3000) ?? undefined,
        createdAt: nowIso(),
      },
    })
    return { ...project, phases: parseJson(project.phases) }
  },

  updateProjectStatus: async ({ input }: { input: Record<string, unknown> }) => {
    const project = await prisma.project.update({
      where: { id: requireText(input.id, 'id', 64) },
      data: {
        status: requireText(input.status, 'status', 100),
        endDate: optionalText(input.endDate, 'endDate', 50) ?? undefined,
      },
    })
    return { ...project, phases: parseJson(project.phases) }
  },
}
