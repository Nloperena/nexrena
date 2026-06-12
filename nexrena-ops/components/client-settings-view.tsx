'use client'

import { useState, type FormEvent } from 'react'
import type { PortalAccount } from '@/lib/portal-types'
import { changePortalPassword, updatePortalProfile } from '@/lib/portal-client'
import { PortalSubscriptionsSection } from '@/components/portal-subscriptions-section'
import { Btn } from '@/components/ui'
import { portalCardClass, portalInputCls, portalLabelClass, portalSectionHintClass } from '@/lib/portal-a11y'
import { portalSectionTitleClass } from '@/lib/portal-dashboard-utils'

const card = portalCardClass

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
        <p className={`${portalSectionHintClass} mt-2`}>Update your profile and manage your account.</p>
      </div>

      {error && <p className="text-base text-red-300" role="alert">{error}</p>}
      {message && <p className="text-base text-emerald-300">{message}</p>}

      <form onSubmit={saveProfile} className={`${card} space-y-5`}>
        <p className="text-lg font-semibold text-slate-100">Your profile</p>
        <div>
          <label className={portalLabelClass}>Full name</label>
          <input className={portalInputCls} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label className={portalLabelClass}>Company</label>
          <input className={portalInputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" autoComplete="organization" />
        </div>
        <div>
          <label className={portalLabelClass}>Email address</label>
          <input className={`${portalInputCls} opacity-70 cursor-not-allowed`} value={account.email} readOnly tabIndex={-1} />
          <p className="text-base text-slate-400 mt-2">Contact Nexrena if you need to change your email.</p>
        </div>
        <div className="flex justify-end pt-2">
          <Btn type="submit" size="lg" disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save profile'}</Btn>
        </div>
      </form>

      <form onSubmit={changePassword} className={`${card} space-y-5`}>
        <p className="text-lg font-semibold text-slate-100">Change password</p>
        <div>
          <label className={portalLabelClass}>Current password</label>
          <input type="password" className={portalInputCls} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <div>
          <label className={portalLabelClass}>New password</label>
          <input type="password" className={portalInputCls} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div>
          <label className={portalLabelClass}>Confirm new password</label>
          <input type="password" className={portalInputCls} required minLength={8} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <div className="flex justify-end pt-2">
          <Btn type="submit" size="lg" variant="ghost" disabled={passwordSaving}>{passwordSaving ? 'Updating…' : 'Update password'}</Btn>
        </div>
      </form>

      <div className={card}>
        <PortalSubscriptionsSection onError={setError} onMessage={setMessage} />
      </div>
    </section>
  )
}
