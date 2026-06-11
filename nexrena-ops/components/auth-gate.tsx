'use client'

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Btn, inputCls } from '@/components/ui'
import { ClientDashboard } from '@/components/client-dashboard'
import {
  getPortalToken,
  loginPortalAccount,
  logoutPortal,
  registerPortalAccount,
} from '@/lib/portal-client'

const ADMIN_USER = 'NLoperena'
const ADMIN_PASS = 'Fortnitebattlepass'
const ADMIN_SESSION_KEY = 'nx-ops-unlocked'

type AuthRole = 'admin' | 'client' | null

const AuthContext = createContext<{ role: AuthRole }>({ role: null })

export function useAuthRole() {
  return useContext(AuthContext).role
}

type Props = { children: ReactNode }

function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

type LoginMode = 'client-sign-in' | 'client-sign-up' | 'team'

export function AuthGate({ children }: Props) {
  const [hydrated, setHydrated] = useState(false)
  const [role, setRole] = useState<AuthRole>(null)
  const [mode, setMode] = useState<LoginMode>('client-sign-in')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const isAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
    const hasClientToken = Boolean(getPortalToken())
    if (isAdmin) setRole('admin')
    else if (hasClientToken) setRole('client')

    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab === 'team') setMode('team')
    else if (tab === 'sign-up') setMode('client-sign-up')
    else if (tab === 'sign-in') setMode('client-sign-in')

    setHydrated(true)
  }, [])

  const signOut = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    logoutPortal()
    setRole(null)
    setError('')
    setUsername('')
    setPassword('')
    setName('')
    setCompany('')
    setMode('client-sign-in')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'team') {
        const isUserMatch = normalizeUsername(username) === normalizeUsername(ADMIN_USER)
        const isPassMatch = password.trim() === ADMIN_PASS
        if (!isUserMatch || !isPassMatch) {
          setError('Incorrect team username or password.')
          return
        }
        logoutPortal()
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
        setRole('admin')
        return
      }

      if (mode === 'client-sign-up') {
        if (password.trim().length < 8) {
          setError('Password must be at least 8 characters.')
          return
        }
        await registerPortalAccount({
          name: name.trim(),
          email: username.trim().toLowerCase(),
          password: password.trim(),
          company: company.trim() || undefined,
        })
      } else {
        await loginPortalAccount(username.trim().toLowerCase(), password.trim())
      }

      sessionStorage.removeItem(ADMIN_SESSION_KEY)
      setRole('client')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!hydrated) {
    return <div className="min-h-screen bg-[#111418]" />
  }

  if (role === 'admin') {
    return (
      <AuthContext.Provider value={{ role: 'admin' }}>
        <div className="fixed right-4 top-3 z-[60]">
          <Btn size="sm" variant="ghost" onClick={signOut}>Lock</Btn>
        </div>
        {children}
      </AuthContext.Provider>
    )
  }

  if (role === 'client') {
    return (
      <AuthContext.Provider value={{ role: 'client' }}>
        <div className="min-h-screen px-6 py-10">
          <ClientDashboard onSignOut={signOut} />
        </div>
      </AuthContext.Provider>
    )
  }

  const isSignUp = mode === 'client-sign-up'
  const isTeam = mode === 'team'

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#111418]">
      <div className="w-full max-w-md glass-panel rounded-2xl border border-slate-700/60 p-6 md:p-8">
        <div className="mb-6">
          <p className="text-[10px] text-gold tracking-[0.2em] uppercase">Nexrena</p>
          <h1 className="font-serif text-2xl text-white mt-2">
            {isTeam ? 'Team access' : isSignUp ? 'Create your account' : 'Client portal'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isTeam
              ? 'Internal operations dashboard.'
              : isSignUp
                ? 'Track projects, proposals, and invoices with Nexrena.'
                : 'Sign in to view your projects and billing.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <ModeBtn active={mode === 'client-sign-in'} onClick={() => { setMode('client-sign-in'); setError('') }}>
            Client sign in
          </ModeBtn>
          <ModeBtn active={mode === 'client-sign-up'} onClick={() => { setMode('client-sign-up'); setError('') }}>
            Create account
          </ModeBtn>
          <ModeBtn active={mode === 'team'} onClick={() => { setMode('team'); setError('') }}>
            Team
          </ModeBtn>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {isSignUp && (
            <>
              <Field label="Full name">
                <input className={inputCls} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Company (optional)">
                <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
              </Field>
            </>
          )}

          <Field label={isTeam ? 'Username' : 'Email'}>
            <input
              className={inputCls}
              required
              type={isTeam ? 'text' : 'email'}
              autoComplete={isTeam ? 'username' : 'email'}
              autoCapitalize="none"
              value={username}
              onChange={(e) => { setError(''); setUsername(e.target.value) }}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              className={inputCls}
              required
              minLength={isSignUp ? 8 : undefined}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => { setError(''); setPassword(e.target.value) }}
            />
          </Field>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="w-full [&>button]:w-full [&>button]:justify-center">
            <Btn type="submit" disabled={loading}>
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-medium transition-colors ${
        active ? 'bg-gold text-obsidian' : 'border border-slate-700 text-slate-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2 font-medium">{label}</label>
      {children}
    </div>
  )
}

/** @deprecated Use AuthGate */
export const FakeAuthGate = AuthGate
