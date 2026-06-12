import { Card } from '@/components/design-system/card'
import { typography } from '@/lib/design-tokens'

type Props = {
  name: string
  meta?: string
  size?: string
  folder?: string
  icon?: string
  onOpen?: () => void
}

export function FileCard({ name, meta, size, folder, icon = '📄', onOpen }: Props) {
  return (
    <Card variant="client" onClick={onOpen} className="text-left w-full">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 text-lg">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`${typography.sectionTitle} text-base truncate`}>{name}</p>
          {folder && <p className={`${typography.hint} truncate`}>{folder}</p>}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-slate-400">
            {meta && <span>{meta}</span>}
            {size && <span>{size}</span>}
          </div>
        </div>
      </div>
    </Card>
  )
}
