import { formatDate } from '@/lib/store'
import { StatusChip } from '@/components/status-chip'
import { typography } from '@/lib/design-tokens'

type Props = {
  date: string
  label: string
  chip?: Parameters<typeof StatusChip>[0]['variant']
  isLast?: boolean
}

export function ActivityItem({ date, label, chip, isLast }: Props) {
  return (
    <li className={`relative flex gap-3 py-3 ${isLast ? '' : 'border-b border-slate-700/40'}`}>
      <div className="flex flex-col items-center pt-1.5 shrink-0">
        <span className="h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-gold/15" />
        {!isLast && <span className="mt-1 w-px flex-1 min-h-[0.75rem] bg-slate-600/60" />}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`${typography.hint} tabular-nums`}>{formatDate(date)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-white text-sm sm:text-base">{label}</span>
          {chip && <StatusChip variant={chip} />}
        </div>
      </div>
    </li>
  )
}
