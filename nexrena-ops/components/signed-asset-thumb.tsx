'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { fetchOpsAssetSignedUrl, fetchPortalAssetSignedUrl } from '@/lib/signed-url-client'

type Props = {
  assetId: string
  variant: 'portal' | 'ops'
  alt?: string
  className?: string
  fallback?: ReactNode
}

export function SignedAssetThumb({ assetId, variant, alt = '', className, fallback }: Props) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = variant === 'portal'
      ? fetchPortalAssetSignedUrl(assetId)
      : fetchOpsAssetSignedUrl(assetId)

    load
      .then((signed) => { if (active) setUrl(signed) })
      .catch(() => { if (active) setUrl(null) })

    return () => { active = false }
  }, [assetId, variant])

  if (!url) {
    return fallback ?? <span className="text-lg text-slate-500">📄</span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={alt} className={className} />
  )
}

export function SignedAssetLink({
  assetId,
  variant,
  children,
  className,
}: {
  assetId: string
  variant: 'portal' | 'ops'
  children: ReactNode
  className?: string
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = variant === 'portal'
      ? fetchPortalAssetSignedUrl(assetId)
      : fetchOpsAssetSignedUrl(assetId)

    load
      .then((signed) => { if (active) setUrl(signed) })
      .catch(() => { if (active) setUrl(null) })

    return () => { active = false }
  }, [assetId, variant])

  if (!url) {
    return <span className={className}>{children}</span>
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
