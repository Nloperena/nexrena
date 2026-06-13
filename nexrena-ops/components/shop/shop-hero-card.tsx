'use client'

import { useState } from 'react'
import type { PortalProduct } from '@/lib/product-catalog'
import {
  SHOP_CATEGORY_VISUALS,
  getShopVisual,
  shopBenefit,
  shopPriceHint,
  shopShortTitle,
} from '@/lib/shop-imagery'
import { PortalMediaPanel } from '@/components/portal-media-panel'
import { ShopCategoryIcon } from '@/components/shop/shop-category-icon'
import { ShopCardShell } from '@/components/shop/shop-card-shell'
import { ShopProductDetails } from '@/components/shop/shop-product-details'

type Props = {
  product: PortalProduct
  highlighted: boolean
  quoteSent: boolean
  disabled: boolean
  loading: boolean
  stripeEnabled: boolean
  onBuy: () => void
  onQuote: () => void
}

export function ShopHeroCard({
  product,
  highlighted,
  quoteSent,
  disabled,
  loading,
  stripeEnabled,
  onBuy,
  onQuote,
}: Props) {
  const [open, setOpen] = useState(highlighted)
  const visual = getShopVisual(product)

  return (
    <ShopCardShell highlighted={highlighted} featured={Boolean(product.badge)} className="h-full">
      <PortalMediaPanel
        photo={visual.photo}
        svgSrc={visual.svgSrc}
        aspect="video"
        overlay={58}
        rounded="none"
        className="min-h-[160px] sm:min-h-[180px]"
      >
        <div className="absolute bottom-3 left-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/45 text-gold-light backdrop-blur-md">
            <ShopCategoryIcon category={product.category} />
          </div>
          {product.badge && (
            <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-light">
              {product.badge}
            </span>
          )}
        </div>
      </PortalMediaPanel>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h4 className="font-serif text-2xl text-white leading-tight">{shopShortTitle(product)}</h4>
        <p className="mt-2 text-base text-slate-300 leading-snug">{shopBenefit(product)}</p>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="font-serif text-3xl text-white tabular-nums">{product.priceLabel}</p>
            <p className="text-xs text-slate-500 mt-1">{shopPriceHint(product)}</p>
          </div>
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
        />
      </div>
    </ShopCardShell>
  )
}
