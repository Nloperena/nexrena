'use client'
import { useState, useEffect, useCallback } from 'react'
import { Contact, Project, Invoice } from './types'

// ── seed data ────────────────────────────────────────────────────────────
const SEED_CONTACTS: Contact[] = [
  {
    id: 'c1', name: 'Marcus Webb', company: 'Ironclad Industrial', email: 'marcus@ironclad.com',
    industry: 'industrial', stage: 'discovery', value: 18000, phone: '407-555-0101',
    notes: 'Needs full catalog rebuild. Has old WordPress site from 2016.',
    createdAt: '2026-03-01T10:00:00Z', updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'c2', name: 'Sandra Reyes', company: 'Coastal Commerce Co.', email: 'sreyes@coastalco.com',
    industry: 'ecommerce', stage: 'proposal', value: 24000, phone: '305-555-0182',
    notes: 'Magento 1 → headless migration. Hot lead.',
    createdAt: '2026-03-03T09:00:00Z', updatedAt: '2026-03-05T14:00:00Z',
  },
  {
    id: 'c3', name: 'Tom Garland', company: 'Garland Property Group', email: 'tom@garlandpg.com',
    industry: 'realestate', stage: 'contacted', value: 12000,
    notes: 'Wants SEO retainer. Portal-dependent for leads.',
    createdAt: '2026-03-06T11:00:00Z', updatedAt: '2026-03-06T11:00:00Z',
  },
]

const SEED_PROJECTS: Project[] = [
  {
    id: 'p1', name: 'Ironclad Industrial — Website Rebuild', clientName: 'Ironclad Industrial',
    contactId: 'c1', type: 'web', status: 'discovery', value: 18000,
    startDate: '2026-03-10', endDate: '2026-04-25',
    phases: [
      { id: 'ph1', name: 'Discovery', tasks: [
        { id: 't1', title: 'Brand & competitor audit', status: 'todo' },
        { id: 't2', title: 'Sitemap + page structure', status: 'todo' },
        { id: 't3', title: 'Kick-off call', status: 'todo' },
      ]},
      { id: 'ph2', name: 'Design', tasks: [
        { id: 't4', title: 'Wireframes — key pages', status: 'todo' },
        { id: 't5', title: 'Visual design mockups', status: 'todo' },
        { id: 't6', title: 'Client design approval', status: 'todo' },
      ]},
      { id: 'ph3', name: 'Build', tasks: [
        { id: 't7', title: 'Next.js scaffold + CMS setup', status: 'todo' },
        { id: 't8', title: 'Product catalog build', status: 'todo' },
        { id: 't9', title: 'SEO on-page optimization', status: 'todo' },
      ]},
      { id: 'ph4', name: 'Launch', tasks: [
        { id: 't10', title: 'QA across devices', status: 'todo' },
        { id: 't11', title: 'Client review + revisions', status: 'todo' },
        { id: 't12', title: 'Go-live + redirect setup', status: 'todo' },
      ]},
    ],
    notes: 'Deposit invoice sent. Awaiting payment before kickoff.',
    createdAt: '2026-03-08T10:00:00Z',
  },
]

const SEED_INVOICES: Invoice[] = [
  {
    id: 'i1', number: 'NX-001', clientName: 'Legacy Client', status: 'paid',
    lineItems: [
      { id: 'li1', description: 'Monthly retainer — web & SEO management', quantity: 1, rate: 2500 },
    ],
    issueDate: '2026-03-01', dueDate: '2026-03-08', paidDate: '2026-03-06',
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'i2', number: 'NX-002', clientName: 'Ironclad Industrial', contactId: 'c1', projectId: 'p1',
    status: 'sent',
    lineItems: [
      { id: 'li2', description: 'Website Rebuild — 50% deposit', quantity: 1, rate: 9000 },
    ],
    issueDate: '2026-03-08', dueDate: '2026-03-15',
    notes: 'Remaining 50% due at project completion.',
    createdAt: '2026-03-08T11:00:00Z',
  },
]

// ── storage helpers ───────────────────────────────────────────────────────
function load<T>(key: string, seed: T): T {
  if (typeof window === 'undefined') return seed
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : seed
  } catch { return seed }
}

function save<T>(key: string, data: T) {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// ── hooks ────────────────────────────────────────────────────────────────
export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  useEffect(() => { setContacts(load('nx_contacts', SEED_CONTACTS)) }, [])
  const update = useCallback((data: Contact[]) => { setContacts(data); save('nx_contacts', data) }, [])
  const add = useCallback((c: Contact) => update([...contacts, c]), [contacts, update])
  const edit = useCallback((c: Contact) => update(contacts.map(x => x.id === c.id ? c : x)), [contacts, update])
  const remove = useCallback((id: string) => update(contacts.filter(x => x.id !== id)), [contacts, update])
  return { contacts, add, edit, remove }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  useEffect(() => { setProjects(load('nx_projects', SEED_PROJECTS)) }, [])
  const update = useCallback((data: Project[]) => { setProjects(data); save('nx_projects', data) }, [])
  const add = useCallback((p: Project) => update([...projects, p]), [projects, update])
  const edit = useCallback((p: Project) => update(projects.map(x => x.id === p.id ? p : x)), [projects, update])
  const remove = useCallback((id: string) => update(projects.filter(x => x.id !== id)), [projects, update])
  return { projects, add, edit, remove }
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  useEffect(() => { setInvoices(load('nx_invoices', SEED_INVOICES)) }, [])
  const update = useCallback((data: Invoice[]) => { setInvoices(data); save('nx_invoices', data) }, [])
  const add = useCallback((i: Invoice) => update([...invoices, i]), [invoices, update])
  const edit = useCallback((i: Invoice) => update(invoices.map(x => x.id === i.id ? i : x)), [invoices, update])
  const remove = useCallback((id: string) => update(invoices.filter(x => x.id !== id)), [invoices, update])
  return { invoices, add, edit, remove }
}

// ── utils ────────────────────────────────────────────────────────────────
export function genId() { return Math.random().toString(36).slice(2, 10) }
export function formatCurrency(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n) }
export function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
