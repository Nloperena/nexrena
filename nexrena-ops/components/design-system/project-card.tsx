import { formatCurrency, formatDate } from '@/lib/store'
import type { Project } from '@/lib/types'
import { Card } from '@/components/design-system/card'
import { Button } from '@/components/design-system/button'
import { StatusBadge } from '@/components/design-system/status-badge'
import { typography } from '@/lib/design-tokens'

type Props = {
  project: Project
  progressPct: number
  doneTasks: number
  totalTasks: number
  isOpen: boolean
  delivering?: boolean
  onToggle: () => void
  onEdit: () => void
  onDeliver?: () => void
  onDelete: () => void
  children?: React.ReactNode
}

export function ProjectCard({
  project,
  progressPct,
  doneTasks,
  totalTasks,
  isOpen,
  delivering,
  onToggle,
  onEdit,
  onDeliver,
  onDelete,
  children,
}: Props) {
  return (
    <Card padding={false} className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-4 sm:px-5 sm:py-5 hover:bg-slate-800/20 transition-colors min-h-[44px]"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`${typography.sectionTitle} text-base truncate`}>{project.name}</p>
              <StatusBadge label={project.status} />
              <StatusBadge label={project.type} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[140px] max-w-xs">
                <div className="flex-1 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-dim to-gold transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 tabular-nums w-8">{progressPct}%</span>
              </div>
              <span className="text-xs text-slate-400">{doneTasks}/{totalTasks} tasks</span>
              {project.endDate && (
                <span className="text-xs text-slate-400">Due {formatDate(project.endDate)}</span>
              )}
            </div>
          </div>
          <p className="font-serif text-gold font-semibold tabular-nums shrink-0">
            {formatCurrency(project.value)}
          </p>
          <span className={`text-slate-400 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden>▼</span>
        </div>
      </button>

      <div className="flex flex-wrap gap-2 px-4 pb-4 sm:px-5" onClick={(e) => e.stopPropagation()}>
        {project.status !== 'delivered' && onDeliver && (
          <Button size="sm" disabled={delivering} onClick={onDeliver}>
            {delivering ? '…' : 'Deliver'}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
        <Button size="sm" variant="danger" onClick={onDelete}>Del</Button>
      </div>

      {isOpen && children && (
        <div className="border-t border-slate-800/60 animate-fade-in">{children}</div>
      )}
    </Card>
  )
}
