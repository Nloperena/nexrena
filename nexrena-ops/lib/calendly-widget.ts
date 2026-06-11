declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string
        parentElement: HTMLElement
        prefill?: { name?: string; email?: string }
      }) => void
      initPopupWidget: (opts: {
        url: string
        prefill?: { name?: string; email?: string }
      }) => void
    }
  }
}

const SCRIPT_ATTR = 'data-nx-calendly'

export function loadCalendlyAssets(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Calendly) return Promise.resolve()

  const existingScript = document.querySelector(`script[${SCRIPT_ATTR}]`)
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Calendly failed to load')), {
        once: true,
      })
    })
  }

  if (!document.querySelector('link[data-nx-calendly-css]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://assets.calendly.com/assets/external/widget.css'
    link.dataset.nxCalendlyCss = 'true'
    document.head.appendChild(link)
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.setAttribute(SCRIPT_ATTR, 'true')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Calendly failed to load'))
    document.body.appendChild(script)
  })
}
