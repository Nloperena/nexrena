'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PortalAccount, PortalInvoice, PortalProject, PortalProposal, PortalAsset, PortalServiceRequest } from '@/lib/portal-types'
import {
  fetchPortalInvoice,
  fetchPortalInvoices,
  fetchPortalMe,
  fetchPortalProjects,
  fetchPortalProposals,
  fetchPortalServiceRequests,
  fetchPortalAssets,
  fetchPortalBillingStatus,
  createPortalCheckout,
  logoutPortal,
} from '@/lib/portal-client'
import { formatCurrency, formatDate } from '@/lib/store'
import { InvoicePrint } from '@/components/invoice-print'
import { ServiceRequestSection } from '@/components/service-request-section'
import { PortalUploadsSection } from '@/components/portal-uploads-section'
import { UserMenu } from '@/components/user-menu'
import { AccountSettingsModal } from '@/components/account-settings-modal'
import type { Invoice, InvoiceStatus } from '@/lib/types'
import { Btn } from '@/components/ui'

type Props = { onSignOut: () => void }

function effectiveStatus(inv: PortalInvoice): InvoiceStatus {
  if (inv.status === 'sent' && new Date(inv.dueDate) < new Date()) return 'overdue'
  return inv.status as InvoiceStatus
}

function toPrintInvoice(inv: PortalInvoice): Invoice {
  return {
    id: inv.id,
    number: inv.number,
    clientName: inv.clientName,
    status: inv.status as InvoiceStatus,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    projectName: inv.projectName ?? undefined,
    lineItems: inv.lineItems.map((item, i) => ({
      id: item.id ?? String(i),
      description: item.description ?? '',
      quantity: item.quantity,
      rate: item.rate,
      taxable: item.taxable,
    })),
    taxRate: inv.taxRate ?? undefined,
    paidDate: inv.paidDate ?? undefined,
    notes: inv.notes ?? undefined,
    createdAt: inv.issueDate,
  }
}

