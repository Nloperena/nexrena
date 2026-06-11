'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { computePortalStats, portalSectionTitleClass } from '@/lib/portal-dashboard-utils'
import { formatDate } from '@/lib/store'
import { InvoicePrint } from '@/components/invoice-print'
import { PortalUploadsSection } from '@/components/portal-uploads-section'
import { UserMenu } from '@/components/user-menu'
import { AccountSettingsModal } from '@/components/account-settings-modal'
import { ClientDashboardStats } from '@/components/client-dashboard-stats'
import { ClientBillingSection } from '@/components/client-billing-section'
import { ClientRequestModal } from '@/components/client-request-modal'
import type { Invoice, InvoiceStatus } from '@/lib/types'
import { Btn } from '@/components/ui'

type Props = { onSignOut: () => void }

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'
const MESSAGE_NICO_EMAIL = 'nicholas@nexrena.com'

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className={portalSectionTitleClass}>{children}</h3>
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
  const [requestOpen, setRequestOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<PortalInvoice | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const uploadsRef = useRef<HTMLDivElement>(null)

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

  const stats = useMemo(
    () => computePortalStats(invoices, projects, proposals),
    [invoices, projects, proposals],
  )

  const activeProjects = useMemo(
    () => projects.filter((p) => !['delivered', 'on_hold', 'not_started'].includes(p.status)),
    [projects],
  )

  const pendingProposals = useMemo(() => {
    const now = new Date()
    return proposals.filter((p) => p.status === 'sent' && new Date(p.validUntil) >= now)
  }, [proposals])

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

  const scrollToUploads = () => {
    uploadsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (viewInvoice) {
    return (
      <div className="max-w-5xl mx-auto flex flex-col gap-6 py-4">
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
    <div className="max-w-5xl mx-auto flex flex-col gap-10 py-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] text-gold tracking-[0.2em] uppercase">Client portal</p>
          <h1 className="font-serif text-3xl text-white mt-2">Your workspace</h1>
          {account && (
            <p className="text-sm text-slate-400 mt-1">Welcome back, {account.name}</p>
          )}
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

      <ClientDashboardStats stats={stats} />

      <section>
        <SectionTitle>Need something?</SectionTitle>
        <div className={`${card} space-y-4`}>
          <div>
            <p className="font-serif text-lg text-white">Need something new?</p>
            <p className="text-sm text-slate-400 mt-1">
              Website updates, landing pages, SEO sprints, or ongoing maintenance — start a request and we&apos;ll scope it together.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" onClick={() => setRequestOpen(true)}>Start a new request</Btn>
            <Btn size="sm" onClick={scrollToUploads}>Upload files</Btn>
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => { window.location.href = `mailto:${MESSAGE_NICO_EMAIL}` }}
            >
              Message Nico
            </Btn>
          </div>
        </div>
      </section>

      <div ref={uploadsRef}>
        <PortalUploadsSection
          compact
          assets={assets}
          serviceRequests={serviceRequests}
          onUploaded={(asset) => setAssets((prev) => [asset, ...prev])}
        />
      </div>

      <section>
        <SectionTitle>Active Projects</SectionTitle>
        {activeProjects.length === 0 ? (
          <p className={`${card} text-sm text-slate-500`}>
            No active projects yet. Start a request and we&apos;ll scope your first sprint after intake.
          </p>
        ) : (
          <ul className="space-y-3">
            {activeProjects.map((p) => (
              <li key={p.id} className={card}>
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg text-white">{p.name}</p>
                    <p className="text-sm text-slate-400">{p.type} · {p.status.replace('_', ' ')}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gold shrink-0">{p.status.replace('_', ' ')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Recent Requests</SectionTitle>
        {serviceRequests.length === 0 ? (
          <p className={`${card} text-sm text-slate-500`}>No service requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {serviceRequests.slice(0, 5).map((r) => (
              <li key={r.id} className={card}>
                <p className="font-serif text-lg text-white capitalize">{r.projectType}</p>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{r.description}</p>
                <p className="text-xs text-slate-500 mt-2">{r.status}{r.budget ? ` · ${r.budget}` : ''}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ClientBillingSection
        invoices={invoices}
        stripeEnabled={stripeEnabled}
        payingId={payingId}
        viewLoading={viewLoading}
        onPay={payInvoice}
        onView={openInvoice}
      />

      <section>
        <SectionTitle>Estimates &amp; Approvals</SectionTitle>
        {pendingProposals.length === 0 && proposals.length === 0 ? (
          <p className={`${card} text-sm text-slate-500`}>No estimates yet.</p>
        ) : (
          <ul className="space-y-3">
            {(pendingProposals.length > 0 ? pendingProposals : proposals).slice(0, 3).map((p) => (
              <li key={p.id} className={card}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-serif text-lg text-white">{p.title}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {p.status === 'sent' ? 'Awaiting your approval' : p.status} · valid until {formatDate(p.validUntil)}
                    </p>
                  </div>
                  {p.status === 'sent' && new Date(p.validUntil) >= new Date() && (
                    <Btn
                      size="sm"
                      onClick={() => { window.location.href = `mailto:${MESSAGE_NICO_EMAIL}?subject=${encodeURIComponent(`Approve estimate: ${p.title}`)}` }}
                    >
                      Approve proposal
                    </Btn>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {requestOpen && (
        <ClientRequestModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          onCreated={(row) => setServiceRequests((prev) => [row, ...prev])}
        />
      )}

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
