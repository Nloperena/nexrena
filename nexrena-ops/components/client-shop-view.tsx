'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createPortalProductCheckout,
  fetchPortalProducts,
  requestPortalProductQuote,
} from '@/lib/portal-client'
import {
  CATEGORY_ORDER,
  SHOP_CATEGORY_HINTS,
  SHOP_CATEGORY_LABELS,
  type PortalProduct,
  type ServiceCategory,
} from '@/lib/product-catalog'
import { Btn } from '@/components/ui'
import { Card } from '@/components/design-system'
import { portalMutedClass, portalSectionHintClass, portalSectionTitleClass } from '@/lib/portal-a11y'

type Props = {
  stripeEnabled: boolean
  highlightSku?: string | null
  initialCategory?: string | null
  purchased?: boolean | null
}

export function ClientShopView({ stripeEnabled, highlightSku, initialCategory, purchased }: Props) {
  const [products, setProducts] = useState<PortalProduct[]>([])
  const [scopeLanguage, setScopeLanguage] = useState('')
  const validCategory = (initialCategory && CATEGORY_ORDER.includes(initialCategory as ServiceCategory))
    ? (initialCategory as ServiceCategory)
    : 'all'
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>(validCategory)
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

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products
    return products.filter((p) => p.category === activeCategory)
  }, [products, activeCategory])

  const grouped = useMemo(() => {
    const cats = activeCategory === 'all' ? CATEGORY_ORDER : [activeCategory]
    return cats
      .map((cat) => ({
        category: cat,
        items: filtered.filter((p) => p.category === cat),
      }))
      .filter((g) => g.items.length > 0)
  }, [filtered, activeCategory])

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
    <div className="space-y-8">
      <div>
        <h2 className={portalSectionTitleClass}>Services</h2>
        <p className={`${portalSectionHintClass} mt-2 max-w-3xl`}>
          Plans are monthly subscriptions. Upgrades are fixed service orders. Advanced projects require scope review before work starts.
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

      <div className="flex flex-wrap gap-2">
        <CategoryChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
          All
        </CategoryChip>
        {CATEGORY_ORDER.map((cat) => (
          <CategoryChip
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {SHOP_CATEGORY_LABELS[cat].split(' ')[0]}
          </CategoryChip>
        ))}
      </div>

      {grouped.map(({ category, items }) => (
        <section key={category} className="space-y-4">
          <div>
            <h3 className="font-serif text-2xl text-white">{SHOP_CATEGORY_LABELS[category]}</h3>
            <p className={`${portalMutedClass} mt-1 text-base`}>{SHOP_CATEGORY_HINTS[category]}</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {items.map((product) => (
              <ServiceCard
                key={product.sku}
                product={product}
                highlighted={product.sku === highlightSku}
                quoteSent={quoteSent === product.sku}
                disabled={busySku !== null}
                loading={busySku === product.sku}
                stripeEnabled={stripeEnabled}
                onBuy={() => buy(product.sku)}
                onQuote={() => requestQuote(product)}
              />
            ))}
          </div>
        </section>
      ))}

      {scopeLanguage && (
        <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-800/60 pt-6">
          {scopeLanguage}
        </p>
      )}
    </div>
  )
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-gold/15 text-gold-light border border-gold/40'
          : 'bg-slate-800/50 text-slate-400 border border-slate-700/60 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function ServiceCard({
  product,
  highlighted,
  quoteSent,
  disabled,
  loading,
  stripeEnabled,
  onBuy,
  onQuote,
}: {
  product: PortalProduct
  highlighted: boolean
  quoteSent: boolean
  disabled: boolean
  loading: boolean
  stripeEnabled: boolean
  onBuy: () => void
  onQuote: () => void
}) {
  const [open, setOpen] = useState(highlighted)
  const canCheckout = product.checkoutEnabled && stripeEnabled

  return (
    <Card
      variant="client"
      className={`flex flex-col ${highlighted ? 'ring-2 ring-gold/50' : ''} ${
        product.badge ? 'border-gold/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-serif text-xl text-white leading-tight">{product.name}</h4>
          {product.bestFor && (
            <p className="text-sm text-slate-400 mt-1">{product.bestFor}</p>
          )}
        </div>
        {product.badge && (
          <span className="shrink-0 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold-light">
            {product.badge}
          </span>
        )}
      </div>

      <p className="font-serif text-2xl text-white tabular-nums mt-4">{product.priceLabel}</p>
      <p className="text-xs text-slate-500 mt-0.5">
        {product.tier === 'plan' && 'Monthly plan · 12-month minimum'}
        {product.tier === 'upgrade' && product.kind === 'recurring' && 'Monthly add-on'}
        {product.tier === 'upgrade' && product.kind === 'one_time' && 'One-time service order'}
        {product.tier === 'advanced' && 'Scoped project — quote required'}
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-4 text-sm text-gold hover:text-gold-light text-left"
      >
        {open ? 'Hide details ▲' : 'View what’s included ▼'}
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-sm">
          <DetailBlock title="Included" items={product.included} positive />
          <DetailBlock title="Not included" items={product.notIncluded} />
          <p className="text-slate-400 leading-relaxed">
            <span className="text-slate-300 font-medium">Scope: </span>
            {product.scopeBoundary}
          </p>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-800/60 flex gap-2">
        {product.checkoutEnabled ? (
          <Btn size="sm" disabled={disabled || !canCheckout} onClick={onBuy}>
            {loading ? 'Starting…' : product.kind === 'recurring' ? 'Subscribe' : 'Order now'}
          </Btn>
        ) : (
          <Btn size="sm" variant="ghost" disabled={disabled} onClick={onQuote}>
            {loading ? 'Sending…' : quoteSent ? 'Quote requested ✓' : 'Request quote'}
          </Btn>
        )}
      </div>
    </Card>
  )
}

function DetailBlock({
  title,
  items,
  positive,
}: {
  title: string
  items: string[]
  positive?: boolean
}) {
  return (
    <div>
      <p className="text-slate-300 font-medium mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-slate-400">
            <span className={`shrink-0 ${positive ? 'text-gold' : 'text-slate-600'}`} aria-hidden>
              {positive ? '✓' : '—'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
