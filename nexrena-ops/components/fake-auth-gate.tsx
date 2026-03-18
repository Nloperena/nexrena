'use client'

import { useEffect, useMemo, useState } from 'react'
import { Btn, inputCls } from '@/components/ui'

const AUTH_USER = 'NLoperena'
const AUTH_PASS = 'wowhackerman67!'
const AUTH_PATTERN = [0, 1, 2, 5, 8]
const AUTH_SESSION_KEY = 'nx-ops-unlocked'

type Props = { children: React.ReactNode }

const GRID_POSITIONS = [
  { x: 16, y: 16 }, { x: 50, y: 16 }, { x: 84, y: 16 },
  { x: 16, y: 50 }, { x: 50, y: 50 }, { x: 84, y: 50 },
  { x: 16, y: 84 }, { x: 50, y: 84 }, { x: 84, y: 84 },
]

function patternMatches(a: number[], b: number[]) {
  return a.length === b.length && a.every((n, i) => n === b[i])
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function FakeAuthGate({ children }: Props) {
  const [hydrated, setHydrated] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [step, setStep] = useState<'credentials' | 'pattern'>('credentials')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credentialError, setCredentialError] = useState('')
  const [patternError, setPatternError] = useState('')
  const [selectedNodes, setSelectedNodes] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const isUnlocked = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true'
    setUnlocked(isUnlocked)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!isDrawing) return
    const onPointerUp = () => {
      setIsDrawing(false)
      if (selectedNodes.length === 0) return
      if (patternMatches(selectedNodes, AUTH_PATTERN)) {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true')
        setUnlocked(true)
        setPatternError('')
      } else {
        setPatternError('Pattern not recognized.')
      }
      window.setTimeout(() => setSelectedNodes([]), 200)
    }
    window.addEventListener('pointerup', onPointerUp)
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [isDrawing, selectedNodes])

  const segments = useMemo(() => {
    if (selectedNodes.length < 2) return []
    const out: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
    for (let i = 0; i < selectedNodes.length - 1; i++) {
      const a = GRID_POSITIONS[selectedNodes[i]]
      const b = GRID_POSITIONS[selectedNodes[i + 1]]
      out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })
    }
    return out
  }, [selectedNodes])

  const tryCredentials = (e: React.FormEvent) => {
    e.preventDefault()
    const isUserMatch = normalizeUsername(username) === normalizeUsername(AUTH_USER)
    const isPassMatch = password.trim() === AUTH_PASS
    if (isUserMatch && isPassMatch) {
      setCredentialError('')
      setStep('pattern')
      return
    }
    setCredentialError('Incorrect username or password.')
  }

  const resetSession = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY)
    setUnlocked(false)
    setStep('credentials')
    setSelectedNodes([])
    setCredentialError('')
    setPatternError('')
    setUsername('')
    setPassword('')
  }

  const addNode = (idx: number) => {
    setSelectedNodes((prev) => (prev.includes(idx) ? prev : [...prev, idx]))
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
          <p className="text-sm text-slate-400 mt-1">
            {step === 'credentials' ? 'Enter username and password.' : 'Draw unlock pattern to continue.'}
          </p>
        </div>

        {step === 'credentials' ? (
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
              <Btn type="submit">Continue</Btn>
            </div>
          </form>
        ) : (
          <div>
            <div
              className="relative mx-auto w-64 h-64 rounded-2xl border border-slate-700/70 bg-slate-900/50 select-none touch-none"
              onPointerDown={() => {
                setPatternError('')
                setSelectedNodes([])
                setIsDrawing(true)
              }}
            >
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {segments.map((s, i) => (
                  <line
                    key={`${s.x1}-${s.y1}-${i}`}
                    x1={`${s.x1}%`}
                    y1={`${s.y1}%`}
                    x2={`${s.x2}%`}
                    y2={`${s.y2}%`}
                    stroke="#C9A96E"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                ))}
              </svg>

              {GRID_POSITIONS.map((p, idx) => {
                const active = selectedNodes.includes(idx)
                return (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Pattern node ${idx + 1}`}
                    onPointerDown={(e) => {
                      e.preventDefault()
                      setPatternError('')
                      if (!isDrawing) {
                        setSelectedNodes([])
                        setIsDrawing(true)
                      }
                      addNode(idx)
                    }}
                    onPointerEnter={() => {
                      if (!isDrawing) return
                      addNode(idx)
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all ${
                      active
                        ? 'w-6 h-6 bg-gold border-gold'
                        : 'w-5 h-5 bg-slate-900 border-slate-500'
                    }`}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  />
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">Draw and release to unlock.</p>
              <Btn size="sm" variant="ghost" onClick={() => setSelectedNodes([])}>Clear</Btn>
            </div>
            {patternError && <p className="text-xs text-red-400 mt-2">{patternError}</p>}
            <div className="mt-4">
              <Btn size="sm" variant="ghost" onClick={() => setStep('credentials')}>Back</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

