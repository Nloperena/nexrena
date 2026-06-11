'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PortalAccount, PortalInvoice, PortalProject, PortalProposal, PortalAsset, PortalServiceRequest } from '@/lib/portal-types'
import {
  fetchPortalInvoice,
  fetchPortalInvoices,
  fetchPortalMe,
  fetchPortalMessages,
  fetchPortalProjects,
  fetchPortalProposals,
  fetchPortalServiceRequests,
  fetchPortalAssets,
  fetchPortalBillingStatus,
  fetchPortalResources,
  createPortalCheckout,
  logoutPortal,
} from '@/lib/portal-client'
import { computePortalStats } from '@/lib/portal-dashboard-utils'
import { buildPortalActivity } from '@/lib/activity-utils'
import { formatDate } from '@/lib/store'
import { InvoicePrint } from '@/components/invoice-print'
import { UserMenu } from '@/components/user-menu'
import { AccountSettingsModal } from '@/components/account-settings-modal'
import { ClientDashboardStats } from '@/components/client-dashboard-stats'
import { ClientBillingSection } from '@/components/client-billing-section'
import { ClientWorkStatusSection } from '@/components/client-work-status-section'
import { ClientRequestModal } from '@/components/client-request-modal'
import { ClientMessageModal, type MessageCategoryId } from '@/components/client-message-modal'
import { ClientActionCards } from '@/components/client-action-cards'
import { ClientActivityFeed } from '@/components/client-activity-feed'
import { ClientCollapsibleSection } from '@/components/client-collapsible-section'
import { UploadFilesModal } from '@/components/upload-files-modal'
import { PortalFileList } from '@/components/portal-file-list'
import { ClientWebsitesSection } from '@/components/client-websites-section'
import type { PortalResource } from '@/lib/client-resource-utils'
import { StatusChip, proposalStatusChip } from '@/components/status-chip'
import type { Invoice, InvoiceStatus } from '@/lib/types'
import { Btn } from '@/components/ui'

