import { Link } from '@tanstack/react-router'

import { TabStrip, type TabStripItem } from '@/common/ui/TabStrip/index.ts'

import { FREE_SUBCATEGORIES, TOP_CATEGORIES } from '../model/categories.ts'
import styles from './CatalogMobileTabs.module.css'

const MOBILE_TOP_ORDER = ['all', 'free', 'food', 'marketplaces', 'clothing', 'subscriptions', 'travel'] as const

const TOP_BY_SLUG = new Map(TOP_CATEGORIES.map((item) => [item.slug, item]))

export interface CatalogMobileTabsProps {
  activeSlug: string
  className?: string
}

/** DESIGN_SPEC 4.6: horizontal mobile tabs with a secondary row inside «Бесплатно». */
export function CatalogMobileTabs({ activeSlug, className }: CatalogMobileTabsProps) {
  const isFreeBranch = activeSlug === 'free' || activeSlug.startsWith('free/')

  const topItems: TabStripItem[] = MOBILE_TOP_ORDER.map((slug) => {
    const category = TOP_BY_SLUG.get(slug)!
    return {
      key: category.slug,
      label: category.label,
      active: slug === 'free' ? isFreeBranch : activeSlug === category.slug,
      render: <Link to={category.path} />,
    }
  })

  const freeSubItems: TabStripItem[] = isFreeBranch
    ? [
        {
          key: 'free',
          label: 'Все',
          active: activeSlug === 'free',
          render: <Link to={'/catalog/free' as string} />,
        },
        ...FREE_SUBCATEGORIES.map((sub) => ({
          key: sub.fullSlug,
          label: sub.label,
          active: activeSlug === sub.fullSlug,
          render: <Link to={sub.path} />,
        })),
      ]
    : []

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')}>
      <TabStrip label="Категории каталога" items={topItems} />
      {isFreeBranch && <TabStrip label="Подкатегории раздела Бесплатно" items={freeSubItems} />}
    </div>
  )
}
