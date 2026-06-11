'use client'

import { useEffect, useState } from 'react'
import { Btn, Field, inputCls } from '@/components/ui'
import { portalSectionTitleClass } from '@/lib/portal-dashboard-utils'
import { fetchPortalMessages, sendPortalMessage } from '@/lib/portal-client'
import { formatDate } from '@/lib/store'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type PortalMessage = {
  id: string
  subject: string
  message: string
  status: string
  createdAt: string
}

export function ClientMessagesView() {
  const [messages, setMessages] = useState<PortalMessage[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPortalMessages()
      .then(setMessages)
      .catch(() => setError('Could not load messages.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) {
      setError('Please enter a message.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const sent = await sendPortalMessage({
        subject: subject.trim() || undefined,
        message: body.trim(),
      })
      setMessages((prev) => [sent, ...prev])
      setSubject('')
      setBody('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className={portalSectionTitleClass}>Messages</h2>
        <p className="text-sm text-slate-400 mt-1">Send a note to Nico — questions, updates, or approvals.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${card} space-y-4`}>
        <Field label="Subject (optional)">
          <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Message">
          <textarea
            className={`${inputCls} min-h-[120px] resize-y`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </Field>
        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">Message sent — we&apos;ll get back to you soon.</p>}
        <Btn type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
        </Btn>
      </form>

      <div className={card}>
        <h3 className="text-sm font-medium text-white mb-4">Previous messages</h3>
        {loading ? (
          <p className="text-sm text-slate-500 animate-pulse">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages yet.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((m) => (
              <li key={m.id} className="border-t border-slate-800/50 pt-4 first:border-0 first:pt-0">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-sm text-white font-medium">{m.subject || 'Message'}</p>
                  <p className="text-xs text-slate-500">{formatDate(m.createdAt)}</p>
                </div>
                <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
