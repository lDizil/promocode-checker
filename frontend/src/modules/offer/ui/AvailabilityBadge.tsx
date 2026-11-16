import { Icon } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'

import type { Availability } from '../model/offer.ts'
import styles from './AvailabilityBadge.module.css'

const TEXT: Record<Availability, string> = {
  yes: 'Доступно из РФ',
  partial: 'Из РФ — с ограничениями',
  no: 'Недоступно из РФ',
}

export interface AvailabilityBadgeProps {
  availability: Availability
  /** Shown under the badge for `partial` and `no`, e.g. «регистрация закрыта с 03.2022». */
  reason?: string | null
  className?: string
}

/** DESIGN_SPEC 3.22: regional availability with its reason. */
export function AvailabilityBadge({ availability, reason = null, className }: AvailabilityBadgeProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-availability={availability}>
      <span className={styles.badge}>
        <Icon icon={icons.Globe} size={16} />
        {TEXT[availability]}
      </span>
      {availability !== 'yes' && reason && <span className={styles.reason}>{reason}</span>}
    </div>
  )
}
