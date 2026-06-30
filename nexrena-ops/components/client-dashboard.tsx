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
  createPortalBalanceCheckout,
  logoutPortal,
} from '@/lib/portal-client'
import { computePortalStats } from '@/lib/portal-dashboard-utils'
import { buildPortalActivity } from '@/lib/activity-utils'
import { InvoicePrint } from '@/components/invoice-print'
import { ClientWorkspaceHome } from '@/components/client-workspace-home'
import { ClientRequestsView } from '@/components/client-requests-view'
import { ClientBillingSection } from '@/components/client-billing-section'
import { PortalSubscriptionsSection } from '@/components/portal-subscriptions-section'
import { ClientRequestModal } from '@/components/client-request-modal'
import { UploadFilesModal } from '@/components/upload-files-modal'
import { ClientFilesView } from '@/components/client-files-view'
import { ClientMessagesThreadView } from '@/components/client-messages-thread-view'
import { ClientWebsitesSection } from '@/components/client-websites-section'
import { ClientFormsView } from '@/components/client-forms-view'
import { ClientSettingsView } from '@/components/client-settings-view'
import { ClientScheduleView } from '@/components/client-schedule-view'
import { ClientPortalShell } from '@/components/client-portal-shell'
import { CopilotShell, CopilotLayout } from '@/components/copilot/copilot-shell'
import type { ClientPortalView } from '@/components/client-nav'
import { ClientShopView } from '@/components/client-shop-view'
import { readPortalViewFromUrl, readPortalShopParams, writePortalViewToUrl } from '@/lib/portal-view-url'
import type { PortalResource } from '@/lib/client-resource-utils'
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
  const [activeView, setActiveViewState] = useState<ClientPortalView>('home')
  const [viewReady, setViewReady] = useState(false)

  const setActiveView = useCallback((view: ClientPortalView) => {
    setActiveViewState(view)
    writePortalViewToUrl(view)
  }, [])
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
  const [loadWarning, setLoadWarning] = useState<string | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<PortalInvoice | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [shopParams, setShopParams] = useState({ sku: null as string | null, category: null as string | null, purchased: null as boolean | null })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLoadWarning(null)
    try {
      let me: PortalAccount
      try {
        me = await fetchPortalMe()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load your portal.')
        return
      }

      setAccount(me)

      const [
        projectsResult,
        invoicesResult,
        proposalsResult,
        requestsResult,
        resourcesResult,
        formsResult,
        billingResult,
        messagesResult,
      ] = await Promise.allSettled([
        fetchPortalProjects(),
        fetchPortalInvoices(),
        fetchPortalProposals(),
        fetchPortalServiceRequests(),
        fetchPortalResources(),
        fetchPortalFormSubmissions(),
        fetchPortalBillingStatus(),
        fetchPortalMessageThreads(),
      ])

      const failed: string[] = []

      if (projectsResult.status === 'fulfilled') setProjects(projectsResult.value)
      else { setProjects([]); failed.push('projects') }

      if (invoicesResult.status === 'fulfilled') setInvoices(invoicesResult.value)
      else { setInvoices([]); failed.push('billing') }

      if (proposalsResult.status === 'fulfilled') setProposals(proposalsResult.value)
      else { setProposals([]); failed.push('proposals') }

      if (requestsResult.status === 'fulfilled') setServiceRequests(requestsResult.value)
      else { setServiceRequests([]); failed.push('requests') }

      if (resourcesResult.status === 'fulfilled') setResources(resourcesResult.value)
      else { setResources([]); failed.push('websites') }

      if (formsResult.status === 'fulfilled') setFormSubmissions(formsResult.value)
      else { setFormSubmissions([]); failed.push('forms') }

      if (billingResult.status === 'fulfilled') setStripeEnabled(billingResult.value.stripeEnabled)
      else { setStripeEnabled(false); failed.push('payment settings') }

      if (messagesResult.status === 'fulfilled') {
        setMessageThreads(messagesResult.value.threads)
        setMessageUnread(messagesResult.value.unreadCount)
      } else {
        setMessageThreads([])
        setMessageUnread(0)
        failed.push('messages')
      }

      if (failed.length > 0) {
        setLoadWarning(`Some sections couldn't load (${failed.join(', ')}). Try refreshing.`)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    setActiveViewState(readPortalViewFromUrl())
    setShopParams(readPortalShopParams())
    setViewReady(true)

    const onPopState = () => {
      setActiveViewState(readPortalViewFromUrl())
      setShopParams(readPortalShopParams())
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const formsNewCount = useMemo(
    () => formSubmissions.filter((s) => s.status === 'new').length,
    [formSubmissions],
  )

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

  const payBalance = async () => {
    setPayingId('balance')
    setError(null)
    setPaymentError(null)
    try {
      const { url } = await createPortalBalanceCheckout()
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

  if (loading || !viewReady) {
    return (
      <div className="min-h-screen bg-[#111418] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-2xl border border-gold/20 bg-gold/10 flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
          </div>
          <p className="text-lg text-slate-300">Loading your workspace…</p>
        </div>
      </div>
    )
  }

  if (error && !account) {
    return (
      <div className="min-h-screen bg-[#111418] flex items-center justify-center px-6">
        <div className="space-y-4 text-center">
          <p className="text-lg text-red-300">{error}</p>
          <Btn size="sm" variant="ghost" onClick={handleSignOut}>Sign in again</Btn>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return (
          <ClientWorkspaceHome
            account={account}
            stats={stats}
            messageUnread={messageUnread}
            formsNewCount={formsNewCount}
            activity={activity}
            onNavigate={setActiveView}
            onStartRequest={() => setRequestOpen(true)}
          />
        )

      case 'copilot':
        return null

      case 'shop':
        return (
          <ClientShopView
            stripeEnabled={stripeEnabled}
            highlightSku={shopParams.sku}
            initialCategory={shopParams.category}
            purchased={shopParams.purchased}
            onNavigate={setActiveView}
          />
        )

      case 'billing':
        return (
          <div className="space-y-6 md:space-y-8">
            <ClientBillingSection
              invoices={invoices}
              stripeEnabled={stripeEnabled}
              payingId={payingId}
              viewLoading={viewLoading}
              paymentError={paymentError}
              onPay={payInvoice}
              onPayBalance={payBalance}
              onView={openInvoice}
              onMessageNico={() => setActiveView('messages')}
              mode="summary"
            />
            <div className={card}>
              <PortalSubscriptionsSection
                stripeEnabled={stripeEnabled}
                onError={setPaymentError}
                onMessage={() => {}}
              />
            </div>
            <ClientBillingSection
              invoices={invoices}
              stripeEnabled={stripeEnabled}
              payingId={payingId}
              viewLoading={viewLoading}
              onPay={payInvoice}
              onPayBalance={payBalance}
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
            No website links yet — your Nexrena team can add live site and staging links here.
          </p>
        )

      case 'forms':
        return <ClientFormsView submissions={formSubmissions} onSubmissionsChange={setFormSubmissions} />

      case 'requests':
        return (
          <ClientRequestsView
            proposals={proposals}
            activeProjects={activeProjects}
            serviceRequests={serviceRequests}
            invoices={invoices}
            onRequestCreated={(row) => setServiceRequests((prev) => [row, ...prev])}
            onNavigateToMessages={() => setActiveView('messages')}
          />
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
    <CopilotShell persona="client" clientView={activeView}>
    <ClientPortalShell
      activeView={activeView}
      onNavigate={setActiveView}
      messageUnread={messageUnread}
      formsNewCount={formsNewCount}
      account={account}
      onSignOut={handleSignOut}
    >
      <CopilotLayout>
      {loadWarning && <p className="text-base text-amber-300/90 mb-4">{loadWarning}</p>}
      {error && <p className="text-lg text-red-300 mb-4">{error}</p>}
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
      </CopilotLayout>
    </ClientPortalShell>
    </CopilotShell>
  )
}