export function ClientDashboard({ onSignOut }: Props) {
  const [account, setAccount] = useState<PortalAccount | null>(null)
  const [projects, setProjects] = useState<PortalProject[]>([])
  const [invoices, setInvoices] = useState<PortalInvoice[]>([])
  const [proposals, setProposals] = useState<PortalProposal[]>([])
  const [serviceRequests, setServiceRequests] = useState<PortalServiceRequest[]>([])
  const [assets, setAssets] = useState<PortalAsset[]>([])
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<PortalInvoice | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [me, projectRows, invoiceRows, proposalRows, requestRows, assetRows, billing] = await Promise.all([
        fetchPortalMe(),
        fetchPortalProjects(),
        fetchPortalInvoices(),
        fetchPortalProposals(),
        fetchPortalServiceRequests(),
        fetchPortalAssets(),
        fetchPortalBillingStatus(),
      ])
      setAccount(me)
      setProjects(projectRows)
      setInvoices(invoiceRows)
      setProposals(proposalRows)
      setServiceRequests(requestRows)
      setAssets(assetRows)
      setStripeEnabled(billing.stripeEnabled)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your portal.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openInvoice = async (id: string) => {
    setViewLoading(true)
    try {
      setViewInvoice(await fetchPortalInvoice(id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load invoice.')
    } finally {
      setViewLoading(false)
    }
  }

  const handleSignOut = () => {
    logoutPortal()
    onSignOut()
  }

  const payInvoice = async (id: string) => {
    setPayingId(id)
    setError(null)
    try {
      const { url } = await createPortalCheckout(id)
      if (url) window.location.href = url
      else setError('Could not start checkout.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment unavailable.')
    } finally {
      setPayingId(null)
    }
  }

  const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

  if (viewInvoice) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Btn size="sm" variant="ghost" onClick={() => setViewInvoice(null)}>← Back</Btn>
          <Btn size="sm" onClick={() => window.print()}>Print / PDF</Btn>
        </div>
        <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/40">
          <InvoicePrint invoice={toPrintInvoice(viewInvoice)} />
        </div>
      </div>
    )
  }

  if (loading) {
    return <p className="text-sm text-slate-400 animate-pulse">Loading your workspace…</p>
  }

  if (error && !account) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">{error}</p>
        <Btn size="sm" variant="ghost" onClick={handleSignOut}>Sign in again</Btn>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] text-gold tracking-[0.2em] uppercase">Client portal</p>
          <h1 className="font-serif text-3xl text-white mt-2">Your workspace</h1>
          <p className="text-sm text-slate-400 mt-1">Projects, proposals, and invoices in one place.</p>
        </div>
        {account && (
          <UserMenu
            name={account.name}
            subtitle={account.company ?? account.email}
            onOpenSettings={() => setSettingsOpen(true)}
            onSignOut={handleSignOut}
          />
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {account && (
        <div className={card}>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">Welcome back</p>
          <h2 className="font-serif text-2xl text-white mt-2">{account.name}</h2>
          {account.company && <p className="text-sm text-slate-400 mt-0.5">{account.company}</p>}
        </div>
      )}

      <ServiceRequestSection onCreated={(row) => setServiceRequests((prev) => [row, ...prev])} />

      <PortalUploadsSection
        assets={assets}
        serviceRequests={serviceRequests}
        onUploaded={(asset) => setAssets((prev) => [asset, ...prev])}
      />

      <ListSection title="Your requests" empty="No service requests yet." items={serviceRequests}>
        {(r) => (
          <>
            <p className="font-serif text-lg text-white capitalize">{r.projectType}</p>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{r.description}</p>
            <p className="text-xs text-slate-500 mt-2">{r.status}{r.budget ? ` · ${r.budget}` : ''}</p>
          </>
        )}
      </ListSection>

      <ListSection title="Projects" empty="No active projects yet. We'll scope your first sprint after intake." items={projects}>
        {(p) => (
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-serif text-lg text-white">{p.name}</p>
              <p className="text-sm text-slate-400">{p.type} · {p.status}</p>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-gold">{p.status}</span>
          </div>
        )}
      </ListSection>

      <ListSection title="Proposals" empty="No proposals yet." items={proposals}>
        {(p) => (
          <>
            <p className="font-serif text-lg text-white">{p.title}</p>
            <p className="text-sm text-slate-400 mt-1">{p.status} · valid until {formatDate(p.validUntil)}</p>
          </>
        )}
      </ListSection>

      <ListSection title="Invoices" empty="No invoices yet." items={invoices}>
        {(inv) => {
          const status = effectiveStatus(inv)
          return (
            <div className="flex justify-between gap-4 items-start">
              <div>
                <p className="font-serif text-lg text-white">{inv.number}</p>
                {inv.projectName && <p className="text-sm text-slate-500 mt-0.5">{inv.projectName}</p>}
                <p className="text-sm text-slate-400 mt-1">
                  Issued {formatDate(inv.issueDate)} · Due {formatDate(inv.dueDate)}
                </p>
                <p className="text-base text-white font-medium mt-2 tabular-nums">{formatCurrency(inv.total)}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-[10px] uppercase tracking-wider ${status === 'overdue' ? 'text-red-400' : 'text-gold'}`}>
                  {status}
                </span>
                <Btn size="sm" variant="ghost" disabled={viewLoading} onClick={() => openInvoice(inv.id)}>View</Btn>
                {stripeEnabled && (status === 'sent' || status === 'overdue') && (
                  <Btn size="sm" disabled={payingId === inv.id} onClick={() => payInvoice(inv.id)}>
                    {payingId === inv.id ? '…' : 'Pay'}
                  </Btn>
                )}
              </div>
            </div>
          )
        }}
      </ListSection>

      {settingsOpen && account && (
        <AccountSettingsModal
          account={account}
          onClose={() => setSettingsOpen(false)}
          onUpdated={(updated) => setAccount(updated)}
        />
      )}
    </div>
  )
}

function ListSection<T extends { id: string }>({
  title, empty, items, children,
}: {
  title: string
  empty: string
  items: T[]
  children: (item: T) => React.ReactNode
}) {
  const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className={`${card} text-sm text-slate-500`}>{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className={card}>{children(item)}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
