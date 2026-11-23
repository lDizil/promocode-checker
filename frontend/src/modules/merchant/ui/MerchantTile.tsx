import { cloneElement, type ReactElement, type ReactNode } from 'react'

import type { Merchant } from '../model/merchant.ts'
import { formatOffers } from '../model/plural.ts'
import { MerchantAvatar } from './MerchantAvatar.tsx'
import styles from './MerchantTile.module.css'

interface TileElementProps {
  className?: string
  children?: ReactNode
  'data-slot'?: string
  'data-interactive'?: string
}

export interface MerchantTileProps {
  merchant: Pick<Merchant, 'slug' | 'name' | 'logoUrl'>
  offersCount: number
  /**
   * Renders the tile as a link, e.g. `<a href="/m/samokat" />` or a router `<Link />`.
   * The element must forward `className`, `data-*` and `children`.
   */
  render?: ReactElement<TileElementProps>
  className?: string
}

/** DESIGN_SPEC 3.6: popular-merchant tile; 3 per row on mobile, 6 on desktop — the grid is page-owned. */
export function MerchantTile({ merchant, offersCount, render, className }: MerchantTileProps) {
  const content = (
    <>
      <MerchantAvatar name={merchant.name} logoUrl={merchant.logoUrl} size={48} />
      <span className={[styles.name, 'text-body-sm-strong'].join(' ')}>{merchant.name}</span>
      <span className={[styles.offers, 'text-caption'].join(' ')}>{formatOffers(offersCount)}</span>
    </>
  )

  const tileClassName = [styles.tile, className].filter(Boolean).join(' ')

  if (render !== undefined) {
    return cloneElement(
      render,
      {
        className: [tileClassName, render.props.className].filter(Boolean).join(' '),
        'data-slot': 'merchant-tile',
        'data-interactive': '',
      },
      content,
    )
  }

  return (
    <div className={tileClassName} data-slot="merchant-tile">
      {content}
    </div>
  )
}
