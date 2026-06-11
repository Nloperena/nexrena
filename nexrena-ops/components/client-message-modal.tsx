'use client'

import { useEffect, useState } from 'react'
import { Modal, Btn } from '@/components/ui'
import { sendPortalMessage } from '@/lib/portal-client'

type Props = {
  open: boolean
  onClose: () => void
  defaultSubject?: string
}

export function ClientMessageModal({ open, onClose, defaultSubject = '' }: Props) {
  const [subject, setSubject] = useState(defaultSubject)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setSubject(defaultSubject)
      setMessage('')
      setError(null)
      setSuccess(false)
    }
  }, [open, defaultSubject])

  if (!open) return null

  const handleClose = () => {
    if (submitting) return
    setSubject(defaultSubject)
    setMessage('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      setError('Please enter a message.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await sendPortalMessage({
        subject: subject.trim() || undefined,
        message: message.trim(),
      })
      setSuccess(true)
      setTimeout(handleClose, 1800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Message Nico" onClose={handleClose}>
      {success ? (
        <p className="text-sm text-emerald-400 py-4">
          Message sent. Nico has been notified by email.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-400">
            Send a note directly from your portal. Nico will receive an email and reply to you separately.
          </p>
          <label className="block">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="What is this about?"
              className="mt-1 w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Message *</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              rows={5}
              required
              placeholder="Your message…"
              className="mt-1 w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50 resize-y min-h-[120px]"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" size="sm" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Btn>
            <Btn type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Sending…' : 'Send message'}
            </Btn>
          </div>
        </form>
      )}
    </Modal>
  )
}