type Props = { onSignOut: () => void }

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

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
  const billingRef = useRef<HTMLDivElement>(null)
  const [account, setAccount] = useState<PortalAccount | null>(null)
  const [projects, setProjects] = useState<PortalProject[]>([])
  const [invoices, setInvoices] = useState<PortalInvoice[]>([])
  const [proposals, setProposals] = useState<PortalProposal[]>([])
  const [serviceRequests, setServiceRequests] = useState<PortalServiceRequest[]>([])
  const [assets, setAssets] = useState<PortalAsset[]>([])
  const [resources, setResources] = useState<PortalResource[]>([])
  const [portalMessages, setPortalMessages] = useState<{ id: string; subject: string; createdAt: string }[]>([])
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [messageDefaultSubject, setMessageDefaultSubject] = useState('')
  const [messageDefaultCategory, setMessageDefaultCategory] = useState<MessageCategoryId | undefined>()
  const [viewInvoice, setViewInvoice] = useState<PortalInvoice | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [me, projectRows, invoiceRows, proposalRows, requestRows, assetRows, resourceRows, billing, messages] = await Promise.all([
        fetchPortalMe(),
        fetchPortalProjects(),
        fetchPortalInvoices(),
        fetchPortalProposals(),
        fetchPortalServiceRequests(),
        fetchPortalAssets(),
        fetchPortalResources(),
        fetchPortalBillingStatus(),
        fetchPortalMessages().catch(() => []),
      ])
      setAccount(me)
      setProjects(projectRows)
      setInvoices(invoiceRows)
      setProposals(proposalRows)
      setServiceRequests(requestRows)
      setAssets(assetRows)
      setResources(resourceRows)
      setStripeEnabled(billing.stripeEnabled)
      setPortalMessages(messages)
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

  const activity = useMemo(
    () => buildPortalActivity(invoices, proposals, serviceRequests, portalMessages),
    [invoices, proposals, serviceRequests, portalMessages],
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
    setPaymentError(null)
    try {
      const { url } = await createPortalCheckout(id)
      if (url) window.location.href = url
      else {
        const message = 'Could not start checkout.'
        setError(message)
        setPaymentError(message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment unavailable.'
      setError(message)
      setPaymentError(message)
    } finally {
      setPayingId(null)
    }
  }

  const openMessage = (opts?: { subject?: string; category?: MessageCategoryId }) => {
    setMessageDefaultSubject(opts?.subject ?? '')
    setMessageDefaultCategory(opts?.category)
    setMessageOpen(true)
  }

  const scrollToBilling = () => {
    billingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (viewInvoice) {
    return (
      <div className="max-w-6xl mx-auto flex flex-col gap-6 py-4">
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
    <div className="max-w-6xl mx-auto flex flex-col gap-10 py-4 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-white">Your workspace</h1>
          {account && (
            <p className="text-sm text-slate-400 mt-2">Welcome back, {account.name}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex">
            <Btn size="sm" onClick={() => openMessage({ category: 'other' })}>
              Message Nico
            </Btn>
          </span>
          {account && (
            <UserMenu
              name={account.name}
              subtitle={account.company ?? account.email}
              onOpenSettings={() => setSettingsOpen(true)}
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Overview — always visible */}
      <div className="space-y-10">
        <ClientDashboardStats stats={stats} />

        <ClientActionCards
          onMessage={() => openMessage({ category: 'other' })}
          onStartRequest={() => setRequestOpen(true)}
          onUpload={() => setUploadOpen(true)}
          onViewBilling={scrollToBilling}
        />

        <ClientActivityFeed items={activity} />
      </div>

      {/* Billing summary — open by default */}
      <div ref={billingRef}>
        <ClientBillingSection
          invoices={invoices}
          stripeEnabled={stripeEnabled}
          payingId={payingId}
          viewLoading={viewLoading}
          paymentError={paymentError}
          onPay={payInvoice}
          onView={openInvoice}
          onMessageNico={() => openMessage({ category: 'billing' })}
          mode="summary"
        />
      </div>

      {/* Collapsible sections */}
      <div className="space-y-4">
        <ClientCollapsibleSection
          id="websites"
          title="Your websites"
          defaultOpen={resources.length > 0}
          summary={
            resources.length > 0
              ? `${resources.length} website link${resources.length === 1 ? '' : 's'} available`
              : 'Your website code and live site links'
          }
        >
          {resources.length > 0 ? (
            <ClientWebsitesSection resources={resources} />
          ) : (
            <p className={`${card} text-sm text-slate-500 pt-4`}>
              No website links yet — your Nexrena team can add GitHub and live site links here.
            </p>
          )}
        </ClientCollapsibleSection>

        <ClientCollapsibleSection
          id="business-assets"
          title="Business assets"
          defaultOpen
          summary={
            assets.length > 0
              ? `${assets.length} file${assets.length === 1 ? '' : 's'} — upload or download anytime`
              : 'Upload logos, photos, or documents anytime'
          }
        >
          <div className="space-y-4 pt-4">
            <p className="text-sm text-slate-400">
              Your logos, photos, copy, and documents — always here when you need them.
            </p>
            <Btn size="sm" onClick={() => setUploadOpen(true)}>Upload files</Btn>
            <PortalFileList
              assets={assets}
              emptyMessage="No files yet — upload logos, photos, or documents anytime."
            />
          </div>
        </ClientCollapsibleSection>

        <ClientCollapsibleSection
          id="work-status"
          title="Projects & work status"
          defaultOpen={false}
          summary={
            activeProjects.length > 0
              ? `${activeProjects.length} active project${activeProjects.length === 1 ? '' : 's'}`
              : 'No active projects'
          }
        >
          <div className="pt-4">
            <ClientWorkStatusSection
              activeProjects={activeProjects}
              serviceRequests={serviceRequests}
              onStartRequest={() => setRequestOpen(true)}
              variant="projects"
            />
          </div>
        </ClientCollapsibleSection>

        <ClientCollapsibleSection
          id="requests"
          title="Requests"
          defaultOpen={false}
          summary={
            serviceRequests.length > 0
              ? `${serviceRequests.length} request${serviceRequests.length === 1 ? '' : 's'} on file`
              : 'No recent requests'
          }
        >
          <div className="pt-4">
            <ClientWorkStatusSection
              activeProjects={activeProjects}
              serviceRequests={serviceRequests}
              onStartRequest={() => setRequestOpen(true)}
              variant="requests"
            />
          </div>
        </ClientCollapsibleSection>

        <ClientCollapsibleSection
          id="estimates"
          title="Estimates & approvals"
          defaultOpen={false}
          summary={
            pendingProposals.length > 0
              ? `${pendingProposals.length} awaiting your approval`
              : proposals.length > 0 ? `${proposals.length} estimate${proposals.length === 1 ? '' : 's'}` : 'No estimates yet'
          }
        >
          <div className="pt-4">
            {proposals.length === 0 ? (
              <p className={`${card} text-sm text-slate-500`}>No estimates yet.</p>
            ) : (
              <ul className="space-y-3">
                {proposals.map((p) => {
                  const chip = proposalStatusChip(p.status, p.validUntil)
                  return (
                    <li key={p.id} className={card}>
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-serif text-lg text-white">{p.title}</p>
                            {chip && <StatusChip variant={chip} />}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">
                            Valid until {formatDate(p.validUntil)}
                          </p>
                        </div>
                        {p.status === 'sent' && new Date(p.validUntil) >= new Date() && (
                          <Btn
                            size="sm"
                            variant="ghost"
                            onClick={() => openMessage({ subject: `Approve estimate: ${p.title}`, category: 'other' })}
                          >
                            Approve proposal
                          </Btn>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </ClientCollapsibleSection>

        <ClientCollapsibleSection
          id="invoice-history"
          title="Invoice history"
          defaultOpen={false}
          summary={
            invoices.length > 0
              ? `${invoices.length} invoice${invoices.length === 1 ? '' : 's'} on file`
              : 'No invoices yet'
          }
        >
          <div className="pt-4">
            <ClientBillingSection
              invoices={invoices}
              stripeEnabled={stripeEnabled}
              payingId={payingId}
              viewLoading={viewLoading}
              onPay={payInvoice}
              onView={openInvoice}
              mode="history"
            />
          </div>
        </ClientCollapsibleSection>
      </div>

      {/* Mobile sticky help bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-[#111418] via-[#111418]/95 to-transparent pointer-events-none">
        <button
          type="button"
          onClick={() => openMessage({ category: 'other' })}
          className="pointer-events-auto w-full rounded-xl bg-gold text-obsidian font-semibold py-3.5 px-4 text-sm shadow-lg shadow-black/30 active:scale-[0.98] transition-transform"
        >
          Need help? Message Nico
        </button>
      </div>

      {messageOpen && (
        <ClientMessageModal
          open={messageOpen}
          defaultSubject={messageDefaultSubject}
          defaultCategory={messageDefaultCategory}
          onClose={() => {
            setMessageOpen(false)
            setMessageDefaultSubject('')
            setMessageDefaultCategory(undefined)
          }}
        />
      )}

      {uploadOpen && (
        <UploadFilesModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={(asset) => setAssets((prev) => [asset, ...prev])}
        />
      )}

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
