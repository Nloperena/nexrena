'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProposals, useContacts, genId, formatCurrency, formatDate } from '@/lib/store'
import { Proposal, ProposalStatus, ProposalService, Contact } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, StatCard, SectionCard, EmptyState } from '@/components/ui'
import { ProposalForm } from '@/components/proposal-form'

const STATUSES: ProposalStatus[] = ['draft', 'sent', 'accepted', 'declined', 'expired']

function proposalTotal(p: Proposal): number {
  const subtotal = p.services.reduce((s, svc) => s + svc.price, 0)
  return subtotal - (p.discount || 0)
}

export default function ProposalsPage() {
  const router = useRouter()
  const { proposals, add, edit, remove, acceptAndCreateProject } = useProposals()
  const { contacts } = useContacts()
  const [modal, setModal] = useState<null | 'add' | Proposal>(null)
  const [filter, setFilter] = useState<'all' | ProposalStatus>('all')
  const [accepting, setAccepting] = useState<string | null>(null)

  const filtered = proposals.filter(p => filter === 'all' || p.status === filter)

  const sentValue = proposals.filter(p => p.status === 'sent').reduce((s, p) => s + proposalTotal(p), 0)
  const wonValue = proposals.filter(p => p.status === 'accepted').reduce((s, p) => s + proposalTotal(p), 0)
  const winRate = proposals.filter(p => ['accepted', 'declined'].includes(p.status)).length > 0
    ? Math.round((proposals.filter(p => p.status === 'accepted').length / proposals.filter(p => ['accepted', 'declined'].includes(p.status)).length) * 100)
    : 0

  const handleDuplicate = (prop: Proposal) => {
    add({
      ...prop,
      id: genId(),
      status: 'draft',
      projectId: undefined,
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      services: prop.services.map(s => ({ ...s, id: genId() })),
    })
  }

  const handleAccept = async (prop: Proposal) => {
    setAccepting(prop.id)
    const project = await acceptAndCreateProject(prop.id)
    setAccepting(null)
    if (project) {
      router.push('/projects')
    }
  }

  const statusCount = (s: ProposalStatus) => proposals.filter(p => p.status === s).length

  return (
    <div>
      <PageHeader title="Proposals" sub={`${proposals.length} total  ·  ${formatCurrency(wonValue)} won`}
        action={<Btn onClick={() => setModal('add')}>+ New Proposal</Btn>} />

      <div className="grid grid-cols-3 gap-4 mb-10 stagger">
        <StatCard label="Pending Value" value={formatCurrency(sentValue)} gold sub={`${proposals.filter(p => p.status === 'sent').length} awaiting response`} />
        <StatCard label="Won Value" value={formatCurrency(wonValue)} />
        <StatCard label="Win Rate" value={`${winRate}%`} sub="Accepted / (Accepted + Declined)" />
      </div>

      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div className="flex gap-0.5">
          {(['all', ...STATUSES] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize rounded-lg transition-all duration-200 ${
                filter === s ? 'bg-gold/10 text-gold ring-1 ring-gold/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}>{s} {s !== 'all' && <span className="text-slate-600 ml-0.5">({statusCount(s)})</span>}</button>
          ))}
        </div>
      </div>

      <SectionCard>
        <table className="nx-table">
          <thead>
            <tr><th>Title</th><th>Client</th><th>Services</th><th>Valid Until</th><th>Status</th><th className="text-right">Value</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(prop => {
              const total = proposalTotal(prop)
              const expired = prop.status === 'sent' && new Date(prop.validUntil) < new Date()
              const isAccepted = prop.status === 'accepted'
              const isAccepting = accepting === prop.id

              return (
                <tr key={prop.id} className="group">
                  <td className="text-white font-medium group-hover:text-gold transition-colors">{prop.title}</td>
                  <td>
                    <p className="text-slate-300">{prop.clientName}</p>
                    {prop.clientCompany && <p className="text-xs text-slate-500">{prop.clientCompany}</p>}
                  </td>
                  <td className="text-slate-400 text-xs">{prop.services.length} service{prop.services.length !== 1 ? 's' : ''}</td>
                  <td className={`tabular-nums ${expired ? 'text-red-400' : 'text-slate-400'}`}>{formatDate(prop.validUntil)}</td>
                  <td><Badge label={expired && prop.status === 'sent' ? 'expired' : prop.status} /></td>
                  <td className="text-right text-gold font-semibold tabular-nums">{formatCurrency(total)}</td>
                  <td>
                    <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link href={`/proposals/${prop.id}/print`}><Btn size="sm" variant="ghost">View</Btn></Link>
                      {prop.projectId ? (
                        <Link href="/projects"><Btn size="sm" variant="primary">View Project →</Btn></Link>
                      ) : (
                        <Btn size="sm" variant="primary" onClick={() => handleAccept(prop)} disabled={isAccepting}>
                          {isAccepting ? 'Creating…' : 'Accept & Create Project'}
                        </Btn>
                      )}
                      <Btn size="sm" variant="ghost" onClick={() => setModal(prop)}>Edit</Btn>
                      <Btn size="sm" variant="ghost" onClick={() => handleDuplicate(prop)}>Dup</Btn>
                      <Btn size="sm" variant="danger" onClick={() => remove(prop.id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7}><EmptyState message="No proposals found." action={() => setModal('add')} actionLabel="Create your first proposal" /></td></tr>
            )}
          </tbody>
        </table>
      </SectionCard>

      {modal && (
        <Modal wide title={modal === 'add' ? 'New Proposal' : `Edit — ${(modal as Proposal).title}`} onClose={() => setModal(null)}>
          <ProposalForm
            initial={modal === 'add' ? undefined : modal as Proposal}
            onSave={modal === 'add' ? add : edit}
            onClose={() => setModal(null)}
            contacts={contacts} />
        </Modal>
      )}
    </div>
  )
}
