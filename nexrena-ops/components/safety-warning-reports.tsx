'use client'

import { useEffect, useMemo, useState } from 'react'
import { Btn, Field, SectionCard, inputCls } from '@/components/ui'

type SafetyWarningReport = {
  id: string
  createdAt: string
  date: string
  clientName: string
  company: string
  address: string
  subject: string
  observedCondition: string
  hazardStatement: string
  recommendations: string
  scopeLimitation: string
}

const STORAGE_KEY = 'nx-ops-safety-warning-reports'

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

function buildPrintHtml(report: SafetyWarningReport): string {
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

export function SafetyWarningReports() {
  const [reports, setReports] = useState<SafetyWarningReport[]>([])
  const [form, setForm] = useState<Omit<SafetyWarningReport, 'id' | 'createdAt'>>({
    date: new Date().toISOString().slice(0, 10),
    clientName: 'Joe Loperena',
    company: 'Furniture Packages USA',
    address: '2440 Tesoro Court\nKissimmee, FL 34744',
    subject: 'Written Safety Warning and Scope Limitation',
    observedCondition:
      'Equipment area has poor ventilation and significant heat buildup. Extension cords / standard power strip usage observed inside wall box while multiple adapters and game consoles are operating.',
    hazardStatement:
      'Current configuration presents a fire-risk condition and should not remain in service without corrective action.',
    recommendations:
      'Route only low-voltage HDMI/Ethernet in wall path. Remove extension-cord/power-strip use from enclosed wall cavity. Reconfigure power handling and improve airflow/thermal conditions.',
    scopeLimitation:
      'Nexrena service provided low-voltage AV diagnosis/remediation planning only. Any in-wall AC/high-voltage correction must be performed to local code and may require a licensed electrician.',
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as SafetyWarningReport[]
      if (Array.isArray(parsed)) setReports(parsed)
    } catch {
      // Ignore malformed local data
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  }, [reports])

  const sorted = useMemo(
    () => [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reports]
  )

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const createReport = () => {
    const report: SafetyWarningReport = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...form,
    }
    setReports((prev) => [report, ...prev])
  }

  const removeReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id))
  }

  const printReport = (report: SafetyWarningReport) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(buildPrintHtml(report))
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <SectionCard className="p-6 mt-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="font-serif text-base text-white mb-5">Safety Warning Reports</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Field label="Date">
          <input type="date" className={inputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
        </Field>
        <Field label="Subject">
          <input className={inputCls} value={form.subject} onChange={(e) => setField('subject', e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <Field label="Client Name">
          <input className={inputCls} value={form.clientName} onChange={(e) => setField('clientName', e.target.value)} />
        </Field>
        <Field label="Company">
          <input className={inputCls} value={form.company} onChange={(e) => setField('company', e.target.value)} />
        </Field>
        <Field label="Address">
          <input className={inputCls} value={form.address.replaceAll('\n', ', ')} onChange={(e) => setField('address', e.target.value)} />
        </Field>
      </div>

      <div className="space-y-4 mb-4">
        <Field label="Observed Condition">
          <textarea rows={3} className={inputCls} value={form.observedCondition} onChange={(e) => setField('observedCondition', e.target.value)} />
        </Field>
        <Field label="Hazard Statement">
          <textarea rows={2} className={inputCls} value={form.hazardStatement} onChange={(e) => setField('hazardStatement', e.target.value)} />
        </Field>
        <Field label="Recommendations">
          <textarea rows={3} className={inputCls} value={form.recommendations} onChange={(e) => setField('recommendations', e.target.value)} />
        </Field>
        <Field label="Scope Limitation">
          <textarea rows={3} className={inputCls} value={form.scopeLimitation} onChange={(e) => setField('scopeLimitation', e.target.value)} />
        </Field>
      </div>

      <div className="flex justify-end mb-6">
        <Btn onClick={createReport}>+ Save Warning Report</Btn>
      </div>

      <div className="border-t border-slate-800/60 pt-5">
        <h4 className="text-sm text-slate-300 mb-3">Saved Safety Warnings</h4>
        {sorted.length === 0 ? (
          <p className="text-xs text-slate-600">No warning reports saved yet.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-900/30 px-3 py-2">
                <div>
                  <div className="text-sm text-white">{r.company} — {r.subject}</div>
                  <div className="text-[11px] text-slate-500">{r.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Btn size="sm" variant="ghost" onClick={() => printReport(r)}>Print</Btn>
                  <Btn size="sm" variant="danger" onClick={() => removeReport(r.id)}>Delete</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}

