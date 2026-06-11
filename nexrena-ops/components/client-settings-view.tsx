'use client'

import { useState, type FormEvent } from 'react'
import type { PortalAccount } from '@/lib/portal-types'
import { changePortalPassword, updatePortalProfile } from '@/lib/portal-client'
import { PortalSubscriptionsSection } from '@/components/portal-subscriptions-section'
import { Btn, Field, inputCls } from '@/components/ui'
import { portalSectionTitleClass } from '@/lib/portal-dashboard-utils'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  account: PortalAccount
  onUpdated: (account: PortalAccount) => void
}

export function ClientSettingsView({ account, onUpdated }: Props) {
  const [name, setName] = useState(account.name)
  const [company, setCompany] = useState(account.company ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setProfileSaving(true)
    try {
      const updated = await updatePortalProfile({ name: name.trim(), company })
      onUpdated(updated)
      setMessage('Profile updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      await changePortalPassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Password changed successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password.')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className={portalSectionTitleClass}>Account settings</h2>
        <p className="text-sm text-slate-400 mt-1">Update your profile and manage your account.</p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <form onSubmit={saveProfile} className={`${card} space-y-4`}>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Profile</p>
        <Field label="Full name">
          <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </Field>
        <Field label="Company">
          <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" autoComplete="organization" />
        </Field>
        <Field label="Email">
          <input className={`${inputCls} opacity-70 cursor-not-allowed`} value={account.email} readOnly tabIndex={-1} />
          <p className="text-[10px] text-slate-600 mt-1.5">Contact Nexrena if you need to update your email.</p>
        </Field>
        <div className="flex justify-end pt-2">
          <Btn type="submit" disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save profile'}</Btn>
        </div>
      </form>

      <form onSubmit={changePassword} className={`${card} space-y-4`}>
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Change password</p>
        <Field label="Current password">
          <input type="password" className={inputCls} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
        </Field>
        <Field label="New password">
          <input type="password" className={inputCls} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
        </Field>
        <Field label="Confirm new password">
          <input type="password" className={inputCls} required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        </Field>
        <div className="flex justify-end pt-2">
          <Btn type="submit" variant="ghost" disabled={passwordSaving}>{passwordSaving ? 'Updating…' : 'Update password'}</Btn>
        </div>
      </form>

      <div className={card}>
        <PortalSubscriptionsSection onError={setError} onMessage={setMessage} />
      </div>
    </section>
  )
}
