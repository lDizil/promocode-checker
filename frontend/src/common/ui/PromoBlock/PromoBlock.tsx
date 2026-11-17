import type { ReactElement } from 'react'

import { Button } from '../Button/Button.tsx'
import { Icon } from '../Icon/Icon.tsx'
import { Zap } from '../Icon/icons.ts'
import styles from './PromoBlock.module.css'

export interface PromoBlockProps {
  /** Only the «submit a code» content exists in the spec (DESIGN_SPEC 3.34). */
  content?: 'submit'
  title?: string
  description?: string
  actionLabel?: string
  /** Router link element for the CTA, e.g. `<Link to="/submit" />`. Defaults to an anchor with `actionHref`. */
  actionRender?: ReactElement
  actionHref?: string
  className?: string
}

/** DESIGN_SPEC 3.34: highlight promo block with a zap badge protruding above the top edge. */
export function PromoBlock({
  content = 'submit',
  title = 'Знаете код?',
  description = 'Пришлите — проверим и опубликуем',
  actionLabel = 'Прислать код',
  actionRender,
  actionHref,
  className,
}: PromoBlockProps) {
  return (
    <section className={[styles.root, className].filter(Boolean).join(' ')} data-content={content}>
      <span className={styles.badge} aria-hidden="true">
        <Icon icon={Zap} size={20} />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      <Button variant="on-highlight" size="sm" block external render={actionRender ?? <a href={actionHref ?? '#'} />}>
        {actionLabel}
      </Button>
    </section>
  )
}
