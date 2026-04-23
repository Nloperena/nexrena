import { track } from '@vercel/analytics'

type Cleanup = () => void

let initialized = false
let perPageCleanup: Cleanup | null = null

function safeTrack(eventName: string, data: Record<string, unknown> = {}) {
  try {
    track(eventName, data)
  } catch {
    // Never block UX if analytics fails.
  }
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().slice(0, 120)
}

function getElementLabel(el: Element | null): string {
  if (!el) return 'unknown'
  const htmlEl = el as HTMLElement
  return (
    normalizeText(htmlEl.getAttribute('aria-label')) ||
    normalizeText((htmlEl as HTMLInputElement).value) ||
    normalizeText(htmlEl.textContent) ||
    normalizeText(htmlEl.getAttribute('title')) ||
    normalizeText(htmlEl.getAttribute('name')) ||
    normalizeText(htmlEl.id) ||
    htmlEl.tagName.toLowerCase()
  )
}

function getUiZone(el: Element | null): string {
  if (!el) return 'unknown'
  if (el.closest('#main-nav, .mobile-menu')) return 'nav'
  if (el.closest('footer')) return 'footer'
  if (el.closest('main section:first-of-type')) return 'hero'
  if (el.closest('form')) return 'form'
  if (el.closest('main')) return 'content'
  return 'unknown'
}

function getSectionName(section: Element): string {
  const htmlEl = section as HTMLElement
  const heading = section.querySelector('h1, h2, h3')
  return (
    normalizeText(htmlEl.dataset.section) ||
    normalizeText(section.getAttribute('aria-label')) ||
    normalizeText(section.id) ||
    normalizeText(heading?.textContent) ||
    normalizeText(htmlEl.className.split(' ')[0]) ||
    'unknown-section'
  )
}

function setupGlobalClickTracking(): Cleanup {
  const handler = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    const clickable = target?.closest('a, button, [role="button"]')
    if (!clickable) return

    const label = getElementLabel(clickable)
    const htmlEl = clickable as HTMLElement
    const ctaRoleAttr = htmlEl.dataset?.ctaRole
    const ctaZoneAttr = htmlEl.dataset?.ctaZone
    const zone = ctaZoneAttr || getUiZone(clickable)
    const isCta =
      !!ctaRoleAttr ||
      /let'?s talk|contact|book|start|get started|get quote|discovery|send message|90-day|case studies|see results/i.test(label)
    const path = window.location.pathname

    if (clickable instanceof HTMLAnchorElement) {
      const href = clickable.getAttribute('href') || ''
      if (!href) return

      const isExternal = /^https?:\/\//i.test(href) && !href.startsWith(window.location.origin)
      if (isExternal) {
        safeTrack('outbound_link_click', { href, label, zone })
      } else {
        safeTrack('internal_link_click', { href, label, zone })
      }

      if (isCta) {
        const ctaRole = ctaRoleAttr || 'unspecified'
        safeTrack('cta_click', { href, label, zone, kind: 'link', ctaRole, path })
        if (href.includes('/contact')) {
          safeTrack('funnel_step', {
            step: 'cta_to_contact',
            zone,
            ctaRole,
            entryPath: path,
          })
        }
      }
      return
    }

    if (clickable instanceof HTMLButtonElement || clickable.getAttribute('role') === 'button') {
      safeTrack('button_click', { label, zone })
      if (isCta) {
        const ctaRole = ctaRoleAttr || 'unspecified'
        safeTrack('cta_click', { label, zone, kind: 'button', ctaRole, path })
      }
    }
  }

  document.addEventListener('click', handler, { passive: true })
  return () => document.removeEventListener('click', handler)
}

