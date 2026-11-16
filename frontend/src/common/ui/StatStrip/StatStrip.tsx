import type { ReactNode } from 'react'

import styles from './StatStrip.module.css'

export interface StatStripCell {
  label: string
  value: ReactNode
}

export interface StatStripProps {
  cells: StatStripCell[]
  /** Accessible name for the group of figures. */
  label?: string
  className?: string
}

/** DESIGN_SPEC 3.37: equal key figures; horizontal scroll with 2.5 cells visible on mobile. */
export function StatStrip({ cells, label, className }: StatStripProps) {
  return (
    <dl className={[styles.root, className].filter(Boolean).join(' ')} aria-label={label}>
      {cells.map((cell) => (
        <div key={cell.label} className={styles.cell}>
          <dt className={styles.label}>{cell.label}</dt>
          <dd className={styles.value}>{cell.value}</dd>
        </div>
      ))}
    </dl>
  )
}
