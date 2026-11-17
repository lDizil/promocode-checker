import { Skeleton } from '@/common/ui/Skeleton/index.ts'

import styles from './MerchantTileSkeleton.module.css'

export interface MerchantTileSkeletonProps {
  /** Announced while the tile loads; the visual blocks stay hidden from assistive tech. */
  label?: string
  className?: string
}

/** DESIGN_SPEC 3.28 placeholder shaped like MerchantTile (3.6). */
export function MerchantTileSkeleton({ label = 'Загрузка магазина', className }: MerchantTileSkeletonProps) {
  return (
    <div
      className={[styles.tile, className].filter(Boolean).join(' ')}
      data-slot="merchant-tile-skeleton"
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <span className="visually-hidden">{label}</span>
      <Skeleton width={48} height={48} />
      <Skeleton width="70%" height={14} radius="sm" />
      <Skeleton width="45%" height={12} radius="sm" />
    </div>
  )
}
