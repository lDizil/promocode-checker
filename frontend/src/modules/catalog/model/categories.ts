import { viewOffers, type Offer, type OfferFilters } from '@/modules/offer/index.ts'

export type TopCategorySlug = 'all' | 'food' | 'marketplaces' | 'clothing' | 'subscriptions' | 'travel' | 'free'

export type FreeSubcategorySlug = 'cloud' | 'ai' | 'hosting' | 'tools' | 'students'

export interface TopCategory {
  slug: TopCategorySlug
  label: string
  path: string
  title?: string
  description: string
}

export interface FreeSubcategory {
  slug: FreeSubcategorySlug
  fullSlug: `free/${FreeSubcategorySlug}`
  label: string
  path: string
  description: string
}

export interface CatalogBranch {
  slug: string
  fullSlug: string
  label: string
  title: string
  path: string
  description: string
  isFree: boolean
}

export const TOP_CATEGORIES: readonly TopCategory[] = [
  {
    slug: 'all',
    label: 'Все',
    path: '/catalog',
    title: 'Каталог',
    description: '312 магазинов и сервисов · 1 240 офферов. Промокоды, акции и бесплатные кредиты в одном списке',
  },
  {
    slug: 'food',
    label: 'Еда и продукты',
    path: '/catalog/food',
    description: 'Проверенные промокоды и акции на доставку продуктов и готовой еды',
  },
  {
    slug: 'marketplaces',
    label: 'Маркетплейсы',
    path: '/catalog/marketplaces',
    description: 'Скидки и кешбэк на заказы на крупных маркетплейсах',
  },
  {
    slug: 'clothing',
    label: 'Одежда',
    path: '/catalog/clothing',
    description: 'Промокоды на одежду, обувь и аксессуары',
  },
  {
    slug: 'subscriptions',
    label: 'Подписки',
    path: '/catalog/subscriptions',
    description: 'Скидки на цифровые сервисы, книги и подписки',
  },
  {
    slug: 'travel',
    label: 'Путешествия',
    path: '/catalog/travel',
    description: 'Промокоды на отели, билеты и бронирования',
  },
  {
    slug: 'free',
    label: 'Бесплатно',
    path: '/catalog/free',
    title: 'Бесплатные кредиты и тарифы',
    description:
      'Облака, ИИ-сервисы и инструменты для разработчиков. Показываем, доступно ли из России и что будет после окончания',
  },
]

export const FREE_SUBCATEGORIES: readonly FreeSubcategory[] = [
  {
    slug: 'cloud',
    fullSlug: 'free/cloud',
    label: 'Облака и VPS',
    path: '/catalog/free/cloud',
    description: 'Облачные серверы, гранты и виртуальная инфраструктура',
  },
  {
    slug: 'ai',
    fullSlug: 'free/ai',
    label: 'ИИ-модели и API',
    path: '/catalog/free/ai',
    description: 'Бесплатные квоты и стартовые кредиты для работы с LLM и ИИ API',
  },
  {
    slug: 'hosting',
    fullSlug: 'free/hosting',
    label: 'Хостинг',
    path: '/catalog/free/hosting',
    description: 'CDN, статический хостинг и edge-сервисы',
  },
  {
    slug: 'tools',
    fullSlug: 'free/tools',
    label: 'Инструменты',
    path: '/catalog/free/tools',
    description: 'Бесплатные тарифы инструментов разработки',
  },
  {
    slug: 'students',
    fullSlug: 'free/students',
    label: 'Студентам',
    path: '/catalog/free/students',
    description: 'Образовательные пакеты и льготы для студентов',
  },
]

const TOP_BY_SLUG = new Map<string, TopCategory>(TOP_CATEGORIES.map((item) => [item.slug, item]))
const FREE_BY_SLUG = new Map<string, FreeSubcategory>(FREE_SUBCATEGORIES.map((item) => [item.slug, item]))

export function isFreeSubcategory(slug: string): slug is FreeSubcategorySlug {
  return FREE_BY_SLUG.has(slug)
}

export function resolveCatalogBranch(category?: string, freeSub?: string): CatalogBranch | null {
  if (freeSub !== undefined) {
    if (category !== 'free') return null
    const sub = FREE_BY_SLUG.get(freeSub)
    if (!sub) return null
    return {
      slug: sub.slug,
      fullSlug: sub.fullSlug,
      label: sub.label,
      title: sub.label,
      path: sub.path,
      description: sub.description,
      isFree: true,
    }
  }

  if (category === undefined) {
    const all = TOP_BY_SLUG.get('all')!
    return {
      slug: all.slug,
      fullSlug: 'all',
      label: all.label,
      title: all.title ?? all.label,
      path: all.path,
      description: all.description,
      isFree: false,
    }
  }

  if (category.startsWith('free/')) {
    return resolveCatalogBranch('free', category.slice('free/'.length))
  }

  const top = TOP_BY_SLUG.get(category)
  if (!top) return null
  return {
    slug: top.slug,
    fullSlug: top.slug,
    label: top.label,
    title: top.title ?? top.label,
    path: top.path,
    description: top.description,
    isFree: top.slug === 'free',
  }
}

export function matchesCategory(itemCategorySlug: string, branchFullSlug: string): boolean {
  if (branchFullSlug === 'all') return true
  return itemCategorySlug === branchFullSlug || itemCategorySlug.startsWith(`${branchFullSlug}/`)
}

/** Active free offers with `availability.status === 'no'` currently hidden by `availableInRu`. */
export function countHiddenUnavailable(offers: readonly Offer[], filters: OfferFilters): number {
  if (!filters.availableInRu) return 0
  const withoutAvailability = viewOffers(offers, { ...filters, availableInRu: false })
  return withoutAvailability.active.filter((offer) => offer.kind === 'free' && offer.availability?.status === 'no')
    .length
}
