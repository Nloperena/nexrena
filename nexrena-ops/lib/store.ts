'use client'
import { useState, useEffect, useCallback } from 'react'
import { Contact, Project, Invoice, Lead, TimeEntry, Proposal, Expense } from './types'
import { api } from './api'

// ── hooks ────────────────────────────────────────────────────────────────

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    api.get<Contact[]>('/contacts').then(setContacts).catch(console.error)
  }, [])

  const add = useCallback(async (c: Contact) => {
    setContacts(prev => [...prev, c])
    try { await api.post('/contacts', c) }
    catch (e) { console.error(e); setContacts(prev => prev.filter(x => x.id !== c.id)) }
  }, [])

  const edit = useCallback(async (c: Contact) => {
    setContacts(prev => prev.map(x => x.id === c.id ? c : x))
    try { await api.put(`/contacts/${c.id}`, c) }
    catch (e) { console.error(e) }
  }, [])

  const remove = useCallback(async (id: string) => {
    setContacts(prev => prev.filter(x => x.id !== id))
    try { await api.del(`/contacts/${id}`) }
    catch (e) { console.error(e) }
  }, [])

  return { contacts, add, edit, remove }
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    api.get<Project[]>('/projects').then(setProjects).catch(console.error)
  }, [])

  const add = useCallback(async (p: Project) => {
    setProjects(prev => [...prev, p])
    try { await api.post('/projects', p) }
    catch (e) { console.error(e); setProjects(prev => prev.filter(x => x.id !== p.id)) }
  }, [])

  const edit = useCallback(async (p: Project) => {
    setProjects(prev => prev.map(x => x.id === p.id ? p : x))
    try { await api.put(`/projects/${p.id}`, p) }
    catch (e) { console.error(e) }
  }, [])

  const remove = useCallback(async (id: string) => {
    setProjects(prev => prev.filter(x => x.id !== id))
    try { await api.del(`/projects/${id}`) }
    catch (e) { console.error(e) }
  }, [])

  return { projects, add, edit, remove }
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    api.get<Invoice[]>('/invoices').then(setInvoices).catch(console.error)
  }, [])

  const add = useCallback(async (i: Invoice) => {
    setInvoices(prev => [...prev, i])
    try { await api.post('/invoices', i) }
    catch (e) { console.error(e); setInvoices(prev => prev.filter(x => x.id !== i.id)) }
  }, [])

  const edit = useCallback(async (i: Invoice) => {
    setInvoices(prev => prev.map(x => x.id === i.id ? i : x))
    try { await api.put(`/invoices/${i.id}`, i) }
    catch (e) { console.error(e) }
  }, [])

  const remove = useCallback(async (id: string) => {
    setInvoices(prev => prev.filter(x => x.id !== id))
    try { await api.del(`/invoices/${id}`) }
    catch (e) { console.error(e) }
  }, [])

  return { invoices, add, edit, remove }
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    api.get<Lead[]>('/leads').then(setLeads).catch(console.error)
  }, [])

  const updateStatus = useCallback(async (id: string, status: Lead['status']) => {
    setLeads(prev => prev.map(x => x.id === id ? { ...x, status } : x))
    try { await api.patch(`/leads/${id}`, { status }) }
    catch (e) { console.error(e) }
  }, [])

  const remove = useCallback(async (id: string) => {
    setLeads(prev => prev.filter(x => x.id !== id))
    try { await api.del(`/leads/${id}`) }
    catch (e) { console.error(e) }
  }, [])

  return { leads, updateStatus, remove }
}

