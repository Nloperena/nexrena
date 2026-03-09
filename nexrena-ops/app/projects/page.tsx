'use client'
import { useState } from 'react'
import { useProjects, genId, formatCurrency, formatDate } from '@/lib/store'
import { Project, ProjectStatus, Task, TaskStatus, ProjectPhase } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, Field, inputCls, selectCls, StatCard } from '@/components/ui'

const STATUSES: ProjectStatus[] = ['not_started','discovery','strategy','execution','review','delivered','on_hold']
const DEFAULT_PHASES = (type: string): ProjectPhase[] => {
  const webPhases = [
    { id: genId(), name: 'Discovery', tasks: [
      { id: genId(), title: 'Brand & competitor audit', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Sitemap + page structure', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Kick-off call completed', status: 'todo' as TaskStatus },
    ]},
    { id: genId(), name: 'Strategy', tasks: [
      { id: genId(), title: 'Wireframes delivered', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Client strategy approval', status: 'todo' as TaskStatus },
    ]},
    { id: genId(), name: 'Execution', tasks: [
      { id: genId(), title: 'Development build', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Content integration', status: 'todo' as TaskStatus },
      { id: genId(), title: 'SEO on-page setup', status: 'todo' as TaskStatus },
    ]},
    { id: genId(), name: 'Delivery', tasks: [
      { id: genId(), title: 'QA across devices', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Client review round', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Launch + go-live', status: 'todo' as TaskStatus },
    ]},
  ]
  const seoPhases = [
    { id: genId(), name: 'Discovery', tasks: [
      { id: genId(), title: 'Technical SEO audit', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Keyword research', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Competitor analysis', status: 'todo' as TaskStatus },
    ]},
    { id: genId(), name: 'Strategy', tasks: [
      { id: genId(), title: 'SEO roadmap delivered', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Client approval', status: 'todo' as TaskStatus },
    ]},
    { id: genId(), name: 'Execution', tasks: [
      { id: genId(), title: 'On-page optimizations', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Content brief + publishing', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Link building outreach', status: 'todo' as TaskStatus },
    ]},
    { id: genId(), name: 'Monthly Review', tasks: [
      { id: genId(), title: 'Monthly report delivered', status: 'todo' as TaskStatus },
      { id: genId(), title: 'Strategy adjustment', status: 'todo' as TaskStatus },
    ]},
  ]
  return type === 'seo' ? seoPhases : webPhases
}

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
      phases: form.phases ?? DEFAULT_PHASES(form.type ?? 'web'),
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
      <p className="text-xs text-[#7A8A9E]">Default phase checklist will be auto-generated based on project type.</p>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">Save Project</Btn>
      </div>
    </form>
  )
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 hover:bg-[#1E2530]/30 rounded transition-colors group">
      <button onClick={onToggle}
        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
          task.status === 'done' ? 'bg-[#C9A96E] border-[#C9A96E]' : 'border-[#3D4A5C] hover:border-[#C9A96E]'
        }`}>
        {task.status === 'done' && <span className="text-[#0C0F12] text-[10px] font-bold">✓</span>}
      </button>
      <span className={`text-sm flex-1 ${task.status === 'done' ? 'line-through text-[#3D4A5C]' : 'text-[#D4DCE6]'}`}>
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

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Projects" value={String(activeCount)} />
        <StatCard label="Total Project Value" value={formatCurrency(totalValue)} gold />
        <StatCard label="Delivered" value={String(deliveredCount)} />
      </div>

      <div className="space-y-3">
        {projects.map(project => {
          const allTasks = project.phases.flatMap(ph => ph.tasks)
          const doneTasks = allTasks.filter(t => t.status === 'done').length
          const pct = allTasks.length > 0 ? Math.round(doneTasks / allTasks.length * 100) : 0
          const isOpen = expanded === project.id

          return (
            <div key={project.id} className="bg-[#0C0F12] border border-[#1E2530] rounded-lg overflow-hidden">
              {/* Project header */}
              <div
                className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-[#1E2530]/20 transition-colors"
                onClick={() => setExpanded(isOpen ? null : project.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="text-white font-medium">{project.name}</p>
                    <Badge label={project.status} />
                    <Badge label={project.type} />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                      <div className="flex-1 bg-[#1E2530] rounded-full h-1.5">
                        <div className="bg-[#C9A96E] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-[#7A8A9E] w-8">{pct}%</span>
                    </div>
                    <span className="text-xs text-[#7A8A9E]">{doneTasks}/{allTasks.length} tasks</span>
                    {project.endDate && <span className="text-xs text-[#7A8A9E]">Due {formatDate(project.endDate)}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#C9A96E] font-medium">{formatCurrency(project.value)}</p>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <Btn size="sm" variant="ghost" onClick={() => setModal(project)}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => remove(project.id)}>Del</Btn>
                </div>
                <span className="text-[#7A8A9E] text-sm">{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Phases */}
              {isOpen && (
                <div className="border-t border-[#1E2530]">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-[#1E2530]">
                    {project.phases.map(phase => {
                      const phaseDone = phase.tasks.filter(t => t.status === 'done').length
                      return (
                        <div key={phase.id} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-[#C9A96E] uppercase tracking-wider">{phase.name}</p>
                            <span className="text-[10px] text-[#3D4A5C]">{phaseDone}/{phase.tasks.length}</span>
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
                    <div className="px-5 py-3 border-t border-[#1E2530] bg-[#1E2530]/20">
                      <p className="text-xs text-[#7A8A9E]">{project.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {projects.length === 0 && (
          <div className="bg-[#0C0F12] border border-[#1E2530] rounded-lg py-16 text-center">
            <p className="text-[#3D4A5C] text-sm">No projects yet.</p>
            <button onClick={() => setModal('add')} className="text-[#C9A96E] text-sm mt-2 hover:underline">Create your first project →</button>
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
