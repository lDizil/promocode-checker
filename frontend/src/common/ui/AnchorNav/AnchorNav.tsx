import styles from './AnchorNav.module.css'

export interface AnchorNavItem {
  id: string
  label: string
}

export interface AnchorNavProps {
  items: readonly AnchorNavItem[]
  activeId: string
  label?: string
  className?: string
}

/** DESIGN_SPEC 3.39: desktop section navigation with 2 px border-strong active indicator. */
export function AnchorNav({ items, activeId, label = 'Разделы страницы', className }: AnchorNavProps) {
  return (
    <nav className={[styles.root, className].filter(Boolean).join(' ')} aria-label={label}>
      <ul className={styles.list}>
        {items.map((item) => {
          const active = item.id === activeId
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? 'location' : undefined}
                data-active={active || undefined}
                className={[styles.link, 'text-body-sm'].join(' ')}
              >
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
