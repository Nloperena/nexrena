'use client'

type ActionId = 'message' | 'request' | 'upload' | 'billing'

type Props = {
  onMessage: () => void
  onStartRequest: () => void
  onUpload: () => void
  onViewBilling: () => void
}

const ACTIONS: {
  id: ActionId
  title: string
  subtitle: string
  icon: string
  primary?: boolean
}[] = [
  {
    id: 'message',
    title: 'Message Nico',
    subtitle: 'Questions, updates, or quick help',
    icon: '✉',
    primary: true,
  },
  {
    id: 'request',
    title: 'Start a new request',
    subtitle: 'Website updates, pages, or SEO',
    icon: '✦',
  },
  {
    id: 'upload',
    title: 'Business assets',
    subtitle: 'Upload or access logos, photos, copy, and PDFs',
    icon: '📁',
  },
  {
    id: 'billing',
    title: 'View billing',
    subtitle: 'Invoices and payments',
    icon: '▤',
  },
]

export function ClientActionCards({
  onMessage,
  onStartRequest,
  onUpload,
  onViewBilling,
}: Props) {
  const handlers: Record<ActionId, () => void> = {
    message: onMessage,
    request: onStartRequest,
    upload: onUpload,
    billing: onViewBilling,
  }

  return (
    <section>
      <h2 className="text-sm text-slate-400 mb-4 font-medium">
        What would you like to do?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={handlers[action.id]}
            className={`group text-left rounded-2xl p-6 sm:p-7 transition-all duration-200 active:scale-[0.98] ${
              action.primary
                ? 'bg-gradient-to-br from-gold/20 via-gold/10 to-transparent border-2 border-gold/40 hover:border-gold/60 hover:shadow-[0_0_24px_rgba(201,169,110,0.15)]'
                : 'glass-panel border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-800/20'
            }`}
          >
            <span
              className={`inline-flex w-10 h-10 items-center justify-center rounded-xl text-lg mb-4 ${
                action.primary ? 'bg-gold/20 text-gold' : 'bg-slate-800/60 text-slate-400 group-hover:text-gold'
              }`}
            >
              {action.icon}
            </span>
            <p className={`font-serif text-xl ${action.primary ? 'text-white' : 'text-white'}`}>
              {action.title}
            </p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">{action.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
