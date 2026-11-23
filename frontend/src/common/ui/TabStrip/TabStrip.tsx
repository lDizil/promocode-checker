import { cloneElement, type ReactElement, type ReactNode } from 'react'

import styles from './TabStrip.module.css'

export interface TabStripItemElementProps {
  className?: string
  children?: ReactNode
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false'
  'data-active'?: ''
}

export interface TabStripItem {
  key: string
  label: string
  active: boolean
  /** Router link element, e.g. `<Link to="/catalog/food" />`. */
  render: ReactElement<TabStripItemElementProps>
}

export interface TabStripProps {
  items: readonly TabStripItem[]
  label: string
  className?: string
}

/** DESIGN_SPEC 4.6: horizontal scrollable tab strip for mobile category and sub-category links. */
export function TabStrip({ items, label, className }: TabStripProps) {
  return (
    <nav className={[styles.root, className].filter(Boolean).join(' ')} aria-label={label}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.key} className={styles.item}>
            {cloneElement(
              item.render,
              {
                className: [styles.tab, 'text-body-sm-strong', item.render.props.className].filter(Boolean).join(' '),
                'aria-current': item.active ? 'page' : undefined,
                'data-active': item.active ? '' : undefined,
              },
              item.label,
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
