'use client'

import { useEffect, useState } from 'react'
import { Btn, inputCls } from '@/components/ui'

const AUTH_USER = 'Fortnitebattlepass'
const AUTH_PASS = 'Fortnitebattlepass'
const AUTH_SESSION_KEY = 'nx-ops-unlocked'

type Props = { children: React.ReactNode }

function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function FakeAuthGate({ children }: Props) {
  const [hydrated, setHydrated] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credentialError, setCredentialError] = useState('')

  useEffect(() => {
    const isUnlocked = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true'
    setUnlocked(isUnlocked)
    setHydrated(true)
  }, [])

  const tryCredentials = (e: React.FormEvent) => {
    e.preventDefault()
    const isUserMatch = normalizeUsername(username) === normalizeUsername(AUTH_USER)
    const isPassMatch = password.trim() === AUTH_PASS
    if (isUserMatch && isPassMatch) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
      setUnlocked(true)
      setCredentialError('')
      return
    }
    setCredentialError('Incorrect username or password.')
  }

  const resetSession = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    setUnlocked(false)
    setCredentialError('')
    setUsername('')
    setPassword('')
  }

  if (!hydrated) {
    return <div className="min-h-screen" />
  }

  if (unlocked) {
    return (
      <>
        <div className="fixed right-4 top-3 z-[60]">
          <Btn size="sm" variant="ghost" onClick={resetSession}>
            Lock
          </Btn>
        </div>
        {children}
      </>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700/60 p-6">
        <div className="mb-6">
          <h1 className="font-serif text-2xl text-white">Nexrena Ops Access</h1>
          <p className="text-sm text-slate-400 mt-1">Enter username and password.</p>
        </div>

        <form className="space-y-4" onSubmit={tryCredentials}>
          <div>
            <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2 font-medium">Username</label>
            <input
              className={inputCls}
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setCredentialError('')
                setUsername(e.target.value)
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2 font-medium">Password</label>
            <input
              type="password"
              className={inputCls}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setCredentialError('')
                setPassword(e.target.value)
              }}
            />
          </div>
          {credentialError && <p className="text-xs text-red-400">{credentialError}</p>}
          <div className="pt-1">
            <Btn type="submit">Sign in</Btn>
          </div>
        </form>
      </div>
    </div>
  )
}
