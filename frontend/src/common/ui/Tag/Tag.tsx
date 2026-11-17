import type { ReactNode } from 'react'

import styles from './Tag.module.css'

export type TagTone = 'partner' | 'user' | 'merchant' | 'success' | 'danger'

export interface TagProps {
  tone?: TagTone
  children: ReactNode
}

/** DESIGN_SPEC 3.36: white pill with a 6 px coloured dot, height 24. */
export function Tag({ tone = 'partner', children }: TagProps) {
  return (
    <span className={styles.tag} data-tone={tone}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  )
}
