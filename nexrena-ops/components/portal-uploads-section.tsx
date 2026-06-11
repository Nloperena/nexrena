'use client'

import { useRef, useState } from 'react'
import { Btn } from '@/components/ui'
import { uploadPortalAsset } from '@/lib/portal-client'
import type { PortalAsset, PortalServiceRequest } from '@/lib/portal-types'

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

type Props = {
  assets: PortalAsset[]
  serviceRequests: PortalServiceRequest[]
  onUploaded: (asset: PortalAsset) => void
}

export function PortalUploadsSection({ assets, serviceRequests, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [serviceRequestId, setServiceRequestId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pickFile = () => inputRef.current?.click()

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setLoading(true)
    setError(null)
    try {
      const asset = await uploadPortalAsset(file, serviceRequestId || undefined)
      onUploaded(asset)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">My uploads</h3>
      <div className="glass-panel rounded-xl border border-slate-800/60 p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          {serviceRequests.length > 0 && (
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2">Link to request (optional)</label>
              <select
                className="w-full bg-slate-900/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white"
                value={serviceRequestId}
                onChange={(e) => setServiceRequestId(e.target.value)}
              >
                <option value="">General upload</option>
                {serviceRequests.map((r) => (
                  <option key={r.id} value={r.id}>{r.projectType} · {r.description.slice(0, 40)}</option>
                ))}
              </select>
            </div>
          )}
          <input ref={inputRef} type="file" className="hidden" accept="image/*,.pdf,.zip" onChange={onFileChange} />
          <Btn size="sm" disabled={loading} onClick={pickFile}>{loading ? 'Uploading…' : 'Upload file'}</Btn>
        </div>
        <p className="text-xs text-slate-500">Images, PDFs, or ZIP up to 10 MB. Stored securely on Vercel Blob.</p>
        {error && <p className="text-sm text-red-400">{error}</p>}

        {assets.length === 0 ? (
          <p className="text-sm text-slate-500">No uploads yet. Share brand assets, briefs, or reference files here.</p>
        ) : (
          <ul className="space-y-2">
            {assets.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm border-t border-slate-800/50 pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-white truncate">{a.filename}</p>
                  <p className="text-xs text-slate-500">{formatBytes(a.sizeBytes)} · {a.contentType}</p>
                </div>
                <a href={a.blobUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold shrink-0 hover:underline">View</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
