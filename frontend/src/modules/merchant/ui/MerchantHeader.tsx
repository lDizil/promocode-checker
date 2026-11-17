import { Button } from '@/common/ui/Button/index.ts'
import { Icon, icons } from '@/common/ui/Icon/index.ts'

import type { Merchant } from '../model/merchant.ts'
import { formatActiveOffers } from '../model/plural.ts'
import { MerchantAvatar } from './MerchantAvatar.tsx'
import styles from './MerchantHeader.module.css'

export interface MerchantHeaderProps {
  merchant: Merchant
  activeCount: number
  /** Already formatted by the page: «2 ч назад» (DESIGN_SPEC 3.14). */
  updatedAgo: string
  className?: string
}

/** DESIGN_SPEC 4.4 item 2: avatar 64, «Промокоды {name}», active-offer caption and the site link. */
export function MerchantHeader({ merchant, activeCount, updatedAgo, className }: MerchantHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')} data-slot="merchant-header">
      <div className={styles.identity}>
        <MerchantAvatar name={merchant.name} logoUrl={merchant.logoUrl} size={64} />
        <div className={styles.text}>
          <h1 className={[styles.title, 'text-h1'].join(' ')}>Промокоды {merchant.name}</h1>
          <p className={[styles.caption, 'text-caption'].join(' ')}>
            {formatActiveOffers(activeCount)} · обновлено {updatedAgo}
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        render={<a href={merchant.siteUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <span className={styles.siteLabel}>
          Сайт магазина
          <Icon icon={icons.ExternalLink} size={16} />
        </span>
      </Button>
    </header>
  )
}
