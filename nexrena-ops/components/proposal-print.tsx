import { Proposal } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/store'

const B = {
  ink: '#1A1E26',
  warmWhite: '#FDFCFA',
  cream: '#F5F0E8',
  gold: '#C9A96E',
  goldDim: '#9B7D4E',
  goldLight: '#E8D5B0',
  slate400: '#7A8A9E',
  slate600: '#3D4A5C',
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  accepted: { bg: '#D1FAE5', color: '#065F46' },
  declined: { bg: '#FEE2E2', color: '#991B1B' },
  sent: { bg: '#DBEAFE', color: '#1E40AF' },
  draft: { bg: '#F3F4F6', color: '#374151' },
  expired: { bg: '#F3F4F6', color: '#9CA3AF' },
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: B.goldDim, marginBottom: 10 }}>
      {children}
    </div>
  )
}

export function ProposalPrint({ proposal }: { proposal: Proposal }) {
  const subtotal = proposal.services.reduce((s, svc) => s + svc.price, 0)
  const total = subtotal - (proposal.discount || 0)
  const expired = proposal.status === 'sent' && new Date(proposal.validUntil) < new Date()
  const displayStatus = expired ? 'expired' : proposal.status
  const statusStyle = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.draft

  return (
    <div id="proposal-print-root" style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: B.warmWhite, color: B.ink,
      padding: '64px 72px', maxWidth: 860, margin: '0 auto', minHeight: '100vh',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 400, lineHeight: 1, color: B.ink }}>
            N&thinsp;e&thinsp;x&thinsp;r&thinsp;e&thinsp;n&thinsp;a
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase' as const, color: B.slate400, marginTop: 8 }}>
            Digital Growth Agency
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: B.slate400, marginBottom: 6 }}>
            Proposal
          </div>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, padding: '3px 10px', borderRadius: 3, backgroundColor: statusStyle.bg, color: statusStyle.color }}>
            {displayStatus}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: `linear-gradient(90deg, ${B.goldDim}, ${B.goldLight}, transparent)`, marginBottom: 36 }} />

      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 400, color: B.ink, marginBottom: 24 }}>
        {proposal.title}
      </div>

      <div style={{ display: 'flex', gap: 48, marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: B.slate400, marginBottom: 6 }}>Date</div>
          <div style={{ fontSize: 14, color: B.ink }}>{formatDate(proposal.createdAt)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: B.slate400, marginBottom: 6 }}>Valid Until</div>
          <div style={{ fontSize: 14, color: expired ? '#EF4444' : B.ink }}>{formatDate(proposal.validUntil)}</div>
        </div>
        {proposal.timeline && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: B.slate400, marginBottom: 6 }}>Timeline</div>
            <div style={{ fontSize: 14, color: B.ink }}>{proposal.timeline}</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, background: B.cream, borderRadius: 4, padding: '28px 32px', marginBottom: 48 }}>
        <div>
          <SectionLabel>Prepared For</SectionLabel>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 400, color: B.ink }}>
            {proposal.clientCompany || proposal.clientName}
          </div>
          {proposal.clientCompany && proposal.clientName && (
            <div style={{ fontSize: 13, color: B.slate600, marginTop: 4 }}>{proposal.clientName}</div>
          )}
          {proposal.clientEmail && (
            <div style={{ fontSize: 12, color: B.slate600, marginTop: 2 }}>{proposal.clientEmail}</div>
          )}
        </div>
        <div>
          <SectionLabel>Prepared By</SectionLabel>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 400, color: B.ink, marginBottom: 6 }}>
            Nexrena LLC
          </div>
          <div style={{ fontSize: 12, color: B.slate600, lineHeight: 1.8, fontFamily: 'monospace', letterSpacing: '0.03em' }}>
            Kissimmee, FL<br />hello@nexrena.com<br />nexrena.com
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <SectionLabel>Scope of Work</SectionLabel>
        <div style={{ fontSize: 14, color: B.ink, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{proposal.scopeOfWork}</div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr style={{ borderBottom: `1.5px solid ${B.ink}` }}>
            {['Service', 'Notes', 'Price'].map((h, i) => (
              <th key={h} style={{
                textAlign: i === 2 ? 'right' : 'left' as const,
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                color: B.slate400, paddingBottom: 10, fontWeight: 500,
                width: i === 2 ? 130 : undefined,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {proposal.services.map(svc => (
            <tr key={svc.id} style={{ borderBottom: `1px solid ${B.goldLight}` }}>
              <td style={{ padding: '14px 0', fontSize: 14, color: B.ink, fontWeight: 500 }}>{svc.description}</td>
              <td style={{ padding: '14px 0', fontSize: 13, color: B.slate600 }}>{svc.notes || ''}</td>
              <td style={{ padding: '14px 0', fontSize: 14, color: B.ink, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
                {formatCurrency(svc.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 40 }}>
        <div style={{ minWidth: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: B.slate600 }}>
            <span>Subtotal</span><span style={{ fontFamily: 'monospace' }}>{formatCurrency(subtotal)}</span>
          </div>
          {(proposal.discount || 0) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 13, color: '#059669' }}>
              <span>Discount</span><span style={{ fontFamily: 'monospace' }}>−{formatCurrency(proposal.discount)}</span>
            </div>
          )}
          <div style={{ borderTop: `1.5px solid ${B.ink}`, paddingTop: 16, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 48 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: B.slate400, fontWeight: 500 }}>
              Investment
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 30, fontWeight: 600, color: B.goldDim }}>
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>

      {proposal.notes && (
        <div style={{ border: `1px solid ${B.goldLight}`, borderRadius: 4, padding: '22px 28px', marginBottom: 48 }}>
          <SectionLabel>Additional Notes</SectionLabel>
          <div style={{ fontSize: 13, color: B.slate600, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{proposal.notes}</div>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${B.goldLight}`, paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 400, color: B.ink }}>
          Nex<span style={{ color: B.goldDim }}>rena</span>
        </div>
        <div style={{ fontSize: 10, color: B.slate400, textAlign: 'right', lineHeight: 2, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
          nexrena.com · hello@nexrena.com<br />Kissimmee, FL · Digital Growth Agency
        </div>
      </div>
    </div>
  )
}
