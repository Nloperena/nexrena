'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Invoice } from '@/lib/types'
import { InvoicePrint } from '@/components/invoice-print'
import { Btn } from '@/components/ui'

export default function InvoicePrintPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null | 'loading'>('loading')

  useEffect(() => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then((invoices: Invoice[]) => setInvoice(invoices.find(i => i.id === params.id) ?? null))
      .catch(() => setInvoice(null))
  }, [params.id])

  if (invoice === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#7A8A9E] text-sm">
        Loading invoice...
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-[#7A8A9E] text-sm">Invoice not found.</p>
        <Link href="/invoices" className="text-[#C9A96E] text-sm hover:underline">
          ← Back to Invoices
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Controls bar — hidden during print */}
      <div className="no-print fixed top-0 left-56 right-0 z-50 bg-[#0C0F12] border-b border-[#1E2530]
        px-6 py-3 flex items-center justify-between">
        <Link href="/invoices"
          className="text-sm text-[#7A8A9E] hover:text-white transition-colors flex items-center gap-2">
          ← Back to Invoices
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#3D4A5C] hidden md:block">
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
