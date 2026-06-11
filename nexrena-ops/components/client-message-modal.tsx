'use client'

import { useEffect, useState } from 'react'
import { Modal, Btn } from '@/components/ui'
import { sendPortalMessage } from '@/lib/portal-client'

export const MESSAGE_CATEGORIES = [
  { id: 'billing', label: 'Billing question', subject: 'Billing question' },
  { id: 'website', label: 'Website update', subject: 'Website update' },
  { id: 'new-project', label: 'New project', subject: 'New project inquiry' },
  { id: 'other', label: 'Something else', subject: '' },
] as const

export type MessageCategoryId = (typeof MESSAGE_CATEGORIES)[number]['id']

type Props = {
  open: boolean
  onClose: () => void
  defaultSubject?: string
  defaultCategory?: MessageCategoryId
}

export function ClientMessageModal({
  open,
  onClose,
  defaultSubject = '',
  defaultCategory,
}: Props) {
  const [category, setCategory] = useState<MessageCategoryId | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!open) return
    setMessage('')
    setError(null)
    setSuccess(false)

    if (defaultCategory) {
      setCategory(defaultCategory)
      return
    }

    const matched = MESSAGE_CATEGORIES.find((c) => c.subject && c.subject === defaultSubject)
    if (matched) {
      setCategory(matched.id)
    } else if (defaultSubject) {
      setCategory('other')
    } else {
      setCategory(null)
    }
  }, [open, defaultSubject, defaultCategory])

  if (!open) return null

  const selectedCategory = MESSAGE_CATEGORIES.find((c) => c.id === category)
  const subject = selectedCategory?.subject || (category === 'other' ? defaultSubject : '')

  const handleClose = () => {
    if (submitting) return
    setCategory(null)
    setMessage('')
    setError(null)
    setSuccess(false)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) {
      setError('Please choose what you need help with.')
      return
    }
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
          Message sent. Check the Messages section for Nico&apos;s reply.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-slate-400">
            Pick a topic and send a note — Nico will reply in your Messages section below.
          </p>

          <fieldset>
            <legend className="text-sm text-white mb-3">What do you need help with?</legend>
            <div className="grid grid-cols-2 gap-2">
              {MESSAGE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`rounded-lg px-3 py-2.5 text-sm text-left transition-colors ${
                    category === c.id
                      ? 'bg-gold/20 border-2 border-gold/50 text-white'
                      : 'bg-slate-900/60 border border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Your message *</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={5000}
              rows={5}
              required
              placeholder="Tell us what you need…"
              className="mt-1 w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-gold/50 resize-y min-h-[120px]"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Btn type="button" size="sm" variant="ghost" onClick={handleClose} disabled={submitting}>
              Cancel
            </Btn>
            <Btn type="submit" size="sm" disabled={submitting || !category}>
              {submitting ? 'Sending…' : 'Send message'}
            </Btn>
          </div>
        </form>
      )}
    </Modal>
  )
}
