import type { ReactNode } from 'react'

import styles from './SectionHeader.module.css'

export interface SectionHeaderProps {
  title: string
  /** Trailing link or explanation, e.g. «Все» or «Почему такой шанс?» (DESIGN_SPEC 3.31). */
  action?: ReactNode
  headingLevel?: 2 | 3
  id?: string
  className?: string
}

export function SectionHeader({ title, action, headingLevel = 2, id, className }: SectionHeaderProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <Heading id={id} className={headingLevel === 2 ? 'text-h2' : 'text-title'}>
        {title}
      </Heading>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
