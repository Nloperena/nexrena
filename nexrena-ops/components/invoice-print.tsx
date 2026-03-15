import { Invoice } from '@/lib/types'
import { formatCurrency, formatDate, invoiceSubtotal } from '@/lib/store'

// Brand tokens — elegant, clean, modern editorial style
const B = {
  ink: '#0F1115',          // Very dark slate
  warmWhite: '#FFFFFF',    // Crisp white for print
  cream: '#F9FAFB',        // Very subtle cool gray/cream for boxes
  gold: '#C9A96E',         // Nexrena gold
  goldDim: '#A88D5C',
  goldLight: '#E8D5B0',
  slate400: '#8A99A8',     // Mid gray for labels
  slate600: '#475569',     // Darker gray for secondary text
  border: '#E2E8F0',       // Light border color
}

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  paid: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  overdue: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  sent: { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  draft: { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
  cancelled: { bg: '#F8FAFC', color: '#94A3B8', border: '#E2E8F0' },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9, 
      letterSpacing: '0.25em', 
      textTransform: 'uppercase',
      color: B.slate400, 
      marginBottom: 12, 
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 600,
    }}>
      {children}
    </div>
  )
}

export function InvoicePrint({ invoice }: { invoice: Invoice }) {
  const subtotal = invoiceSubtotal(invoice)
  const taxAmt = invoice.taxRate ? subtotal * (invoice.taxRate / 100) : 0
  const total = subtotal + taxAmt
  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date()
  const displayStatus = isOverdue ? 'overdue' : invoice.status
  const statusStyle = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.draft

  return (
    <div id="invoice-print-root" style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: B.warmWhite, 
      color: B.ink,
      padding: '80px', 
      maxWidth: 900, 
      margin: '0 auto', 
      minHeight: '1122px', // Approx A4/Letter min height
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 60 }}>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif", 
            fontSize: 42, 
            fontWeight: 500,
            lineHeight: 1, 
            color: B.ink, 
            letterSpacing: '-0.02em',
          }}>
            Nex<span style={{ color: B.gold }}>rena</span>
          </div>
          <div style={{
            fontSize: 10, 
            letterSpacing: '0.3em', 
            textTransform: 'uppercase',
            color: B.slate600, 
            marginTop: 12,
            fontWeight: 500
          }}>
            Digital Growth Agency
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 12, 
            letterSpacing: '0.4em', 
            textTransform: 'uppercase',
            color: B.goldDim, 
            marginBottom: 8,
            fontWeight: 600
          }}>
            Invoice
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif", 
            fontSize: 24,
            fontWeight: 300, 
            color: B.slate600,
            letterSpacing: '0.05em'
          }}>
            {invoice.number}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: 32, 
        marginBottom: 60,
        borderTop: `1px solid ${B.border}`,
        borderBottom: `1px solid ${B.border}`,
        padding: '32px 0'
      }}>
        {/* Bill To */}
        <div>
          <SectionLabel>Billed To</SectionLabel>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif", 
            fontSize: 22,
            fontWeight: 500, 
            color: B.ink,
            lineHeight: 1.2,
            marginBottom: 8
          }}>
            {invoice.clientCompany || invoice.clientName}
          </div>
          {invoice.clientCompany && invoice.clientName && (
            <div style={{ fontSize: 13, color: B.slate600, marginBottom: 4 }}>{invoice.clientName}</div>
          )}
          {invoice.clientEmail && (
            <div style={{ fontSize: 13, color: B.slate600, marginBottom: 4 }}>{invoice.clientEmail}</div>
          )}
          {invoice.clientAddress && (
            <div style={{ fontSize: 13, color: B.slate600, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {invoice.clientAddress}
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div>
          <SectionLabel>Invoice Details</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: B.slate400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Issue Date</div>
              <div style={{ fontSize: 14, color: B.ink, fontWeight: 500 }}>{formatDate(invoice.issueDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: B.slate400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Due Date</div>
              <div style={{ fontSize: 14, color: isOverdue ? '#EF4444' : B.ink, fontWeight: 500 }}>{formatDate(invoice.dueDate)}</div>
            </div>
            {invoice.projectName && (
              <div>
                <div style={{ fontSize: 10, color: B.slate400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Project</div>
                <div style={{ fontSize: 14, color: B.ink, fontWeight: 500 }}>{invoice.projectName}</div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <SectionLabel>Payment Status</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              display: 'inline-flex', 
              fontSize: 11, 
              fontWeight: 600,
              letterSpacing: '0.15em', 
              textTransform: 'uppercase',
              padding: '6px 14px', 
              borderRadius: 20,
              backgroundColor: statusStyle.bg, 
              color: statusStyle.color,
              border: `1px solid ${statusStyle.border}`
            }}>
              {displayStatus}
            </div>
            {invoice.paidDate && (
              <div>
                <div style={{ fontSize: 10, color: B.slate400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Date Paid</div>
                <div style={{ fontSize: 14, color: B.ink, fontWeight: 500 }}>{formatDate(invoice.paidDate)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div style={{ flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: 16, borderBottom: `2px solid ${B.ink}` }}>
                <SectionLabel>Description</SectionLabel>
              </th>
              <th style={{ textAlign: 'center', paddingBottom: 16, borderBottom: `2px solid ${B.ink}`, width: '15%' }}>
                <SectionLabel>Qty / Hrs</SectionLabel>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: 16, borderBottom: `2px solid ${B.ink}`, width: '20%' }}>
                <SectionLabel>Rate</SectionLabel>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: 16, borderBottom: `2px solid ${B.ink}`, width: '25%' }}>
                <SectionLabel>Amount</SectionLabel>
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ 
                  padding: '20px 0', 
                  fontSize: 15, 
                  color: B.ink, 
                  borderBottom: `1px solid ${B.border}`,
                  fontWeight: 500
                }}>
                  {item.description}
                </td>
                <td style={{ 
                  padding: '20px 0', 
                  fontSize: 15, 
                  color: B.slate600, 
                  textAlign: 'center',
                  borderBottom: `1px solid ${B.border}`
                }}>
                  {item.quantity}
                </td>
                <td style={{ 
                  padding: '20px 0', 
                  fontSize: 15, 
                  color: B.slate600, 
                  textAlign: 'right', 
                  fontFamily: 'monospace',
                  borderBottom: `1px solid ${B.border}`
                }}>
                  {formatCurrency(item.rate)}
                </td>
                <td style={{ 
                  padding: '20px 0', 
                  fontSize: 16, 
                  color: B.ink, 
                  textAlign: 'right', 
                  fontFamily: 'monospace', 
                  fontWeight: 600,
                  borderBottom: `1px solid ${B.border}`
                }}>
                  {formatCurrency(item.quantity * item.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
          <div style={{ width: '45%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 14, color: B.slate600 }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurrency(subtotal)}</span>
            </div>
            
            {(invoice.taxRate ?? 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 14, color: B.slate600 }}>
                <span>Tax ({invoice.taxRate}%)</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(taxAmt)}</span>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '24px', 
              marginTop: '12px',
              borderTop: `2px solid ${B.ink}` 
            }}>
              <span style={{ 
                fontSize: 12, 
                letterSpacing: '0.2em', 
                textTransform: 'uppercase', 
                color: B.ink, 
                fontWeight: 600 
              }}>
                Total Due
              </span>
              <span style={{ 
                fontFamily: "'Playfair Display', Georgia, serif", 
                fontSize: 36, 
                fontWeight: 600, 
                color: B.ink 
              }}>
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Push footer to bottom */}
      <div style={{ marginTop: 'auto', paddingTop: 60 }}>
        <div style={{ 
          background: B.cream, 
          padding: '32px', 
          borderRadius: 8,
          marginBottom: 40
        }}>
          <SectionLabel>Payment Terms & Notes</SectionLabel>
          <div style={{ 
            fontSize: 13, 
            color: B.slate600, 
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}>
            {invoice.notes ||
              'Payment is due within 15 days of invoice date. Nexrena LLC accepts payment via ACH bank transfer, wire transfer, or Stripe. A 1.5% monthly late fee applies to overdue balances. Thank you for your business.'}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end',
          borderTop: `1px solid ${B.border}`,
          paddingTop: 32
        }}>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif", 
              fontSize: 24, 
              fontWeight: 500, 
              color: B.ink,
              marginBottom: 8
            }}>
              Nex<span style={{ color: B.gold }}>rena</span> LLC
            </div>
            <div style={{ fontSize: 12, color: B.slate400 }}>
              Digital Growth Agency
            </div>
          </div>
          
          <div style={{ 
            fontSize: 12, 
            color: B.slate600, 
            textAlign: 'right', 
            lineHeight: 1.8,
          }}>
            hello@nexrena.com<br />
            nexrena.com<br />
            Kissimmee, FL
          </div>
        </div>
      </div>

    </div>
  )
}
