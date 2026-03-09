import { Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/store'

// Brand tokens — light mode document (matches brand-identity.html)
const B = {
  ink:        '#1A1E26',
  warmWhite:  '#FDFCFA',
  cream:      '#F5F0E8',
  gold:       '#C9A96E',
  goldDim:    '#9B7D4E',
  goldLight:  '#E8D5B0',
  slate400:   '#7A8A9E',
  slate600:   '#3D4A5C',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  paid:      { bg: '#D1FAE5', color: '#065F46' },
  overdue:   { bg: '#FEE2E2', color: '#991B1B' },
  sent:      { bg: '#DBEAFE', color: '#1E40AF' },
  draft:     { bg: '#F3F4F6', color: '#374151' },
  cancelled: { bg: '#F3F4F6', color: '#9CA3AF' },
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
      color: B.goldDim, marginBottom: 10, fontFamily: 'inherit' }}>
      {children}
    </div>
  )
}

export function InvoicePrint({ invoice }: { invoice: Invoice }) {
  const total = invoice.lineItems.reduce((s, l) => s + l.quantity * l.rate, 0)
  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date()
  const displayStatus = isOverdue ? 'overdue' : invoice.status
  const statusStyle = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.draft

  return (
    <div id="invoice-print-root" style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: B.warmWhite,
      color: B.ink,
      padding: '64px 72px',
      maxWidth: 860,
      margin: '0 auto',
      minHeight: '100vh',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 400,
            lineHeight: 1, color: B.ink, letterSpacing: '-0.01em' }}>
            Nex<span style={{ color: B.goldDim }}>rena</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase' as const,
            color: B.slate400, marginTop: 8 }}>
            Digital Growth Agency
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const,
            color: B.slate400, marginBottom: 6 }}>
            Invoice
          </div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30,
            fontWeight: 600, color: B.ink }}>
            {invoice.number}
          </div>
        </div>
      </div>

      {/* Gold rule */}
      <div style={{ height: 1, background: `linear-gradient(90deg, ${B.goldDim}, ${B.goldLight}, transparent)`,
        marginBottom: 36 }} />

      {/* ── Date / Status row ── */}
      <div style={{ display: 'flex', gap: 48, marginBottom: 40 }}>
        {[
          { label: 'Issue Date', value: formatDate(invoice.issueDate), color: B.ink },
          { label: 'Due Date',   value: formatDate(invoice.dueDate),   color: isOverdue ? '#EF4444' : B.ink },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
              color: B.slate400, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 14, color }}>{value}</div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
            color: B.slate400, marginBottom: 6 }}>Status</div>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 500,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
            padding: '3px 10px', borderRadius: 3, ...statusStyle }}>
            {displayStatus}
          </div>
        </div>
        {invoice.paidDate && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
              color: B.slate400, marginBottom: 6 }}>Paid</div>
            <div style={{ fontSize: 14, color: B.ink }}>{formatDate(invoice.paidDate)}</div>
          </div>
        )}
      </div>

      {/* ── Bill To / From ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40,
        background: B.cream, borderRadius: 4, padding: '28px 32px', marginBottom: 48 }}>
        <div>
          <Label>Bill To</Label>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20,
            fontWeight: 400, color: B.ink }}>{invoice.clientName}</div>
        </div>
        <div>
          <Label>From</Label>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18,
            fontWeight: 400, color: B.ink, marginBottom: 6 }}>Nexrena LLC</div>
          <div style={{ fontSize: 12, color: B.slate600, lineHeight: 1.8, fontFamily: 'monospace',
            letterSpacing: '0.03em' }}>
            nexrena.com<br />hello@nexrena.com
          </div>
        </div>
      </div>

      {/* ── Line Items ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${B.ink}` }}>
            {['Description', 'Qty', 'Rate', 'Amount'].map((h, i) => (
              <th key={h} style={{
                textAlign: i === 0 ? 'left' : 'right' as const,
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                color: B.slate400, paddingBottom: 10, fontWeight: 500,
                width: i === 0 ? 'auto' : i === 1 ? 60 : 110,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map(item => (
            <tr key={item.id} style={{ borderBottom: `1px solid ${B.goldLight}` }}>
              <td style={{ padding: '14px 0', fontSize: 14, color: B.ink }}>{item.description}</td>
              <td style={{ padding: '14px 0', fontSize: 14, color: B.slate600, textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: '14px 0', fontSize: 14, color: B.slate600, textAlign: 'right',
                fontFamily: 'monospace' }}>{formatCurrency(item.rate)}</td>
              <td style={{ padding: '14px 0', fontSize: 14, color: B.ink, textAlign: 'right',
                fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(item.quantity * item.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Total ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 40 }}>
        <div style={{ borderTop: `1.5px solid ${B.ink}`, paddingTop: 16, minWidth: 280,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 48 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
            color: B.slate400, fontWeight: 500 }}>Total Due</div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30,
            fontWeight: 600, color: B.goldDim }}>
            {formatCurrency(total)}
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div style={{ border: `1px solid ${B.goldLight}`, borderRadius: 4, padding: '22px 28px', marginBottom: 48 }}>
        <Label>Notes & Payment Terms</Label>
        <div style={{ fontSize: 13, color: B.slate600, lineHeight: 1.75 }}>
          {invoice.notes
            ? invoice.notes
            : 'Payment accepted via ACH transfer, wire, or credit card (3% processing fee applies). Questions? hello@nexrena.com'}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${B.goldLight}`, paddingTop: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20,
          fontWeight: 400, color: B.ink }}>
          Nex<span style={{ color: B.goldDim }}>rena</span>
        </div>
        <div style={{ fontSize: 10, color: B.slate400, textAlign: 'right', lineHeight: 2,
          letterSpacing: '0.08em', fontFamily: 'monospace' }}>
          nexrena.com · hello@nexrena.com<br />
          Digital Growth Agency
        </div>
      </div>

    </div>
  )
}
