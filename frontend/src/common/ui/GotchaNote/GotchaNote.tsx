import type { ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import { TriangleAlert } from '../Icon/icons.ts'
import styles from './GotchaNote.module.css'

export interface GotchaNoteProps {
  /** `warning` — «Есть подвох»; `neutral` — neutral-bg note such as «нет надёжных кодов» (DESIGN_SPEC 3.24). */
  tone?: 'warning' | 'neutral'
  title?: string
  /** Defaults to true only for `tone="warning"`, as the spec hides the title in the neutral variant. */
  showTitle?: boolean
  icon?: IconGlyph
  children: ReactNode
  className?: string
}

export function GotchaNote({
  tone = 'warning',
  title = 'Есть подвох',
  showTitle,
  icon = TriangleAlert,
  children,
  className,
}: GotchaNoteProps) {
  const withTitle = showTitle ?? tone === 'warning'

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-tone={tone}>
      <Icon icon={icon} size={16} className={styles.icon} />
      <div className={styles.content}>
        {withTitle && <p className={styles.title}>{title}</p>}
        <p className={styles.text}>{children}</p>
      </div>
    </div>
  )
}
