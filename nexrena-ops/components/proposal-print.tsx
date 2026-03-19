import { Proposal } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/store'

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
  accepted: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  declined: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  sent: { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  draft: { bg: '#F8FAFC', color: '#475569', border: '#E2E8F0' },
  expired: { bg: '#F8FAFC', color: '#94A3B8', border: '#E2E8F0' },
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

export function ProposalPrint({ proposal }: { proposal: Proposal }) {
  const subtotal = proposal.services.reduce((s, svc) => s + svc.price, 0)
  const total = subtotal - (proposal.discount || 0)
  const expired = proposal.status === 'sent' && new Date(proposal.validUntil) < new Date()
  const displayStatus = expired ? 'expired' : proposal.status
  const statusStyle = STATUS_STYLES[displayStatus] ?? STATUS_STYLES.draft

  return (
    <div id="proposal-print-root" style={{
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
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
            Proposal
          </div>
        </div>
      </div>

      <div style={{ 
        fontFamily: "'Playfair Display', Georgia, serif", 
        fontSize: 32, 
        fontWeight: 400, 
        color: B.ink, 
        marginBottom: 40,
        lineHeight: 1.2
      }}>
        {proposal.title}
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
        {/* Prepared For */}
        <div>
          <SectionLabel>Prepared For</SectionLabel>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif", 
            fontSize: 22,
            fontWeight: 500, 
            color: B.ink,
            lineHeight: 1.2,
            marginBottom: 8
          }}>
            {proposal.clientCompany || proposal.clientName}
          </div>
          {proposal.clientCompany && proposal.clientName && (
            <div style={{ fontSize: 13, color: B.slate600, marginBottom: 4 }}>{proposal.clientName}</div>
          )}
          {proposal.clientEmail && (
            <div style={{ fontSize: 13, color: B.slate600, marginBottom: 4 }}>{proposal.clientEmail}</div>
          )}
        </div>

        {/* Details */}
        <div>
          <SectionLabel>Details</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: B.slate400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Date</div>
              <div style={{ fontSize: 14, color: B.ink, fontWeight: 500 }}>{formatDate(proposal.createdAt)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: B.slate400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Valid Until</div>
              <div style={{ fontSize: 14, color: expired ? '#EF4444' : B.ink, fontWeight: 500 }}>{formatDate(proposal.validUntil)}</div>
            </div>
            {proposal.timeline && (
              <div>
                <div style={{ fontSize: 10, color: B.slate400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Timeline</div>
                <div style={{ fontSize: 14, color: B.ink, fontWeight: 500 }}>{proposal.timeline}</div>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <SectionLabel>Status</SectionLabel>
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
          </div>
        </div>
      </div>

      {/* Scope of Work */}
      <div style={{ marginBottom: 48 }}>
        <SectionLabel>Scope of Work</SectionLabel>
        <div style={{ 
          fontSize: 14, 
          color: B.slate600, 
          lineHeight: 1.8, 
          whiteSpace: 'pre-wrap',
          maxWidth: '85%'
        }}>
          {proposal.scopeOfWork}
        </div>
      </div>

      {/* Services */}
      <div style={{ flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: 16, borderBottom: `2px solid ${B.ink}` }}>
                <SectionLabel>Service</SectionLabel>
              </th>
              <th style={{ textAlign: 'left', paddingBottom: 16, borderBottom: `2px solid ${B.ink}` }}>
                <SectionLabel>Notes</SectionLabel>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: 16, borderBottom: `2px solid ${B.ink}`, width: '20%' }}>
                <SectionLabel>Investment</SectionLabel>
              </th>
            </tr>
          </thead>
          <tbody>
            {proposal.services.map(svc => (
              <tr key={svc.id}>
                <td style={{ 
                  padding: '20px 0', 
                  fontSize: 15, 
                  color: B.ink, 
                  borderBottom: `1px solid ${B.border}`,
                  fontWeight: 500,
                  verticalAlign: 'top'
                }}>
                  {svc.description}
                </td>
                <td style={{ 
                  padding: '20px 16px 20px 0', 
                  fontSize: 14, 
                  color: B.slate600, 
                  borderBottom: `1px solid ${B.border}`,
                  verticalAlign: 'top',
                  lineHeight: 1.6
                }}>
                  {svc.notes || '—'}
                </td>
                <td style={{ 
                  padding: '20px 0', 
                  fontSize: 16, 
                  color: B.ink, 
                  textAlign: 'right', 
                  fontFamily: 'monospace', 
                  fontWeight: 600,
                  borderBottom: `1px solid ${B.border}`,
                  verticalAlign: 'top'
                }}>
                  {formatCurrency(svc.price)}
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
            
            {(proposal.discount || 0) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 14, color: '#059669' }}>
                <span>Discount</span>
                <span style={{ fontFamily: 'monospace' }}>−{formatCurrency(proposal.discount)}</span>
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
                Total Investment
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
        {proposal.notes && (
          <div style={{ 
            background: B.cream, 
            padding: '32px', 
            borderRadius: 8,
            marginBottom: 40
          }}>
            <SectionLabel>Additional Notes</SectionLabel>
            <div style={{ 
              fontSize: 13, 
              color: B.slate600, 
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap'
            }}>
              {proposal.notes}
            </div>
          </div>
        )}

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
            NicholasL@Nexrena.com<br />
            nexrena.com<br />
            Kissimmee, FL
          </div>
        </div>
      </div>

    </div>
  )
}
