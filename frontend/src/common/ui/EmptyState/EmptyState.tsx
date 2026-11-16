import type { ReactNode } from 'react'

import { Illustration, type IllustrationName } from '../Illustration/Illustration.tsx'
import styles from './EmptyState.module.css'

export interface EmptyStateProps {
  /** DESIGN_SPEC 3.35: `empty-cart` for empty lists, `plug` for errors and missing pages. */
  illustration: IllustrationName
  title: string
  description?: string
  /** 1–2 buttons. */
  actions?: ReactNode
  /** `h1` on system pages, `h2` inside a page section. */
  headingLevel?: 1 | 2
}

/** DESIGN_SPEC 3.27. */
export function EmptyState({ illustration, title, description, actions, headingLevel = 2 }: EmptyStateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <section className={styles.root}>
      <div className={styles.art}>
        <Illustration name={illustration} />
      </div>
      <Heading className={headingLevel === 1 ? 'text-h1' : 'text-h2'}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  )
}
