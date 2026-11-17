import { Icon } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'

import { formatAgo, formatVerificationMethod, isStale } from '../model/format.ts'
import type { Offer } from '../model/offer.ts'
import styles from './VerifiedMeta.module.css'

export interface VerifiedMetaProps {
  offer: Pick<Offer, 'verification'>
  now: Date
  className?: string
}

/** DESIGN_SPEC 3.14: reviews, freshness and verification source in one caption line. */
export function VerifiedMeta({ offer, now, className }: VerifiedMetaProps) {
  const { lastCheckedAt, method, success7d, fail7d } = offer.verification
  const total = success7d + fail7d
  const stale = isStale(lastCheckedAt, now)
  const parts = [
    total > 0 ? `${success7d} из ${total} за 7 дней` : null,
    lastCheckedAt ? `Проверено ${formatAgo(lastCheckedAt, now)}` : null,
    formatVerificationMethod(method),
  ].filter(Boolean)

  return (
    <p className={[styles.meta, className].filter(Boolean).join(' ')} data-stale={stale || undefined}>
      <Icon icon={stale ? icons.TriangleAlert : icons.Check} size={stale ? 16 : 12} className={styles.icon} />
      {parts.length > 0 ? parts.join(' · ') : 'Ещё не проверяли'}
    </p>
  )
}
