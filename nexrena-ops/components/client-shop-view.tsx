'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  createPortalProductCheckout,
  fetchPortalProducts,
  requestPortalProductQuote,
} from '@/lib/portal-client'
import {
  type PortalProduct,
} from '@/lib/product-catalog'
import { portalMutedClass, portalSectionHintClass, portalSectionTitleClass } from '@/lib/portal-a11y'
import { ShopAisleSection } from '@/components/shop/shop-aisle-section'

import type { ClientPortalView } from '@/components/client-nav'

type Props = {
  stripeEnabled: boolean
  highlightSku?: string | null
  initialCategory?: string | null
  purchased?: boolean | null
  onNavigate?: (view: ClientPortalView) => void
}

export function ClientShopView({ stripeEnabled, highlightSku, initialCategory, purchased, onNavigate }: Props) {
  const [products, setProducts] = useState<PortalProduct[]>([])
  const [scopeLanguage, setScopeLanguage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busySku, setBusySku] = useState<string | null>(null)
  const [quoteSent, setQuoteSent] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchPortalProducts()
      .then((data) => {
        if (cancelled) return
        setProducts(data.services)
        setScopeLanguage(data.scopeLanguage)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load services.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const endcapItems = products.filter((p) => p.category === 'website-plan')

  const buy = useCallback(async (sku: string) => {
    setBusySku(sku)
    setError(null)
    try {
      const { url } = await createPortalProductCheckout(sku)
      if (url) window.location.href = url
      else setError('Could not start checkout.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout unavailable.')
    } finally {
      setBusySku(null)
    }
  }, [])

  const requestQuote = useCallback(async (product: PortalProduct) => {
    setBusySku(product.sku)
    setError(null)
    try {
      await requestPortalProductQuote(product.sku)
      setQuoteSent(product.sku)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit quote request.')
    } finally {
      setBusySku(null)
    }
  }, [])

  const handlers = {
    busySku,
    quoteSent,
    stripeEnabled,
    highlightSku,
    onBuy: buy,
    onQuote: requestQuote,
  }

  if (loading) return <p className={portalMutedClass}>Loading service menu…</p>

  if (!loading && products.length === 0 && !error) {
    return (
      <div className="space-y-4">
        <h2 className={portalSectionTitleClass}>Services</h2>
        <p className={`${portalMutedClass} text-base`}>
          The service menu is temporarily unavailable. Please refresh or contact Nexrena if this persists.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={portalSectionTitleClass}>Services</h2>
          <p className={`${portalSectionHintClass} mt-2 max-w-3xl`}>
            Select a plan to get started.
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('billing')}
            className="rounded-lg bg-slate-800/80 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            Manage your subscriptions
          </button>
        )}
      </div>

      <ShopStatusBanners purchased={purchased} error={error} stripeEnabled={stripeEnabled} products={products} />

      {endcapItems.length > 0 && (
        <ShopAisleSection
          category="website-plan"
          items={endcapItems}
          variant="endcap"
          handlers={handlers}
        />
      )}

      {scopeLanguage && (
        <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-800/60 pt-6">
          {scopeLanguage}
        </p>
      )}
    </div>
  )
}

function ShopStatusBanners({
  purchased,
  error,
  stripeEnabled,
  products,
}: {
  purchased?: boolean | null
  error: string | null
  stripeEnabled: boolean
  products: PortalProduct[]
}) {
  return (
    <>
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
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-base text-red-200" role="alert">
          {error}
          {error === 'Request failed' && (
            <span className="block mt-1 text-sm text-red-300/80">
              The service catalog could not be loaded. Try refreshing — if the problem continues, our team may need to update the API.
            </span>
          )}
        </p>
      )}
      {!stripeEnabled && products.some((p) => p.checkoutEnabled) && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Online checkout is not configured yet. You can still request quotes for scoped services — contact Nexrena to order plans and upgrades.
        </p>
      )}
    </>
  )
}
