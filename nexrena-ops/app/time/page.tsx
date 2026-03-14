'use client'
import { useState } from 'react'
import { useTimeEntries, useProjects, genId, formatCurrency, formatDate } from '@/lib/store'
import { TimeEntry } from '@/lib/types'
import { PageHeader, Btn, Modal, Field, inputCls, selectCls, StatCard, SectionCard, EmptyState, Badge } from '@/components/ui'

function TimeForm({ initial, projects, onSave, onClose }: {
  initial?: Partial<TimeEntry>
  projects: { id: string; name: string; clientName: string }[]
  onSave: (e: TimeEntry) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<TimeEntry>>(initial ?? {
    billable: true, billed: false, date: new Date().toISOString().slice(0, 10), hours: 0,
  })
  const set = (k: keyof TimeEntry, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  const handleProjectSelect = (projectId: string) => {
    const p = projects.find(x => x.id === projectId)
    if (p) setForm(f => ({ ...f, projectId: p.id, projectName: `${p.clientName} — ${p.name}` }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: form.id ?? genId(),
      projectId: form.projectId,
      projectName: form.projectName ?? '',
      description: form.description ?? '',
      hours: Number(form.hours) || 0,
      date: form.date ?? new Date().toISOString().slice(0, 10),
      billable: form.billable ?? true,
      billed: form.billed ?? false,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {projects.length > 0 && (
        <Field label="Project">
          <select className={selectCls} value={form.projectId ?? ''}
            onChange={e => e.target.value && handleProjectSelect(e.target.value)}>
            <option value="">Select a project…</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.clientName} — {p.name}</option>)}
          </select>
        </Field>
      )}
      {!form.projectId && (
        <Field label="Project Name"><input required className={inputCls} value={form.projectName ?? ''} onChange={e => set('projectName', e.target.value)} placeholder="Client — Project" /></Field>
      )}
      <Field label="Description"><input required className={inputCls} value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="What did you work on?" /></Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Hours"><input required type="number" min="0" step="0.25" className={inputCls} value={form.hours ?? ''} onChange={e => set('hours', e.target.value)} /></Field>
        <Field label="Date"><input required type="date" className={inputCls} value={form.date ?? ''} onChange={e => set('date', e.target.value)} /></Field>
        <Field label="Billable">
          <select className={selectCls} value={form.billable ? 'yes' : 'no'} onChange={e => set('billable', e.target.value === 'yes')}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </Field>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">Log Time</Btn>
      </div>
    </form>
  )
}

export default function TimePage() {
  const { entries, add, edit, remove } = useTimeEntries()
  const { projects } = useProjects()
  const [modal, setModal] = useState<null | 'add' | TimeEntry>(null)
  const [filterProject, setFilterProject] = useState('')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month'>('month')

  const now = new Date()
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const filtered = entries
    .filter(e => !filterProject || e.projectId === filterProject || e.projectName.toLowerCase().includes(filterProject.toLowerCase()))
    .filter(e => {
      if (filterPeriod === 'all') return true
      const d = new Date(e.date)
      return filterPeriod === 'week' ? d >= weekAgo : d >= monthStart
    })

  const totalHours = filtered.reduce((s, e) => s + e.hours, 0)
  const billableHours = filtered.filter(e => e.billable).reduce((s, e) => s + e.hours, 0)
  const unbilledHours = filtered.filter(e => e.billable && !e.billed).reduce((s, e) => s + e.hours, 0)
  const utilization = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0

  const markBilled = (entry: TimeEntry) => edit({ ...entry, billed: true })

  return (
    <div>
      <PageHeader title="Time Tracking" sub={`${entries.length} entries logged`}
        action={<Btn onClick={() => setModal('add')}>+ Log Time</Btn>} />

      <div className="grid grid-cols-4 gap-4 mb-10 stagger">
        <StatCard label="Total Hours" value={totalHours.toFixed(1)} sub={filterPeriod === 'all' ? 'All time' : filterPeriod === 'week' ? 'This week' : 'This month'} />
        <StatCard label="Billable Hours" value={billableHours.toFixed(1)} gold />
        <StatCard label="Unbilled" value={unbilledHours.toFixed(1)} sub="Awaiting invoice" />
        <StatCard label="Utilization" value={`${utilization}%`} sub="Billable / Total" />
      </div>

      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex gap-0.5">
          {(['month', 'week', 'all'] as const).map(p => (
            <button key={p} onClick={() => setFilterPeriod(p)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize rounded-lg transition-all duration-200 ${
                filterPeriod === p ? 'bg-gold/10 text-gold ring-1 ring-gold/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}>{p === 'all' ? 'All Time' : `This ${p}`}</button>
          ))}
        </div>
        <select className={`${selectCls} !w-56`} value={filterProject} onChange={e => setFilterProject(e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.clientName} — {p.name}</option>)}
        </select>
      </div>

      <SectionCard>
        <table className="nx-table">
          <thead>
            <tr><th>Date</th><th>Project</th><th>Description</th><th className="text-right">Hours</th><th>Billable</th><th>Billed</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(entry => (
              <tr key={entry.id} className="group">
                <td className="tabular-nums text-slate-400 text-xs">{formatDate(entry.date)}</td>
                <td className="text-white font-medium">{entry.projectName}</td>
                <td className="text-slate-300">{entry.description}</td>
                <td className="text-right text-gold font-semibold tabular-nums">{entry.hours.toFixed(1)}h</td>
                <td>{entry.billable ? <Badge label="billable" /> : <span className="text-slate-600 text-xs">—</span>}</td>
                <td>{entry.billed ? <Badge label="done" /> : entry.billable ? <Badge label="pending" /> : <span className="text-slate-600 text-xs">—</span>}</td>
                <td>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {entry.billable && !entry.billed && <Btn size="sm" variant="primary" onClick={() => markBilled(entry)}>Billed</Btn>}
                    <Btn size="sm" variant="ghost" onClick={() => setModal(entry)}>Edit</Btn>
                    <Btn size="sm" variant="danger" onClick={() => remove(entry.id)}>Del</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><EmptyState message="No time entries found." action={() => setModal('add')} actionLabel="Log your first entry" /></td></tr>
            )}
          </tbody>
        </table>
      </SectionCard>

      {filtered.length > 0 && (
        <div className="flex justify-end mt-4 pr-4 animate-fade-in">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 tracking-[0.1em] uppercase">Total hours shown</p>
            <p className="text-xl font-serif gold-shimmer font-semibold mt-1">{totalHours.toFixed(1)}h</p>
          </div>
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Log Time' : `Edit — ${(modal as TimeEntry).description}`} onClose={() => setModal(null)}>
          <TimeForm initial={modal === 'add' ? undefined : modal as TimeEntry} projects={projects} onSave={modal === 'add' ? add : edit} onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
