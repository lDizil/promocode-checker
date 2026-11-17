import { Skeleton } from '@/common/ui/Skeleton/index.ts'

import styles from './OfferCardSkeleton.module.css'

export interface OfferCardSkeletonProps {
  density?: 'full' | 'compact'
}

/** DESIGN_SPEC 3.28: the offer card in neutral-bg blocks with the 1.2 s shimmer. */
export function OfferCardSkeleton({ density = 'full' }: OfferCardSkeletonProps) {
  if (density === 'compact') {
    return (
      <div className={styles.root} role="status" aria-busy="true">
        <span className="visually-hidden">Загружаем оффер</span>
        <Skeleton width={140} height={16} />
        <Skeleton width="70%" height={20} />
        <Skeleton width="55%" height={14} />
      </div>
    )
  }

  return (
    <div className={styles.root} role="status" aria-busy="true">
      <span className="visually-hidden">Загружаем оффер</span>
      <div className={styles.header}>
        <Skeleton width={32} height={32} radius="md" />
        <Skeleton width={120} height={16} />
      </div>
      <Skeleton width="60%" height={22} />
      <Skeleton height={52} />
      <div className={styles.trust}>
        <Skeleton width={132} height={28} radius="sm" />
        <Skeleton width={80} height={6} />
      </div>
      <Skeleton width="70%" height={14} />
      <Skeleton width="90%" height={16} />
      <Skeleton width="75%" height={16} />
      <Skeleton height={44} />
    </div>
  )
}
