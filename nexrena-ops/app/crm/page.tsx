'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useContacts, formatCurrency } from '@/lib/store'
import type { Contact, DealStage } from '@/lib/types'
import { PageHeader, Btn, Modal, StatCard, EmptyState } from '@/components/ui'
import { CrmContactForm } from '@/components/crm-contact-form'
import { CrmPipelineBoard } from '@/components/crm-pipeline-board'
import { CrmContactList } from '@/components/crm-contact-list'
import { isOpenPipelineStage } from '@/lib/crm-stages'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'
import { teamInputCls } from '@/lib/team-a11y'

type ViewMode = 'pipeline' | 'list'

export default function CRMPage() {
  const { contacts, add, edit, remove } = useContacts()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const [view, setView] = useState<ViewMode>('pipeline')
  const [modal, setModal] = useState<null | 'add' | Contact>(null)
  const [search, setSearch] = useState('')
  const [mobileStage, setMobileStage] = useState<DealStage | 'all'>('all')
  const [listStage, setListStage] = useState<DealStage | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    )
  }, [contacts, search])

  const openContact = useCallback((contact: Contact) => setModal(contact), [])

  useEffect(() => {
    if (!highlightId) return
    const contact = contacts.find((c) => c.id === highlightId)
    if (!contact) return
    setMobileStage(contact.stage)
    setListStage(contact.stage)
    setModal(contact)
  }, [highlightId, contacts])

  const openPipeline = filtered.filter((c) => isOpenPipelineStage(c.stage))
  const totalPipeline = openPipeline.reduce((sum, c) => sum + c.value, 0)
  const wonCount = filtered.filter((c) => c.stage === 'won').length
  const wonValue = filtered.filter((c) => c.stage === 'won').reduce((sum, c) => sum + c.value, 0)

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <PageHeader
        title="CRM Pipeline"
        sub={`${contacts.length} contacts · ${formatCurrency(totalPipeline)} open pipeline`}
        action={
          <Btn onClick={() => setModal('add')}>+ Add Contact</Btn>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 md:mb-8 stagger">
        <StatCard label="Open Pipeline" value={formatCurrency(totalPipeline)} gold />
        <StatCard
          label="Active Deals"
          value={String(openPipeline.length)}
          sub={`${filtered.length} matching search`}
        />
        <StatCard
          label="Won"
          value={String(wonCount)}
          sub={wonValue > 0 ? formatCurrency(wonValue) : 'Closed deals'}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${teamInputCls} w-full sm:max-w-sm`}
          placeholder="Search name, company, or email…"
          aria-label="Search contacts"
        />
        <MobileFilterRow className="sm:mb-0 sm:justify-end">
          <MobileFilterChip active={view === 'pipeline'} onClick={() => setView('pipeline')}>
            Pipeline
          </MobileFilterChip>
          <MobileFilterChip active={view === 'list'} onClick={() => setView('list')}>
            List
          </MobileFilterChip>
        </MobileFilterRow>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={search ? 'No contacts match your search.' : 'No contacts yet.'}
          action={search ? undefined : () => setModal('add')}
          actionLabel="Add your first contact"
        />
      ) : view === 'pipeline' ? (
        <CrmPipelineBoard
          contacts={filtered}
          highlightId={highlightId}
          mobileStage={mobileStage}
          onMobileStageChange={setMobileStage}
          onOpen={openContact}
        />
      ) : (
        <CrmContactList
          contacts={filtered}
          highlightId={highlightId}
          stageFilter={listStage}
          onStageFilterChange={setListStage}
          onOpen={openContact}
          onDelete={remove}
        />
      )}

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Contact' : `Edit — ${modal.name}`}
          onClose={() => setModal(null)}
          wide
        >
          <CrmContactForm
            initial={modal === 'add' ? undefined : modal}
            onSave={modal === 'add' ? add : edit}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}
