'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Invoice } from '@/lib/types'
import { InvoicePrint } from '@/components/invoice-print'
import { Btn, LinkBtn } from '@/components/ui'
import { api } from '@/lib/api'

export default function InvoicePrintPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null | 'loading'>('loading')

  const load = useCallback(() => {
    setInvoice('loading')
    api.get<Invoice[]>('/invoices')
      .then(invoices => {
        const found = invoices.find(i => i.id === params.id) ?? null
        setInvoice(found)
        if (found) document.title = `Invoice ${found.number} - ${found.clientName}`
      })
      .catch(() => setInvoice(null))
  }, [params.id])

  useEffect(() => {
    load()
    return () => { document.title = 'Nexrena' }
  }, [load])

  if (invoice === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading invoice…
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-slate-400 text-sm">Invoice not found.</p>
        <Link href="/invoices" className="text-gold text-sm hover:underline">
          ← Back to Invoices
        </Link>
      </div>
    )
  }

  const emailSubject = encodeURIComponent(`Invoice ${invoice.number} from Nexrena LLC`)
  const emailBody = encodeURIComponent(
    `Hi ${invoice.clientName},\n\nPlease find attached invoice ${invoice.number}.\n\nBest regards,\nNexrena LLC\nNicholasL@Nexrena.com`
  )
  const mailtoHref = `mailto:${invoice.clientEmail ?? ''}?subject=${emailSubject}&body=${emailBody}`

  return (
    <>
      {/* Controls bar — hidden during print */}
      <div className="no-print fixed top-0 left-56 right-0 z-50 bg-obsidian border-b border-slate-800/60
        px-6 py-3 flex items-center justify-between">
        <Link href="/invoices"
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2">
          ← Back to Invoices
        </Link>
        <div className="flex items-center gap-3">
          {invoice.clientEmail && (
            <LinkBtn href={mailtoHref} variant="ghost">✉ Email Client</LinkBtn>
          )}
          <Btn variant="ghost" onClick={load}>↻ Refresh</Btn>
          <span className="text-xs text-slate-600 hidden md:block">
            Choose &ldquo;Save as PDF&rdquo; in your browser&apos;s print dialog
          </span>
          <Btn onClick={() => window.print()}>
            Download PDF
          </Btn>
        </div>
      </div>

      {/* Invoice preview */}
      <div className="pt-14 pb-16 print:pt-0 print:pb-0 bg-[#111418] print:bg-white min-h-screen">
        {/* Preview shadow wrapper — hidden during print */}
        <div className="no-print max-w-[900px] mx-auto my-8 shadow-2xl shadow-black/60 rounded">
          <InvoicePrint invoice={invoice} />
        </div>
        {/* Print-only: no wrapper, just the document */}
        <div className="hidden print:block">
          <InvoicePrint invoice={invoice} />
        </div>
      </div>
    </>
  )
}
