import { Icon } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'
import { Popover } from '@/common/ui/Popover/index.ts'

import type { Offer } from '../model/offer.ts'
import styles from './AdLabel.module.css'

export interface AdLabelProps {
  marking: NonNullable<Offer['adMarking']>
  /** «Подробнее о рекламе» target; P-11 anchor by default. */
  detailsHref?: string
}

/** DESIGN_SPEC 3.16: «Реклама» marker with the advertiser disclosure behind a tap. */
export function AdLabel({ marking, detailsHref = '/about/verification#ads' }: AdLabelProps) {
  return (
    <Popover
      label="Реклама"
      align="end"
      trigger={
        <button type="button" className={styles.trigger}>
          Реклама
          <Icon icon={icons.Info} size={12} />
        </button>
      }
    >
      <p>
        Реклама. {marking.advertiser}, ИНН {marking.inn}. erid: {marking.erid}. Мы получаем комиссию, если вы купите по
        ссылке. На порядок офферов это не влияет.
      </p>
      <a className={styles.link} href={detailsHref}>
        Подробнее о рекламе
      </a>
    </Popover>
  )
}
