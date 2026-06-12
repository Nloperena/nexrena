'use client'

import type { ReactNode } from 'react'
import {
  IconInvoice,
  IconMessage,
  IconSpark,
} from '@/components/client-portal-visuals'
import { PortalImageActionCard } from '@/components/portal-media-panel'
import { portalSectionTitleClass } from '@/lib/portal-a11y'

type ActionId = 'message' | 'request' | 'billing'

type Props = {
  onMessage: () => void
  onStartRequest: () => void
  onViewBilling: () => void
}

export function ClientActionCards({ onMessage, onStartRequest, onViewBilling }: Props) {
  const handlers: Record<ActionId, () => void> = {
    message: onMessage,
    request: onStartRequest,
    billing: onViewBilling,
  }

  const cards: {
    id: ActionId
    photo: 'messages' | 'request' | 'billing'
    title: string
    subtitle: string
    icon: React.ReactNode
    primary?: boolean
  }[] = [
    {
      id: 'message',
      photo: 'messages',
      title: 'Message Nico',
      subtitle: 'Ask a question or get an update',
      icon: <IconMessage className="w-6 h-6" />,
      primary: true,
    },
    {
      id: 'request',
      photo: 'request',
      title: 'Request help',
      subtitle: 'Website changes, growth, or support',
      icon: <IconSpark className="w-6 h-6" />,
    },
    {
      id: 'billing',
      photo: 'billing',
      title: 'View billing',
      subtitle: 'See invoices and what you owe',
      icon: <IconInvoice className="w-6 h-6" />,
    },
  ]

  return (
    <section>
      <h2 className={`${portalSectionTitleClass} text-lg sm:text-xl mb-4`}>Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((card) => (
          <PortalImageActionCard
            key={card.id}
            photo={card.photo}
            title={card.title}
            subtitle={card.subtitle}
            icon={card.icon}
            primary={card.primary}
            onClick={handlers[card.id]}
          />
        ))}
      </div>
    </section>
  )
}
