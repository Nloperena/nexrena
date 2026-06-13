'use client'

import type { ReactNode } from 'react'
import type { PortalProduct, ServiceCategory } from '@/lib/product-catalog'
import { SHOP_CATEGORY_HINTS, SHOP_CATEGORY_LABELS } from '@/lib/product-catalog'
import { SHOP_CATEGORY_VISUALS, shopShelfDensity } from '@/lib/shop-imagery'
import { portalMutedClass } from '@/lib/portal-a11y'
import { ShopCategoryIcon } from '@/components/shop/shop-category-icon'
import { ShopHeroCard } from '@/components/shop/shop-hero-card'
import { ShopProductCard } from '@/components/shop/shop-product-card'

type ProductHandlers = {
  busySku: string | null
  quoteSent: string | null
  stripeEnabled: boolean
  highlightSku?: string | null
  onBuy: (sku: string) => void
  onQuote: (product: PortalProduct) => void
}

type Props = {
  category: ServiceCategory
  items: PortalProduct[]
  variant: 'endcap' | 'aisle'
  handlers: ProductHandlers
}

export function ShopAisleSection({ category, items, variant, handlers }: Props) {
  if (items.length === 0) return null

  const visual = SHOP_CATEGORY_VISUALS[category]
  const isEndcap = variant === 'endcap'
  const standard = items.filter((p) => shopShelfDensity(p) === 'standard')
  const compact = items.filter((p) => shopShelfDensity(p) === 'compact')

  return (
    <section className="space-y-5" aria-labelledby={`aisle-${category}`}>
      <AisleHeader
        id={`aisle-${category}`}
        aisleNumber={visual.aisleNumber}
        aisleLabel={visual.aisleLabel}
        title={isEndcap ? 'Monthly website plans' : SHOP_CATEGORY_LABELS[category]}
        hint={isEndcap
          ? 'Your foundation — design, hosting, edits, and basic SEO in one subscription.'
          : SHOP_CATEGORY_HINTS[category]}
        category={category}
        endcap={isEndcap}
      />

      {isEndcap ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <ShopHeroCard
              key={product.sku}
              product={product}
              highlighted={product.sku === handlers.highlightSku}
              quoteSent={handlers.quoteSent === product.sku}
              disabled={handlers.busySku !== null}
              loading={handlers.busySku === product.sku}
              stripeEnabled={handlers.stripeEnabled}
              onBuy={() => handlers.onBuy(product.sku)}
              onQuote={() => handlers.onQuote(product)}
            />
          ))}
        </div>
      ) : (
        <>
          {standard.length > 0 && (
            <ShelfRow scrollOnMobile={standard.length >= 3}>
              {standard.map((product) => (
                <div key={product.sku} className="min-w-[280px] flex-1 md:min-w-0">
                  <ShopProductCard
                    product={product}
                    density="standard"
                    highlighted={product.sku === handlers.highlightSku}
                    quoteSent={handlers.quoteSent === product.sku}
                    disabled={handlers.busySku !== null}
                    loading={handlers.busySku === product.sku}
                    stripeEnabled={handlers.stripeEnabled}
                    onBuy={() => handlers.onBuy(product.sku)}
                    onQuote={() => handlers.onQuote(product)}
                  />
                </div>
              ))}
            </ShelfRow>
          )}

          {compact.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Quote & scoped services
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                {compact.map((product) => (
                  <ShopProductCard
                    key={product.sku}
                    product={product}
                    density="compact"
                    highlighted={product.sku === handlers.highlightSku}
                    quoteSent={handlers.quoteSent === product.sku}
                    disabled={handlers.busySku !== null}
                    loading={handlers.busySku === product.sku}
                    stripeEnabled={handlers.stripeEnabled}
                    onBuy={() => handlers.onBuy(product.sku)}
                    onQuote={() => handlers.onQuote(product)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}

function AisleHeader({
  id,
  aisleNumber,
  aisleLabel,
  title,
  hint,
  category,
  endcap,
}: {
  id: string
  aisleNumber: number
  aisleLabel: string
  title: string
  hint: string
  category: ServiceCategory
  endcap?: boolean
}) {
  return (
    <div className="relative">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
            endcap
              ? 'border-gold/40 bg-gold/10 text-gold-light'
              : 'border-slate-600/50 bg-slate-800/60 text-slate-300'
          }`}
        >
          <ShopCategoryIcon category={category} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {endcap ? `Endcap · ${aisleLabel}` : `Aisle ${aisleNumber} · ${aisleLabel}`}
          </p>
          <h3 id={id} className="font-serif text-2xl text-white mt-1">{title}</h3>
          <p className={`${portalMutedClass} mt-1.5 text-base max-w-3xl`}>{hint}</p>
        </div>
      </div>
      <div className="gold-rule mt-5" aria-hidden />
    </div>
  )
}

function ShelfRow({ children, scrollOnMobile }: { children: ReactNode; scrollOnMobile?: boolean }) {
  if (scrollOnMobile) {
    return (
      <div className="-mx-4 px-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin md:mx-0 md:px-0 md:overflow-visible">
        <div className="flex gap-4 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-5">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {children}
    </div>
  )
}
