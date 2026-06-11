'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PortalAccount, PortalInvoice, PortalProject, PortalProposal, PortalServiceRequest, PortalMessageThread, PortalFormSubmission } from '@/lib/portal-types'
import {
  fetchPortalInvoice,
  fetchPortalInvoices,
  fetchPortalMe,
  fetchPortalMessageThreads,
  fetchPortalProjects,
  fetchPortalProposals,
  fetchPortalServiceRequests,
  fetchPortalBillingStatus,
  fetchPortalResources,
  fetchPortalFormSubmissions,
  createPortalCheckout,
  logoutPortal,
} from '@/lib/portal-client'
import { computePortalStats } from '@/lib/portal-dashboard-utils'
import { buildPortalActivity } from '@/lib/activity-utils'
import { formatDate } from '@/lib/store'
import { InvoicePrint } from '@/components/invoice-print'
import { ClientDashboardStats } from '@/components/client-dashboard-stats'
import { ClientBillingSection } from '@/components/client-billing-section'
import { ClientWorkStatusSection } from '@/components/client-work-status-section'
import { ClientRequestModal } from '@/components/client-request-modal'
import { ClientActionCards } from '@/components/client-action-cards'
import { ClientActivityFeed } from '@/components/client-activity-feed'
import { UploadFilesModal } from '@/components/upload-files-modal'
import { ClientFilesView } from '@/components/client-files-view'
import { ClientMessagesThreadView } from '@/components/client-messages-thread-view'
import { ClientWebsitesSection } from '@/components/client-websites-section'
import { ClientFormHistorySection } from '@/components/client-form-history-section'
import { ClientSettingsView } from '@/components/client-settings-view'
import { ClientScheduleView } from '@/components/client-schedule-view'
import { ClientPortalShell } from '@/components/client-portal-shell'
import type { ClientPortalView } from '@/components/client-nav'
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
  const [activeView, setActiveView] = useState<ClientPortalView>('home')
  const [account, setAccount] = useState<PortalAccount | null>(null)
  const [projects, setProjects] = useState<PortalProject[]>([])
  const [invoices, setInvoices] = useState<PortalInvoice[]>([])
  const [proposals, setProposals] = useState<PortalProposal[]>([])
  const [serviceRequests, setServiceRequests] = useState<PortalServiceRequest[]>([])
  const [resources, setResources] = useState<PortalResource[]>([])
  const [formSubmissions, setFormSubmissions] = useState<PortalFormSubmission[]>([])
  const [messageThreads, setMessageThreads] = useState<PortalMessageThread[]>([])
  const [messageUnread, setMessageUnread] = useState(0)
  const [stripeEnabled, setStripeEnabled] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<PortalInvoice | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [me, projectRows, invoiceRows, proposalRows, requestRows, resourceRows, formRows, billing, messages] = await Promise.all([
        fetchPortalMe(),
        fetchPortalProjects(),
        fetchPortalInvoices(),
        fetchPortalProposals(),
        fetchPortalServiceRequests(),
        fetchPortalResources(),
        fetchPortalFormSubmissions().catch(() => []),
        fetchPortalBillingStatus(),
        fetchPortalMessageThreads().catch(() => ({ threads: [], unreadCount: 0 })),
      ])
      setAccount(me)
      setProjects(projectRows)
      setInvoices(invoiceRows)
      setProposals(proposalRows)
      setServiceRequests(requestRows)
      setResources(resourceRows)
      setFormSubmissions(formRows)
      setStripeEnabled(billing.stripeEnabled)
      setMessageThreads(messages.threads)
      setMessageUnread(messages.unreadCount)
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

  const portalMessages = useMemo(
    () => messageThreads.flatMap((t) =>
      t.messages
        .filter((m) => m.direction === 'client')
        .map((m) => ({ id: m.id, subject: m.subject, createdAt: m.createdAt })),
    ),
    [messageThreads],
  )

  const activity = useMemo(
    () => buildPortalActivity(invoices, proposals, serviceRequests, portalMessages),
    [invoices, proposals, serviceRequests, portalMessages],
  )

  const activeProjects = useMemo(
    () => projects.filter((p) => !['delivered', 'on_hold', 'not_started'].includes(p.status)),
    [projects],
  )

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

  if (viewInvoice) {
    return (
      <div className="min-h-screen bg-[#111418] px-4 md:px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <Btn size="sm" variant="ghost" onClick={() => setViewInvoice(null)}>← Back</Btn>
            <Btn size="sm" onClick={() => window.print()}>Print / PDF</Btn>
          </div>
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/40">
            <InvoicePrint invoice={toPrintInvoice(viewInvoice)} />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111418] flex items-center justify-center">
        <p className="text-sm text-slate-400 animate-pulse">Loading your workspace…</p>
      </div>
    )
  }

  if (error && !account) {
    return (
      <div className="min-h-screen bg-[#111418] flex items-center justify-center px-6">
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-400">{error}</p>
          <Btn size="sm" variant="ghost" onClick={handleSignOut}>Sign in again</Btn>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return (
          <div className="space-y-8">
            <ClientDashboardStats stats={stats} />
            <ClientActionCards
              onMessage={() => setActiveView('messages')}
              onSchedule={() => setActiveView('schedule')}
              onStartRequest={() => setRequestOpen(true)}
              onUpload={() => setUploadOpen(true)}
              onViewBilling={() => setActiveView('billing')}
            />
            <ClientActivityFeed items={activity} />
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-8">
            <ClientBillingSection
              invoices={invoices}
              stripeEnabled={stripeEnabled}
              payingId={payingId}
              viewLoading={viewLoading}
              paymentError={paymentError}
              onPay={payInvoice}
              onView={openInvoice}
              onMessageNico={() => setActiveView('messages')}
              mode="summary"
            />
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
        )

      case 'messages':
        return (
          <ClientMessagesThreadView
            variant="full"
            onUnreadChange={setMessageUnread}
          />
        )

      case 'schedule':
        return <ClientScheduleView account={account} />

      case 'files':
        return <ClientFilesView />

      case 'websites':
        return resources.length > 0 ? (
          <ClientWebsitesSection resources={resources} />
        ) : (
          <p className={`${card} text-sm text-slate-500`}>
            No website links yet — your Nexrena team can add GitHub and live site links here.
          </p>
        )

      case 'requests':
        return (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Track project work and service requests.</p>
              <Btn size="sm" onClick={() => setRequestOpen(true)}>Start a request</Btn>
            </div>
            <ClientWorkStatusSection
              activeProjects={activeProjects}
              serviceRequests={serviceRequests}
              invoices={invoices}
              onStartRequest={() => setRequestOpen(true)}
              variant="projects"
            />
            <ClientWorkStatusSection
              activeProjects={activeProjects}
              serviceRequests={serviceRequests}
              invoices={invoices}
              onStartRequest={() => setRequestOpen(true)}
              variant="requests"
            />
            {proposals.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm uppercase tracking-widest text-slate-400 font-medium">Estimates & approvals</h3>
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
                              onClick={() => setActiveView('messages')}
                            >
                              Approve via message
                            </Btn>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            <ClientFormHistorySection submissions={formSubmissions} />
          </div>
        )

      case 'settings':
        return account ? (
          <ClientSettingsView account={account} onUpdated={setAccount} />
        ) : null

      default:
        return null
    }
  }

  return (
    <ClientPortalShell
      activeView={activeView}
      onNavigate={setActiveView}
      messageUnread={messageUnread}
      account={account}
      onSignOut={handleSignOut}
    >
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {renderView()}

      {uploadOpen && (
        <UploadFilesModal
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setActiveView('files')
          }}
        />
      )}

      {requestOpen && (
        <ClientRequestModal
          open={requestOpen}
          onClose={() => setRequestOpen(false)}
          onCreated={(row) => {
            setServiceRequests((prev) => [row, ...prev])
            setActiveView('requests')
          }}
        />
      )}
    </ClientPortalShell>
  )
}
