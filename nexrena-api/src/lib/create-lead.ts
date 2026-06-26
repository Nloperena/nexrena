import { prisma } from './prisma'
import { notifyNewLead } from './notify'

export type CreateLeadInput = {
  name: string
  email: string
  message: string
  company?: string | null
  budget?: string | null
  projectType?: string | null
  source?: string
}

export async function createLead(input: CreateLeadInput) {
  const lead = await prisma.lead.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      message: input.message.trim(),
      company: input.company?.trim() || null,
      budget: input.budget?.trim() || null,
      projectType: input.projectType?.trim() || null,
      source: input.source?.trim() || 'website',
      status: 'new',
    },
  })

  notifyNewLead({
    name: lead.name,
    email: lead.email,
    message: lead.message,
    company: lead.company ?? undefined,
    budget: lead.budget ?? undefined,
    projectType: lead.projectType ?? undefined,
  }).catch(() => {})

  return lead
}
