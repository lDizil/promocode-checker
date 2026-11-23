import { Link } from '@tanstack/react-router'

import { FREE_SUBCATEGORIES, TOP_CATEGORIES } from '../model/categories.ts'
import styles from './CatalogSidebar.module.css'

export interface CatalogSidebarProps {
  /** Full slug of the active catalog branch, e.g. `'all'`, `'food'`, `'free'`, `'free/ai'`. */
  activeSlug: string
  className?: string
}

/** DESIGN_SPEC 4.6: desktop 240 px category tree with indented «Бесплатно» branches. */
export function CatalogSidebar({ activeSlug, className }: CatalogSidebarProps) {
  return (
    <nav className={[styles.root, className].filter(Boolean).join(' ')} aria-label="Категории каталога">
      <ul className={styles.list}>
        {TOP_CATEGORIES.map((category) => {
          const isActive = activeSlug === category.slug
          return (
            <li key={category.slug}>
              <Link
                to={category.path}
                className={styles.item}
                data-active={isActive ? '' : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                {category.label}
              </Link>
              {category.slug === 'free' && (
                <ul className={styles.sublist}>
                  {FREE_SUBCATEGORIES.map((sub) => {
                    const isSubActive = activeSlug === sub.fullSlug
                    return (
                      <li key={sub.slug}>
                        <Link
                          to={sub.path}
                          className={`${styles.item} ${styles.subitem}`}
                          data-active={isSubActive ? '' : undefined}
                          aria-current={isSubActive ? 'page' : undefined}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
