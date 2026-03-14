'use client'
import { useState } from 'react'
import { useExpenses, useProjects, genId, formatCurrency, formatDate } from '@/lib/store'
import { Expense, ExpenseCategory } from '@/lib/types'
import { PageHeader, Btn, Modal, Field, inputCls, selectCls, StatCard, SectionCard, EmptyState, Badge } from '@/components/ui'

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'software', label: 'Software & Tools' },
  { value: 'contractors', label: 'Contractors' },
  { value: 'hosting', label: 'Hosting & Domains' },
  { value: 'marketing', label: 'Marketing & Ads' },
  { value: 'office', label: 'Office & Equipment' },
  { value: 'other', label: 'Other' },
]

function ExpenseForm({ initial, projects, onSave, onClose }: {
  initial?: Partial<Expense>
  projects: { id: string; name: string; clientName: string }[]
  onSave: (e: Expense) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Expense>>(initial ?? {
    category: 'software', date: new Date().toISOString().slice(0, 10), amount: 0,
  })
  const set = (k: keyof Expense, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleProjectSelect = (projectId: string) => {
    const p = projects.find(x => x.id === projectId)
    if (p) setForm(f => ({ ...f, projectId: p.id, projectName: `${p.clientName} — ${p.name}` }))
    else setForm(f => ({ ...f, projectId: undefined, projectName: undefined }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: form.id ?? genId(),
      projectId: form.projectId,
      projectName: form.projectName,
      category: (form.category ?? 'other') as ExpenseCategory,
      description: form.description ?? '',
      amount: Number(form.amount) || 0,
      date: form.date ?? new Date().toISOString().slice(0, 10),
      vendor: form.vendor,
      notes: form.notes,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <select className={selectCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
        <Field label="Amount ($)"><input required type="number" min="0" step="0.01" className={inputCls} value={form.amount ?? ''} onChange={e => set('amount', e.target.value)} /></Field>
      </div>
      <Field label="Description"><input required className={inputCls} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Figma Pro annual subscription" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Vendor"><input className={inputCls} value={form.vendor ?? ''} onChange={e => set('vendor', e.target.value)} placeholder="Figma, Vercel, etc." /></Field>
        <Field label="Date"><input required type="date" className={inputCls} value={form.date ?? ''} onChange={e => set('date', e.target.value)} /></Field>
      </div>
      {projects.length > 0 && (
        <Field label="Project (optional)">
          <select className={selectCls} value={form.projectId ?? ''} onChange={e => handleProjectSelect(e.target.value)}>
            <option value="">General / No project</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.clientName} — {p.name}</option>)}
          </select>
        </Field>
      )}
      <Field label="Notes"><textarea rows={2} className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">Save Expense</Btn>
      </div>
    </form>
  )
}

export default function ExpensesPage() {
  const { expenses, add, edit, remove } = useExpenses()
  const { projects } = useProjects()
  const [modal, setModal] = useState<null | 'add' | Expense>(null)
  const [filterCat, setFilterCat] = useState<'all' | ExpenseCategory>('all')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'quarter'>('month')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)

  const filtered = expenses
    .filter(e => filterCat === 'all' || e.category === filterCat)
    .filter(e => {
      if (filterPeriod === 'all') return true
      const d = new Date(e.date)
      return filterPeriod === 'month' ? d >= monthStart : d >= quarterStart
    })

  const totalExpenses = filtered.reduce((s, e) => s + e.amount, 0)
  const mtdExpenses = expenses.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0)
  const topCategory = CATEGORIES.reduce((top, cat) => {
    const catTotal = filtered.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0)
    return catTotal > top.amount ? { label: cat.label, amount: catTotal } : top
  }, { label: '—', amount: 0 })

  return (
    <div>
      <PageHeader title="Expenses" sub={`${expenses.length} total entries`}
        action={<Btn onClick={() => setModal('add')}>+ Add Expense</Btn>} />

      <div className="grid grid-cols-3 gap-4 mb-10 stagger">
        <StatCard label="Showing Total" value={formatCurrency(totalExpenses)} gold />
        <StatCard label="This Month" value={formatCurrency(mtdExpenses)} />
        <StatCard label="Top Category" value={topCategory.label} sub={topCategory.amount > 0 ? formatCurrency(topCategory.amount) : undefined} />
      </div>

      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex gap-0.5">
          {(['month', 'quarter', 'all'] as const).map(p => (
            <button key={p} onClick={() => setFilterPeriod(p)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize rounded-lg transition-all duration-200 ${
                filterPeriod === p ? 'bg-gold/10 text-gold ring-1 ring-gold/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}>{p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'This Quarter'}</button>
          ))}
        </div>
        <select className={`${selectCls} !w-48`} value={filterCat} onChange={e => setFilterCat(e.target.value as 'all' | ExpenseCategory)}>
          <option value="all">All categories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <SectionCard>
        <table className="nx-table">
          <thead>
            <tr><th>Date</th><th>Description</th><th>Category</th><th>Vendor</th><th>Project</th><th className="text-right">Amount</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(exp => (
              <tr key={exp.id} className="group">
                <td className="tabular-nums text-slate-400 text-xs">{formatDate(exp.date)}</td>
                <td className="text-white font-medium">{exp.description}</td>
                <td><Badge label={exp.category} /></td>
                <td className="text-slate-400">{exp.vendor || '—'}</td>
                <td className="text-slate-400 text-xs">{exp.projectName || '—'}</td>
                <td className="text-right text-gold font-semibold tabular-nums">{formatCurrency(exp.amount)}</td>
                <td>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Btn size="sm" variant="ghost" onClick={() => setModal(exp)}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => remove(exp.id)}>Del</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><EmptyState message="No expenses found." action={() => setModal('add')} actionLabel="Add your first expense" /></td></tr>
            )}
          </tbody>
        </table>
      </SectionCard>

      {modal && (
        <Modal title={modal === 'add' ? 'Add Expense' : `Edit — ${(modal as Expense).description}`} onClose={() => setModal(null)}>
          <ExpenseForm initial={modal === 'add' ? undefined : modal as Expense} projects={projects} onSave={modal === 'add' ? add : edit} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
