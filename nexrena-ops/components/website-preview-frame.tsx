'use client'

import { useEffect, useRef, useState } from 'react'

/** Render width for desktop preview — site CSS/layout sees a true XL monitor. */
export const XL_PREVIEW_WIDTH = 1920
export const XL_PREVIEW_HEIGHT = 1080

type Props = {
  src: string
  title: string
  iframeKey: string
  className?: string
}

export function WebsitePreviewFrame({ src, title, iframeKey, className = '' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const width = el.clientWidth
      if (width > 0) setScale(width / XL_PREVIEW_WIDTH)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-video overflow-hidden bg-white ${className}`}
    >
      <iframe
        key={iframeKey}
        src={src}
        title={title}
        className="absolute top-0 left-0 border-0 bg-white"
        style={{
          width: XL_PREVIEW_WIDTH,
          height: XL_PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
