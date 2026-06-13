'use client'

import type { PortalProduct } from '@/lib/product-catalog'
import { Btn } from '@/components/ui'

type Props = {
  product: PortalProduct
  open: boolean
  onToggle: () => void
  disabled: boolean
  loading: boolean
  stripeEnabled: boolean
  quoteSent: boolean
  onBuy: () => void
  onQuote: () => void
  compact?: boolean
}

export function ShopProductDetails({
  product,
  open,
  onToggle,
  disabled,
  loading,
  stripeEnabled,
  quoteSent,
  onBuy,
  onQuote,
  compact,
}: Props) {
  const canCheckout = product.checkoutEnabled && stripeEnabled

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        className={`text-sm text-gold hover:text-gold-light text-left ${compact ? 'mt-2' : 'mt-4'}`}
      >
        {open ? 'Hide details ▲' : 'What’s included ▼'}
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

      <div className={`${compact ? 'mt-3 pt-3' : 'mt-5 pt-4'} border-t border-slate-800/60 flex gap-2`}>
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
    </>
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
