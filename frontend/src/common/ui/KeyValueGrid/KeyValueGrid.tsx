import type { ReactNode } from 'react'

import { Icon } from '../Icon/Icon.tsx'
import { TriangleAlert } from '../Icon/icons.ts'
import styles from './KeyValueGrid.module.css'

export interface KeyValueItem {
  label: string
  value: ReactNode
  /** Marks the value as a restriction and prefixes it with the warning triangle (DESIGN_SPEC 3.38). */
  warning?: boolean
}

export interface KeyValueGridProps {
  items: KeyValueItem[]
  className?: string
}

/** DESIGN_SPEC 3.38: «label → value» grid, 1 column on mobile and 2 on desktop; transparent for its surface. */
export function KeyValueGrid({ items, className }: KeyValueGridProps) {
  return (
    <dl className={[styles.root, className].filter(Boolean).join(' ')}>
      {items.map((item) => (
        <div key={item.label} className={styles.cell}>
          <dt className={styles.label}>{item.label}</dt>
          <dd className={styles.value}>
            {item.warning && <Icon icon={TriangleAlert} size={16} className={styles.warning} />}
            <span>{item.value}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
