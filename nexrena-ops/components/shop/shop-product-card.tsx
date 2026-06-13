'use client'

import { useState } from 'react'
import type { PortalProduct } from '@/lib/product-catalog'
import {
  SHOP_CATEGORY_VISUALS,
  shopBenefit,
  shopPriceHint,
  shopShortTitle,
  type ShopShelfDensity,
} from '@/lib/shop-imagery'
import { PortalMediaPanel } from '@/components/portal-media-panel'
import { ShopCategoryIcon } from '@/components/shop/shop-category-icon'
import { ShopCardShell } from '@/components/shop/shop-card-shell'
import { ShopProductDetails } from '@/components/shop/shop-product-details'

type Props = {
  product: PortalProduct
  density: ShopShelfDensity
  highlighted: boolean
  quoteSent: boolean
  disabled: boolean
  loading: boolean
  stripeEnabled: boolean
  onBuy: () => void
  onQuote: () => void
}

export function ShopProductCard({
  product,
  density,
  highlighted,
  quoteSent,
  disabled,
  loading,
  stripeEnabled,
  onBuy,
  onQuote,
}: Props) {
  const [open, setOpen] = useState(highlighted)
  const visual = SHOP_CATEGORY_VISUALS[product.category]

  if (density === 'compact') {
    return (
      <ShopCardShell highlighted={highlighted} className="sm:flex-row">
        <div className="relative w-full shrink-0 sm:w-28 md:w-32">
          <PortalMediaPanel
            photo={visual.photo}
            svgSrc={visual.svgSrc}
            aspect="square"
            overlay={65}
            rounded="none"
            className="h-full min-h-[88px] sm:min-h-[120px]"
          >
            <div className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-gold-light">
              <ShopCategoryIcon category={product.category} className="w-4 h-4" />
            </div>
          </PortalMediaPanel>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-serif text-lg text-white leading-tight truncate">{shopShortTitle(product)}</h4>
              <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{shopBenefit(product)}</p>
            </div>
            <p className="shrink-0 font-serif text-lg text-gold-light tabular-nums">{product.priceLabel}</p>
          </div>
          <ShopProductDetails
            product={product}
            open={open}
            onToggle={() => setOpen((v) => !v)}
            disabled={disabled}
            loading={loading}
            stripeEnabled={stripeEnabled}
            quoteSent={quoteSent}
            onBuy={onBuy}
            onQuote={onQuote}
            compact
          />
        </div>
      </ShopCardShell>
    )
  }

  return (
    <ShopCardShell highlighted={highlighted} featured={Boolean(product.badge)} className="h-full snap-start">
      <PortalMediaPanel
        photo={visual.photo}
        svgSrc={visual.svgSrc}
        aspect="video"
        overlay={62}
        rounded="none"
        className="min-h-[120px]"
      >
        <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-gold-light backdrop-blur-sm">
            <ShopCategoryIcon category={product.category} className="w-5 h-5" />
          </div>
          {product.badge && (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold-light">
              {product.badge}
            </span>
          )}
        </div>
      </PortalMediaPanel>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h4 className="font-serif text-xl text-white leading-tight">{shopShortTitle(product)}</h4>
        <p className="mt-1.5 text-sm text-slate-400 leading-snug line-clamp-2">{shopBenefit(product)}</p>
        <p className="font-serif text-2xl text-white tabular-nums mt-4">{product.priceLabel}</p>
        <p className="text-xs text-slate-500 mt-0.5">{shopPriceHint(product)}</p>

        <ShopProductDetails
          product={product}
          open={open}
          onToggle={() => setOpen((v) => !v)}
          disabled={disabled}
          loading={loading}
          stripeEnabled={stripeEnabled}
          quoteSent={quoteSent}
          onBuy={onBuy}
          onQuote={onQuote}
        />
      </div>
    </ShopCardShell>
  )
}
