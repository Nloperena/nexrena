'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Proposal } from '@/lib/types'
import { ProposalPrint } from '@/components/proposal-print'
import { Btn, LinkBtn } from '@/components/ui'
import { api } from '@/lib/api'

export default function ProposalPrintPage({ params }: { params: { id: string } }) {
  const [proposal, setProposal] = useState<Proposal | null | 'loading'>('loading')

  const load = useCallback(() => {
    setProposal('loading')
    api.get<Proposal[]>('/proposals')
      .then(proposals => {
        const found = proposals.find(p => p.id === params.id) ?? null
        setProposal(found)
        if (found) document.title = `Proposal - ${found.title} - ${found.clientName}`
      })
      .catch(() => setProposal(null))
  }, [params.id])

  useEffect(() => {
    load()
    return () => { document.title = 'Nexrena' }
  }, [load])

  if (proposal === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading proposal…
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-400 text-sm">Proposal not found.</p>
        <Link href="/proposals" className="text-gold text-sm hover:underline">← Back to Proposals</Link>
      </div>
    )
  }

  const emailSubject = encodeURIComponent(`Proposal: ${proposal.title} — Nexrena`)
  const emailBody = encodeURIComponent(
    `Hi ${proposal.clientName},\n\nPlease find attached our proposal for "${proposal.title}."\n\nLooking forward to hearing your thoughts.\n\nBest regards,\nNexrena LLC\nhello@nexrena.com`
  )
  const mailtoHref = `mailto:${proposal.clientEmail ?? ''}?subject=${emailSubject}&body=${emailBody}`

  return (
    <>
      <div className="no-print fixed top-0 left-56 right-0 z-50 bg-obsidian border-b border-slate-800/60 px-6 py-3 flex items-center justify-between">
        <Link href="/proposals" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          ← Back to Proposals
        </Link>
        <div className="flex items-center gap-3">
          {proposal.clientEmail && (
            <LinkBtn href={mailtoHref} variant="ghost">✉ Email Client</LinkBtn>
          )}
          <span className="text-xs text-slate-600 hidden md:block">
            Choose &ldquo;Save as PDF&rdquo; in your browser&apos;s print dialog
          </span>
          <Btn variant="ghost" onClick={load}>↻ Refresh</Btn>
          <Btn onClick={() => window.print()}>Download PDF</Btn>
        </div>
      </div>

      <div className="pt-14 pb-16 print:pt-0 print:pb-0 bg-[#111418] print:bg-white min-h-screen">
        <div className="no-print max-w-[900px] mx-auto my-8 shadow-2xl shadow-black/60 rounded">
          <ProposalPrint proposal={proposal} />
        </div>
        <div className="hidden print:block">
          <ProposalPrint proposal={proposal} />
        </div>
      </div>
    </>
  )
}

