'use client'
import { useState } from 'react'
import { useProjects, genId, formatCurrency, formatDate } from '@/lib/store'
import { defaultPhases } from '@/lib/project-defaults'
import { Project, ProjectStatus, Task, TaskStatus } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, Field, inputCls, selectCls, StatCard, EmptyState } from '@/components/ui'

const STATUSES: ProjectStatus[] = ['not_started','discovery','strategy','execution','review','delivered','on_hold']

function ProjectForm({ initial, onSave, onClose }: {
  initial?: Partial<Project>; onSave: (p: Project) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Project>>(initial ?? { status: 'not_started', type: 'web', value: 0 })
  const set = (k: keyof Project, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: form.id ?? genId(),
      name: form.name!,
      clientName: form.clientName!,
      type: form.type ?? 'web',
      status: form.status ?? 'not_started',
      startDate: form.startDate ?? new Date().toISOString().slice(0,10),
      endDate: form.endDate,
      value: Number(form.value) ?? 0,
      phases: form.phases ?? defaultPhases(form.type ?? 'web'),
      notes: form.notes,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Project Name"><input required className={inputCls} value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="Acme Corp — Website Rebuild" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Client Name"><input required className={inputCls} value={form.clientName ?? ''} onChange={e => set('clientName', e.target.value)} placeholder="Acme Corp" /></Field>
        <Field label="Project Type">
          <select className={selectCls} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="web">Web Design & Dev</option>
            <option value="seo">SEO / Marketing</option>
            <option value="both">Both</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Status">
          <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value as ProjectStatus)}>
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
        </Field>
        <Field label="Start Date"><input type="date" className={inputCls} value={form.startDate ?? ''} onChange={e => set('startDate', e.target.value)} /></Field>
        <Field label="End Date"><input type="date" className={inputCls} value={form.endDate ?? ''} onChange={e => set('endDate', e.target.value)} /></Field>
      </div>
      <Field label="Project Value ($)"><input type="number" className={inputCls} value={form.value ?? 0} onChange={e => set('value', e.target.value)} /></Field>
      <Field label="Notes"><textarea rows={3} className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} /></Field>
      <p className="text-xs text-slate-400">Default phase checklist will be auto-generated based on project type.</p>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">Save Project</Btn>
      </div>
    </form>
  )
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-slate-800/20 rounded-lg transition-all duration-200 group">
      <button onClick={onToggle}
        className={`w-[18px] h-[18px] rounded-[5px] border flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
          task.status === 'done'
            ? 'bg-gold border-gold shadow-[0_0_6px_rgba(201,169,110,0.3)]'
            : 'border-slate-600 hover:border-gold/60 hover:shadow-[0_0_4px_rgba(201,169,110,0.15)]'
        }`}>
        {task.status === 'done' && <span className="text-obsidian text-[10px] font-bold">✓</span>}
      </button>
      <span className={`text-sm flex-1 transition-all duration-300 ${
        task.status === 'done' ? 'line-through text-slate-600' : 'text-slate-200 group-hover:text-white'
      }`}>
        {task.title}
      </span>
    </div>
  )
}

export default function ProjectsPage() {
  const { projects, add, edit, remove } = useProjects()
  const [modal, setModal] = useState<null | 'add' | Project>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggleTask = (projectId: string, phaseId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId)!
    const updated = {
      ...project,
      phases: project.phases.map(ph => ph.id !== phaseId ? ph : {
        ...ph,
        tasks: ph.tasks.map(t => t.id !== taskId ? t : {
          ...t, status: t.status === 'done' ? 'todo' : 'done' as TaskStatus
        })
      })
    }
    edit(updated)
  }

  const activeCount = projects.filter(p => !['delivered','on_hold'].includes(p.status)).length
  const totalValue = projects.reduce((s, p) => s + p.value, 0)
  const deliveredCount = projects.filter(p => p.status === 'delivered').length

  return (
    <div>
      <PageHeader
        title="Projects"
        sub={`${projects.length} total  ·  ${activeCount} active`}
        action={<Btn onClick={() => setModal('add')}>+ New Project</Btn>}
      />

      <div className="grid grid-cols-3 gap-4 mb-10 stagger">
        <StatCard label="Active Projects" value={String(activeCount)} />
        <StatCard label="Total Project Value" value={formatCurrency(totalValue)} gold />
        <StatCard label="Delivered" value={String(deliveredCount)} />
      </div>

      <div className="space-y-4 stagger">
        {projects.map(project => {
          const allTasks = project.phases.flatMap(ph => ph.tasks)
          const doneTasks = allTasks.filter(t => t.status === 'done').length
          const pct = allTasks.length > 0 ? Math.round(doneTasks / allTasks.length * 100) : 0
          const isOpen = expanded === project.id

          return (
            <div key={project.id} className="glass-panel rounded-xl overflow-hidden card-lift">
              {/* Project header */}
              <div
                className="px-6 py-5 flex items-center gap-4 cursor-pointer hover:bg-slate-800/20 transition-all duration-200"
                onClick={() => setExpanded(isOpen ? null : project.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white font-medium">{project.name}</p>
                    <Badge label={project.status} />
                    <Badge label={project.type} />
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2.5 flex-1 max-w-xs">
                      <div className="flex-1 bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-gold-dim to-gold h-1.5 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-400 tabular-nums w-8">{pct}%</span>
                    </div>
                    <span className="text-xs text-slate-400">{doneTasks}/{allTasks.length} tasks</span>
                    {project.endDate && <span className="text-xs text-slate-400">Due {formatDate(project.endDate)}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gold font-semibold tabular-nums">{formatCurrency(project.value)}</p>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <Btn size="sm" variant="ghost" onClick={() => setModal(project)}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => remove(project.id)}>Del</Btn>
                </div>
                <span className={`text-slate-400 text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {/* Phases — expandable */}
              {isOpen && (
                <div className="border-t border-slate-800/60 animate-fade-in">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-slate-800/40">
                    {project.phases.map((phase, phIdx) => {
                      const phaseDone = phase.tasks.filter(t => t.status === 'done').length
                      const phaseTotal = phase.tasks.length
                      const phasePct = phaseTotal > 0 ? Math.round(phaseDone / phaseTotal * 100) : 0
                      return (
                        <div key={phase.id} className="p-5 animate-fade-in-up" style={{ animationDelay: `${phIdx * 0.05}s` }}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.15em]">{phase.name}</p>
                            <span className="text-[10px] text-slate-600 tabular-nums">{phaseDone}/{phaseTotal}</span>
                          </div>
                          <div className="bg-slate-800/60 rounded-full h-1 mb-4 overflow-hidden">
                            <div className="bg-gold/60 h-1 rounded-full transition-all duration-500" style={{ width: `${phasePct}%` }} />
                          </div>
                          {phase.tasks.map(task => (
                            <TaskRow key={task.id} task={task}
                              onToggle={() => toggleTask(project.id, phase.id, task.id)} />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                  {project.notes && (
                    <div className="px-6 py-4 border-t border-slate-800/40 bg-slate-800/10">
                      <p className="text-xs text-slate-400 leading-relaxed">{project.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {projects.length === 0 && (
          <div className="glass-panel rounded-xl">
            <EmptyState
              message="No projects yet."
              action={() => setModal('add')}
              actionLabel="Create your first project"
            />
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === 'add' ? 'New Project' : `Edit — ${(modal as Project).name}`}
          onClose={() => setModal(null)}>
          <ProjectForm
            initial={modal === 'add' ? undefined : modal as Project}
            onSave={modal === 'add' ? add : edit}
            onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
