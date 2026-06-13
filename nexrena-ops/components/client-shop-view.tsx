'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortalProductCheckout, fetchPortalProducts } from '@/lib/portal-client'
import {
  SHOP_CATEGORY_HINTS,
  SHOP_CATEGORY_LABELS,
  type PortalProduct,
} from '@/lib/product-catalog'
import { Btn } from '@/components/ui'
import { Card } from '@/components/design-system'
import { portalMutedClass, portalSectionHintClass, portalSectionTitleClass } from '@/lib/portal-a11y'

const CATEGORY_ORDER: PortalProduct['category'][] = ['website', 'seo', 'extension']

type Props = {
  stripeEnabled: boolean
  highlightSku?: string | null
  purchased?: boolean | null
}

export function ClientShopView({ stripeEnabled, highlightSku, purchased }: Props) {
  const [products, setProducts] = useState<PortalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyingSku, setBuyingSku] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchPortalProducts()
      .then((rows) => { if (!cancelled) setProducts(rows) })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load products.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<PortalProduct['category'], PortalProduct[]>()
    for (const cat of CATEGORY_ORDER) map.set(cat, [])
    for (const p of products) map.get(p.category)?.push(p)
    return CATEGORY_ORDER.map((cat) => ({ category: cat, items: map.get(cat) ?? [] }))
  }, [products])

  const buy = useCallback(async (sku: string) => {
    setBuyingSku(sku)
    setError(null)
    try {
      const { url } = await createPortalProductCheckout(sku)
      if (url) window.location.href = url
      else setError('Could not start checkout.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout unavailable.')
    } finally {
      setBuyingSku(null)
    }
  }, [])

  if (loading) {
    return <p className={portalMutedClass}>Loading products…</p>
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className={portalSectionTitleClass}>Shop</h2>
        <p className={`${portalSectionHintClass} mt-2 max-w-2xl`}>
          Buy a website outright, subscribe to SEO content bundles, or add renewable extensions like extra pages.
        </p>
      </div>

      {purchased === true && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-base text-emerald-200">
          Payment received — our team will follow up on your order shortly.
        </p>
      )}
      {purchased === false && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-base text-amber-200">
          Checkout was cancelled. You can try again anytime.
        </p>
      )}

      {error && (
        <p className="text-base text-red-300" role="alert">{error}</p>
      )}

      {!stripeEnabled && (
        <p className={portalSectionHintClass}>
          Online checkout is not configured yet. Contact Nexrena to purchase.
        </p>
      )}

      {grouped.map(({ category, items }) =>
        items.length === 0 ? null : (
          <section key={category} className="space-y-4">
            <div>
              <h3 className="font-serif text-2xl text-white">{SHOP_CATEGORY_LABELS[category]}</h3>
              <p className={`${portalMutedClass} mt-1 text-base`}>{SHOP_CATEGORY_HINTS[category]}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((product) => (
                <ProductCard
                  key={product.sku}
                  product={product}
                  highlighted={product.sku === highlightSku}
                  disabled={!stripeEnabled || buyingSku !== null}
                  loading={buyingSku === product.sku}
                  onBuy={() => buy(product.sku)}
                />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  )
}

function ProductCard({
  product,
  highlighted,
  disabled,
  loading,
  onBuy,
}: {
  product: PortalProduct
  highlighted: boolean
  disabled: boolean
  loading: boolean
  onBuy: () => void
}) {
  const isRecurring = product.kind === 'recurring'

  return (
    <Card
      variant="client"
      className={`flex flex-col h-full ${highlighted ? 'ring-2 ring-gold/50' : ''} ${
        product.badge ? 'border-gold/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-serif text-xl text-white leading-tight">{product.name}</h4>
        {product.badge && (
          <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold-light">
            {product.badge}
          </span>
        )}
      </div>
      <p className={`${portalMutedClass} mt-2 text-base flex-1`}>{product.description}</p>
      <ul className="mt-4 space-y-1.5">
        {product.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm text-slate-300">
            <span className="text-gold shrink-0" aria-hidden>✓</span>
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-end justify-between gap-3">
        <div>
          <p className="font-serif text-2xl text-white tabular-nums">{product.priceLabel}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRecurring ? 'Billed monthly · renews automatically' : 'One-time purchase'}
          </p>
        </div>
        <Btn
          size="sm"
          disabled={disabled}
          onClick={onBuy}
        >
          {loading ? 'Starting…' : isRecurring ? 'Subscribe' : 'Buy now'}
        </Btn>
      </div>
    </Card>
  )
}
