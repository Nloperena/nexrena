'use client'

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Btn } from '@/components/ui'
import { portalInputCls, portalLabelClass, portalFocusRing } from '@/lib/portal-a11y'
import { PortalMediaPanel } from '@/components/portal-media-panel'
import { PORTAL_IMAGES } from '@/lib/portal-imagery'
import { ClientDashboard } from '@/components/client-dashboard'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import {
  getPortalToken,
  loginPortalAccount,
  logoutPortal,
  registerPortalAccount,
} from '@/lib/portal-client'

const ADMIN_USER = 'NLoperena'
const ADMIN_PASS = 'Fortnitebattlepass'
const ADMIN_SESSION_KEY = 'nx-ops-unlocked'
export const ADMIN_DISPLAY_NAME_KEY = 'nx-ops-display-name'

type AuthRole = 'admin' | 'client' | null

type AuthContextValue = {
  role: AuthRole
  signOut: () => void
  teamDisplayName: string
  setTeamDisplayName: (name: string) => void
}

const AuthContext = createContext<AuthContextValue>({
  role: null,
  signOut: () => {},
  teamDisplayName: ADMIN_USER,
  setTeamDisplayName: () => {},
})

export function useAuthRole() {
  return useContext(AuthContext).role
}

export function useAuth() {
  return useContext(AuthContext)
}

type Props = { children: ReactNode }

function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

type LoginMode = 'client-sign-in' | 'client-sign-up' | 'team'

function loginModeFromTab(tab: string | null): LoginMode {
  if (tab === 'team') return 'team'
  if (tab === 'sign-up') return 'client-sign-up'
  return 'client-sign-in'
}

function writeLoginTabToUrl(mode: LoginMode) {
  const url = new URL(window.location.href)
  if (mode === 'client-sign-in') url.searchParams.delete('tab')
  else if (mode === 'client-sign-up') url.searchParams.set('tab', 'sign-up')
  else url.searchParams.set('tab', 'team')
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

function setLoginMode(mode: LoginMode, setMode: (mode: LoginMode) => void) {
  setMode(mode)
  writeLoginTabToUrl(mode)
}

export function AuthGate({ children }: Props) {
  const [hydrated, setHydrated] = useState(false)
  const [role, setRole] = useState<AuthRole>(null)
  const [teamDisplayName, setTeamDisplayNameState] = useState(ADMIN_USER)
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
    const storedDisplayName = sessionStorage.getItem(ADMIN_DISPLAY_NAME_KEY)
    if (storedDisplayName) setTeamDisplayNameState(storedDisplayName)
    if (isAdmin) setRole('admin')
    else if (hasClientToken) setRole('client')

    const tab = new URLSearchParams(window.location.search).get('tab')
    setMode(loginModeFromTab(tab))

    const onPopState = () => {
      const nextTab = new URLSearchParams(window.location.search).get('tab')
      setMode(loginModeFromTab(nextTab))
    }
    window.addEventListener('popstate', onPopState)
    setHydrated(true)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setTeamDisplayName = (name: string) => {
    sessionStorage.setItem(ADMIN_DISPLAY_NAME_KEY, name)
    setTeamDisplayNameState(name)
  }

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

  const authValue: AuthContextValue = { role, signOut, teamDisplayName, setTeamDisplayName }

  if (!hydrated) {
    return <div className="min-h-screen bg-[#111418]" />
  }

  if (role === 'admin') {
    return (
      <AuthContext.Provider value={authValue}>
        {children}
        <PwaInstallPrompt enabled />
      </AuthContext.Provider>
    )
  }

  if (role === 'client') {
    return (
      <AuthContext.Provider value={authValue}>
        <ClientDashboard onSignOut={signOut} />
        <PwaInstallPrompt enabled />
      </AuthContext.Provider>
    )
  }

  const isSignUp = mode === 'client-sign-up'
  const isTeam = mode === 'team'

  return (
    <div className="client-portal min-h-screen grid lg:grid-cols-[1fr_min(480px,45%)] bg-[#111418]">
      <div className="flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-lg">
        <div className="mb-8">
          <p className="text-base text-gold font-medium">Nexrena</p>
          <h1 className="font-serif text-3xl text-white mt-2 leading-tight">
            {isTeam ? 'Team sign in' : isSignUp ? 'Create your account' : 'Client sign in'}
          </h1>
          <p className="text-base text-slate-300 mt-3 leading-relaxed">
            {isTeam
              ? 'Sign in to manage clients, messages, billing, and projects.'
              : isSignUp
                ? 'Create an account to view your projects and invoices.'
                : 'Sign in to view your website, billing, and messages.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-8" role="tablist" aria-label="Sign in options">
          <ModeBtn active={mode === 'client-sign-in'} onClick={() => { setLoginMode('client-sign-in', setMode); setError('') }}>
            Sign in
          </ModeBtn>
          <ModeBtn active={mode === 'client-sign-up'} onClick={() => { setLoginMode('client-sign-up', setMode); setError('') }}>
            New account
          </ModeBtn>
          <ModeBtn active={mode === 'team'} onClick={() => { setLoginMode('team', setMode); setError('') }}>
            Team login
          </ModeBtn>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          {isSignUp && (
            <>
              <Field label="Your full name">
                <input className={portalInputCls} required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="Company name (optional)">
                <input className={portalInputCls} value={company} onChange={(e) => setCompany(e.target.value)} autoComplete="organization" />
              </Field>
            </>
          )}

          <Field label={isTeam ? 'Username' : 'Email address'}>
            <input
              className={portalInputCls}
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
              className={portalInputCls}
              required
              minLength={isSignUp ? 8 : undefined}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => { setError(''); setPassword(e.target.value) }}
            />
          </Field>

          {error && <p className="text-base text-red-300 font-medium" role="alert">{error}</p>}

          <div className="w-full pt-2 [&>button]:w-full [&>button]:justify-center">
            <Btn type="submit" size="lg" disabled={loading}>
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </Btn>
          </div>
        </form>
        </div>
      </div>

      <PortalMediaPanel
        photo="auth"
        svgSrc={PORTAL_IMAGES.infrastructure}
        overlay={isTeam ? 45 : 35}
        rounded="none"
        className="hidden lg:block min-h-screen sticky top-0"
      >
        <div className="flex h-full flex-col justify-end p-10 xl:p-14">
          {isTeam ? (
            <>
              <p className="font-serif text-4xl text-white leading-tight max-w-md">
                Run client work from one calm dashboard.
              </p>
              <p className="text-lg text-slate-200 mt-4 max-w-sm leading-relaxed">
                Messages, invoices, leads, and project files — organized so your team can move fast without the clutter.
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-4xl text-white leading-tight max-w-md">
                Your website, billing, and projects — one clean workspace.
              </p>
              <p className="text-lg text-slate-200 mt-4 max-w-sm leading-relaxed">
                Built for clarity. Message Nico, track work, and manage invoices without the clutter.
              </p>
            </>
          )}
        </div>
      </PortalMediaPanel>
    </div>
  )
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`px-5 py-3 rounded-xl text-base font-medium transition-colors min-h-[48px] ${portalFocusRing} ${
        active ? 'bg-gold text-obsidian' : 'border-2 border-slate-600 text-slate-200 hover:text-white hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={portalLabelClass}>{label}</label>
      {children}
    </div>
  )
}

/** @deprecated Use AuthGate */
export const FakeAuthGate = AuthGate
