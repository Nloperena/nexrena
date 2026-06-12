'use client'

import { useEffect, useState } from 'react'
import { Btn } from '@/components/ui'

const DISMISS_KEY = 'nx-pwa-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let cachedInstallPrompt: BeforeInstallPromptEvent | null = null
const installPromptListeners = new Set<() => void>()

function subscribeInstallPrompt(listener: () => void) {
  installPromptListeners.add(listener)
  return () => installPromptListeners.delete(listener)
}

/** Captures beforeinstallprompt early so it is not missed while on the login screen. */
export function PwaInstallCapture() {
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      cachedInstallPrompt = e as BeforeInstallPromptEvent
      installPromptListeners.forEach((listener) => listener())
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  return null
}

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIosSafari() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|EdgiOS/.test(ua)
  return isIos && isSafari
}

type PwaInstallPromptProps = {
  /** When false, the prompt is hidden (e.g. on the login screen). */
  enabled?: boolean
}

export function PwaInstallPrompt({ enabled = true }: PwaInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setVisible(false)
      return
    }
    if (isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY) === '1') return

    const showPrompt = () => {
      if (isIosSafari()) {
        setIosHint(true)
        setVisible(true)
        return
      }
      if (cachedInstallPrompt) {
        setDeferredPrompt(cachedInstallPrompt)
        setVisible(true)
      }
    }

    const timer = window.setTimeout(showPrompt, 600)
    const unsubscribe = subscribeInstallPrompt(showPrompt)

    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [enabled])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-lg animate-fade-in-up md:left-auto md:right-6 md:bottom-6"
      role="region"
      aria-label="Install Nexrena app"
    >
      <div className="glass-panel rounded-2xl border-2 border-gold/30 p-5 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/15 ring-1 ring-gold/30">
            <img src="/icons/icon.svg" alt="" className="h-8 w-8" width={32} height={32} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-white">Install Nexrena</p>
            {iosHint ? (
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Tap <span className="font-medium text-white">Share</span>, then{' '}
                <span className="font-medium text-white">Add to Home Screen</span> to open Nexrena like an app.
              </p>
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-slate-300">
                Add Nexrena to your home screen for quick access to messages, billing, and team tools.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {!iosHint && deferredPrompt && (
                <Btn size="sm" onClick={install}>
                  Install app
                </Btn>
              )}
              <Btn size="sm" variant="ghost" onClick={dismiss}>
                Not now
              </Btn>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white"
            aria-label="Dismiss install prompt"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
