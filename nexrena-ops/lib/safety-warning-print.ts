import type { SafetyWarningReport } from '@/components/safety-warning-reports'

function esc(v: string): string {
  return v
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function formatMultiline(text: string): string {
  return esc(text).replaceAll('\n', '<br />')
}

export function buildSafetyWarningPrintHtml(report: SafetyWarningReport): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nexrena Safety Notice - ${esc(report.company)}</title>
  <style>
    body { margin: 0; background: #f3f4f6; color: #0c0f12; font-family: Arial, sans-serif; line-height: 1.55; }
    .page { width: 8.5in; min-height: 11in; margin: 18px auto; background: #fff; padding: .75in; border: 1px solid #e2e8f0; box-sizing: border-box; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:18px; border-bottom:1px solid #e2e8f0; }
    .brand { font-size: 36px; font-family: Georgia, serif; line-height:1; }
    .gold { color: #c9a96e; }
    .brand-sub { margin-top: 8px; font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:#475569; }
    .meta { text-align:right; font-size:12px; color:#475569; }
    h1 { font-size:22px; margin:0 0 18px; }
    .label { color:#a88d5c; letter-spacing:.16em; font-size:10px; text-transform:uppercase; margin-bottom:6px; font-weight:700; }
    .block { margin-bottom:20px; }
    .alert { border:1px solid #fecaca; background:#fef2f2; color:#7f1d1d; border-radius:8px; padding:14px 16px; margin:18px 0 20px; }
    .footer { margin-top:28px; padding-top:14px; border-top:1px solid #e2e8f0; font-size:11px; color:#475569; }
    @media print {
      body { background:#fff; }
      .page { margin:0; border:none; width:auto; min-height:auto; padding:.6in; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="header">
      <div>
        <div class="brand">Nex<span class="gold">rena</span></div>
        <div class="brand-sub">Digital Growth Agency</div>
      </div>
      <div class="meta">
        <div><strong>Safety Notice</strong></div>
        <div>Date: ${esc(report.date)}</div>
        <div>Reference: ${esc(report.company)}</div>
      </div>
    </header>
    <h1>${esc(report.subject)}</h1>
    <section class="block">
      <div class="label">To</div>
      <div>${esc(report.company)}<br />Attn: ${esc(report.clientName)}<br />${formatMultiline(report.address)}</div>
    </section>
    <section class="block">
      <div class="label">Observed Condition</div>
      <p>${formatMultiline(report.observedCondition)}</p>
    </section>
    <div class="alert"><strong>Fire Hazard Advisory:</strong> ${formatMultiline(report.hazardStatement)}</div>
    <section class="block">
      <div class="label">Recommendations</div>
      <p>${formatMultiline(report.recommendations)}</p>
    </section>
    <section class="block">
      <div class="label">Scope Limitation</div>
      <p>${formatMultiline(report.scopeLimitation)}</p>
    </section>
    <footer class="footer">Nexrena LLC · NicholasL@Nexrena.com · nexrena.com</footer>
  </main>
</body>
</html>`
}