function setupGlobalFormTracking(): Cleanup {
  const startedForms = new WeakSet<HTMLFormElement>()

  const focusHandler = (event: FocusEvent) => {
    const target = event.target as HTMLElement | null
    const form = target?.closest('form') as HTMLFormElement | null
    if (!form || startedForms.has(form)) return
    startedForms.add(form)
    const formId = form.id || 'anonymous-form'
    safeTrack('form_started', { formId, zone: getUiZone(form) })
    if (formId === 'contact-form') {
      safeTrack('funnel_step', { step: 'form_start', formId })
    }
  }

  const submitHandler = (event: SubmitEvent) => {
    const form = event.target as HTMLFormElement | null
    if (!form) return
    const formId = form.id || 'anonymous-form'
    safeTrack('form_submit_attempt', { formId, zone: getUiZone(form) })
    if (formId === 'contact-form') {
      safeTrack('funnel_step', { step: 'form_submit_attempt', formId })
    }
  }

  document.addEventListener('focusin', focusHandler)
  document.addEventListener('submit', submitHandler)

  return () => {
    document.removeEventListener('focusin', focusHandler)
    document.removeEventListener('submit', submitHandler)
  }
}

function setupPerPageTracking(): Cleanup {
  const cleanups: Cleanup[] = []

  const path = window.location.pathname
  const utm = new URLSearchParams(window.location.search)
  const referrer = document.referrer
  const referrerHost = referrer ? new URL(referrer).hostname : 'direct'
  const referrerPath = referrer && referrerHost === window.location.hostname
    ? new URL(referrer).pathname
    : null

  safeTrack('page_view_detailed', {
    path,
    title: document.title,
    referrerHost,
    referrerPath: referrerPath ?? undefined,
    utmSource: utm.get('utm_source') || undefined,
    utmMedium: utm.get('utm_medium') || undefined,
    utmCampaign: utm.get('utm_campaign') || undefined,
  })

  if (path.startsWith('/contact')) {
    safeTrack('funnel_step', {
      step: 'contact_page_view',
      fromHomepage: referrerPath === '/',
      referrerPath: referrerPath ?? 'external-or-direct',
    })
  }

  let maxDepth = 0
  const sentMilestones = new Set<number>()
  const onScroll = () => {
    const doc = document.documentElement
    const maxScrollable = Math.max(doc.scrollHeight - window.innerHeight, 1)
    const depth = Math.round((window.scrollY / maxScrollable) * 100)
    if (depth > maxDepth) maxDepth = depth

    ;[25, 50, 75, 100].forEach((milestone) => {
      if (depth >= milestone && !sentMilestones.has(milestone)) {
        sentMilestones.add(milestone)
        safeTrack('scroll_depth', { path, milestone })
      }
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  cleanups.push(() => window.removeEventListener('scroll', onScroll))

  const seenSections = new Set<Element>()
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || seenSections.has(entry.target)) return
      seenSections.add(entry.target)
      safeTrack('section_view', {
        section: getSectionName(entry.target),
        path,
      })
    })
  }, { threshold: 0.45 })

  const sections = document.querySelectorAll('main section, main [data-section], .section-container, .process-panel')
  sections.forEach((section) => sectionObserver.observe(section))
  cleanups.push(() => sectionObserver.disconnect())

  const start = performance.now()
  const onPageHide = () => {
    const seconds = Math.max(1, Math.round((performance.now() - start) / 1000))
    safeTrack('page_engagement', { path, seconds, maxScrollDepth: maxDepth })
  }
  window.addEventListener('pagehide', onPageHide, { once: true })
  cleanups.push(() => window.removeEventListener('pagehide', onPageHide))

  return () => cleanups.forEach((cleanup) => cleanup())
}

export function initAnalyticsEvents() {
  if (!initialized) {
    const globalCleanups = [setupGlobalClickTracking(), setupGlobalFormTracking()]
    initialized = true
    ;(window as Window & { __nxAnalyticsGlobalCleanup?: Cleanup[] }).__nxAnalyticsGlobalCleanup = globalCleanups
  }

  perPageCleanup?.()
  perPageCleanup = setupPerPageTracking()
}

