'use client'

import { useEffect, useMemo, useState } from 'react'
import { Btn, Field } from '@/components/ui'
import { Card } from '@/components/design-system'
import { teamInputCls } from '@/lib/team-a11y'
import { buildSafetyWarningPrintHtml } from '@/lib/safety-warning-print'

export type SafetyWarningReport = {
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

const DEFAULT_FORM: Omit<SafetyWarningReport, 'id' | 'createdAt'> = {
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
}

export function SafetyWarningReports() {
  const [reports, setReports] = useState<SafetyWarningReport[]>([])
  const [form, setForm] = useState(DEFAULT_FORM)

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
    [reports],
  )

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const createReport = () => {
    setReports((prev) => [
      { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...form },
      ...prev,
    ])
  }

  const loadReport = (report: SafetyWarningReport) => {
    const { id: _id, createdAt: _createdAt, ...rest } = report
    setForm(rest)
  }

  const printReport = (report: SafetyWarningReport) => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.open()
    w.document.write(buildSafetyWarningPrintHtml(report))
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div>
          <h2 className="font-serif text-lg text-white">New safety notice</h2>
          <p className="text-sm text-slate-400 mt-1">
            Document on-site hazards and scope limits, then print or save for the client file.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Date">
            <input type="date" className={teamInputCls} value={form.date} onChange={(e) => setField('date', e.target.value)} />
          </Field>
          <Field label="Subject">
            <input className={teamInputCls} value={form.subject} onChange={(e) => setField('subject', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Client name">
            <input className={teamInputCls} value={form.clientName} onChange={(e) => setField('clientName', e.target.value)} />
          </Field>
          <Field label="Company">
            <input className={teamInputCls} value={form.company} onChange={(e) => setField('company', e.target.value)} />
          </Field>
          <Field label="Address">
            <input
              className={teamInputCls}
              value={form.address.replaceAll('\n', ', ')}
              onChange={(e) => setField('address', e.target.value)}
            />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label="Observed condition">
            <textarea rows={3} className={teamInputCls} value={form.observedCondition} onChange={(e) => setField('observedCondition', e.target.value)} />
          </Field>
          <Field label="Hazard statement">
            <textarea rows={2} className={`${teamInputCls} border-red-500/40 focus:border-red-400/60`} value={form.hazardStatement} onChange={(e) => setField('hazardStatement', e.target.value)} />
          </Field>
          <Field label="Recommendations">
            <textarea rows={3} className={teamInputCls} value={form.recommendations} onChange={(e) => setField('recommendations', e.target.value)} />
          </Field>
          <Field label="Scope limitation">
            <textarea rows={3} className={teamInputCls} value={form.scopeLimitation} onChange={(e) => setField('scopeLimitation', e.target.value)} />
          </Field>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={() => setForm(DEFAULT_FORM)}>Reset template</Btn>
          <Btn onClick={createReport}>Save notice</Btn>
        </div>
      </Card>

      <div className="space-y-3">
        <h2 className="font-serif text-lg text-white">Saved notices</h2>
        {sorted.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-500 text-center py-6">No safety notices saved yet.</p>
          </Card>
        ) : (
          sorted.map((r) => (
            <Card key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.company}</p>
                <p className="text-sm text-slate-400 truncate">{r.subject}</p>
                <p className="text-xs text-slate-500 mt-1">{r.date} · {r.clientName}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Btn size="sm" variant="ghost" onClick={() => loadReport(r)}>Edit</Btn>
                <Btn size="sm" variant="ghost" onClick={() => printReport(r)}>Print</Btn>
                <Btn size="sm" variant="danger" onClick={() => setReports((prev) => prev.filter((x) => x.id !== r.id))}>
                  Delete
                </Btn>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
