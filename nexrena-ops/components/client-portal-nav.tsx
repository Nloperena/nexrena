'use client'

export type ClientPortalTab = 'home' | 'files' | 'billing' | 'messages'

const TABS: { id: ClientPortalTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'files', label: 'Files' },
  { id: 'billing', label: 'Billing' },
  { id: 'messages', label: 'Messages' },
]

type Props = {
  active: ClientPortalTab
  onChange: (tab: ClientPortalTab) => void
}

export function ClientPortalNav({ active, onChange }: Props) {
  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-800/60 pb-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === tab.id
              ? 'bg-gold text-obsidian'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