export function useTimeEntries() {
  const [entries, setEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    api.get<TimeEntry[]>('/time-entries').then(setEntries).catch(console.error)
  }, [])

  const add = useCallback(async (e: TimeEntry) => {
    setEntries(prev => [e, ...prev])
    try { await api.post('/time-entries', e) }
    catch (err) { console.error(err); setEntries(prev => prev.filter(x => x.id !== e.id)) }
  }, [])

  const edit = useCallback(async (e: TimeEntry) => {
    setEntries(prev => prev.map(x => x.id === e.id ? e : x))
    try { await api.put(`/time-entries/${e.id}`, e) }
    catch (err) { console.error(err) }
  }, [])

  const remove = useCallback(async (id: string) => {
    setEntries(prev => prev.filter(x => x.id !== id))
    try { await api.del(`/time-entries/${id}`) }
    catch (err) { console.error(err) }
  }, [])

  return { entries, add, edit, remove }
}

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([])

  useEffect(() => {
    api.get<Proposal[]>('/proposals').then(setProposals).catch(console.error)
  }, [])

  const add = useCallback(async (p: Proposal) => {
    setProposals(prev => [p, ...prev])
    try { await api.post('/proposals', p) }
    catch (err) { console.error(err); setProposals(prev => prev.filter(x => x.id !== p.id)) }
  }, [])

  const edit = useCallback(async (p: Proposal) => {
    setProposals(prev => prev.map(x => x.id === p.id ? p : x))
    try { await api.put(`/proposals/${p.id}`, p) }
    catch (err) { console.error(err) }
  }, [])

  const remove = useCallback(async (id: string) => {
    setProposals(prev => prev.filter(x => x.id !== id))
    try { await api.del(`/proposals/${id}`) }
    catch (err) { console.error(err) }
  }, [])

  const acceptAndCreateProject = useCallback(async (id: string): Promise<{ project: Project } | { error: string } | null> => {
    try {
      const { proposal, project } = await api.post<{ proposal: Proposal; project: Project }>(
        `/proposals/${id}/accept`,
        {}
      )
      setProposals(prev => prev.map(x => x.id === id ? proposal : x))
      return { project }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[acceptAndCreateProject]', message)
      return { error: message }
    }
  }, [])

  return { proposals, add, edit, remove, acceptAndCreateProject }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])

  useEffect(() => {
    api.get<Expense[]>('/expenses').then(setExpenses).catch(console.error)
  }, [])

  const add = useCallback(async (e: Expense) => {
    setExpenses(prev => [e, ...prev])
    try { await api.post('/expenses', e) }
    catch (err) { console.error(err); setExpenses(prev => prev.filter(x => x.id !== e.id)) }
  }, [])

  const edit = useCallback(async (e: Expense) => {
    setExpenses(prev => prev.map(x => x.id === e.id ? e : x))
    try { await api.put(`/expenses/${e.id}`, e) }
    catch (err) { console.error(err) }
  }, [])

  const remove = useCallback(async (id: string) => {
    setExpenses(prev => prev.filter(x => x.id !== id))
    try { await api.del(`/expenses/${id}`) }
    catch (err) { console.error(err) }
  }, [])

  return { expenses, add, edit, remove }
}

// ── utils ────────────────────────────────────────────────────────────────

export function genId() { return Math.random().toString(36).slice(2, 10) }
export function formatCurrency(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n) }
export function formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }

/** Generate next sequential invoice number in NXR-YYYY-XXX format */
export function nextInvoiceNumber(invoices: Invoice[]): string {
  const year = new Date().getFullYear()
  const prefix = `NXR-${year}-`
  const existing = invoices
    .map(i => i.number)
    .filter(n => n.startsWith(prefix))
    .map(n => parseInt(n.replace(prefix, ''), 10))
    .filter(n => !isNaN(n))
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1
  return `${prefix}${String(next).padStart(3, '0')}`
}

/** Compute invoice subtotal (before tax) */
export function invoiceSubtotal(inv: Invoice): number {
  return inv.lineItems.reduce((s, l) => s + l.quantity * l.rate, 0)
}

/** Compute invoice grand total (with tax) */
export function invoiceTotal(inv: Invoice): number {
  const sub = invoiceSubtotal(inv)
  return inv.taxRate ? sub + sub * (inv.taxRate / 100) : sub
}
