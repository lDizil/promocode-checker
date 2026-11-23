import { Link } from '@tanstack/react-router'

import { plural, type PluralForms } from '@/common/plural.ts'
import { Accordion } from '@/common/ui/Accordion/index.ts'
import { Button } from '@/common/ui/Button/index.ts'
import { CategoryChip } from '@/common/ui/CategoryChip/index.ts'
import { EmptyState } from '@/common/ui/EmptyState/index.ts'
import { FilterChip } from '@/common/ui/FilterChip/index.ts'
import { icons } from '@/common/ui/Icon/index.ts'
import { OfflineBanner } from '@/common/ui/OfflineBanner/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { Skeleton } from '@/common/ui/Skeleton/index.ts'
import { SortControl } from '@/common/ui/SortControl/index.ts'
import { formatOffers, MerchantTile, MerchantTileSkeleton } from '@/modules/merchant/index.ts'
import { useConnectionStatus } from '@/modules/network/index.ts'
import {
  activeFilterCount,
  FilterSheet,
  OfferCard,
  OfferCardSkeleton,
  offerDetailPath,
  useOfferFilters,
  viewOffers,
  type OfferFilters,
  type OfferSort,
} from '@/modules/offer/index.ts'
import { useSearchResults } from '@/modules/search/index.ts'

import styles from './search.module.css'

export interface SearchPageProps {
  query: string
  now: Date
  filters: OfferFilters
  onFiltersChange: (next: OfferFilters) => Promise<unknown>
}

const MERCHANT_FORMS: PluralForms = {
  one: 'магазин и сервис',
  few: 'магазина и сервиса',
  many: 'магазинов и сервисов',
}

const SORT_OPTIONS: { value: OfferSort; label: string }[] = [
  { value: 'reliable', label: 'Сначала надёжные' },
  { value: 'value', label: 'Сначала выгодные' },
  { value: 'fresh', label: 'Сначала свежие' },
  { value: 'expiring', label: 'Скоро закончатся' },
]

const POPULAR_CATEGORIES = [
  { slug: 'food', label: 'Еда и продукты', icon: icons.Utensils },
  { slug: 'marketplaces', label: 'Маркетплейсы', icon: icons.Package },
  { slug: 'free', label: 'Бесплатно', icon: icons.Cloud },
] as const

const catalogPath = (slug: string): string => `/catalog/${slug}`

/** P-03 «Результаты поиска» (DESIGN_SPEC 4.3). */
export function SearchPage({ query, now, filters: search, onFiltersChange }: SearchPageProps) {
  const trimmed = query.trim()
  const results = useSearchResults(trimmed)
  const online = useConnectionStatus()
  const filter = useOfferFilters(search, onFiltersChange)
  const { filters, toggle, toggleKind } = filter
  const offersView = viewOffers(results.offers, filters)
  const filtered = activeFilterCount(filters) > 0

  const merchantCount = results.merchants.length
  const offerCount = offersView.totalActive
  const hasAnything = merchantCount > 0 || results.offers.length > 0

  return (
    <>
      {!online && <OfflineBanner />}
      <main className={styles.page}>
        <header className={styles.head}>
          <h1 className="text-h1">{trimmed ? `Результаты по «${trimmed}»` : 'Поиск по каталогу'}</h1>
          <p className={[styles.subtitle, 'text-body-sm'].join(' ')}>
            {merchantCount} {plural(merchantCount, MERCHANT_FORMS)} · {formatOffers(offerCount)}
          </p>
        </header>

        {!hasAnything ? (
          <EmptyState
            headingLevel={2}
            illustration="empty-cart"
            title={trimmed ? `По запросу «${trimmed}» ничего нет` : 'Ничего не найдено'}
            description="Попробуйте другой запрос или перейдите в популярную категорию"
            actions={POPULAR_CATEGORIES.map((category) => (
              <CategoryChip key={category.slug} icon={category.icon} render={<Link to={catalogPath(category.slug)} />}>
                {category.label}
              </CategoryChip>
            ))}
          />
        ) : (
          <>
            {merchantCount > 0 && (
              <section
                className={`${styles.section} ${styles.merchantsSection}`}
                aria-labelledby="search-merchants-title"
              >
                <SectionHeader
                  id="search-merchants-title"
                  title="Магазины и сервисы"
                  action={
                    <Link className={[styles.allLink, 'text-body-sm-strong'].join(' ')} to={'/catalog' as string}>
                      Все {merchantCount}
                    </Link>
                  }
                />
                <ul className={styles.merchantsGrid}>
                  {results.merchants.slice(0, 6).map((merchant) => (
                    <li key={merchant.slug}>
                      <MerchantTile
                        merchant={merchant}
                        offersCount={merchant.offerCount}
                        render={<Link to="/m/$slug" params={{ slug: merchant.slug }} />}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {results.offers.length > 0 ? (
              <section className={styles.section} aria-labelledby="search-offers-title">
                <h2 id="search-offers-title" className="visually-hidden">
                  Офферы
                </h2>
                <div className={styles.toolbar}>
                  <div className={styles.chips} role="group" aria-label="Фильтры">
                    <FilterChip
                      kind="dropdown"
                      icon={icons.Filter}
                      count={activeFilterCount(filters)}
                      onClick={filter.openSheet}
                      aria-expanded={filter.open}
                    >
                      Фильтры
                    </FilterChip>
                    <FilterChip
                      selected={filters.kinds?.includes('code') ?? false}
                      onSelectedChange={(on) => toggleKind('code', on)}
                    >
                      Промокоды
                    </FilterChip>
                    <FilterChip
                      selected={filters.kinds?.includes('sale') ?? false}
                      onSelectedChange={(on) => toggleKind('sale', on)}
                    >
                      Акции
                    </FilterChip>
                    <FilterChip
                      selected={filters.kinds?.includes('free') ?? false}
                      onSelectedChange={(on) => toggleKind('free', on)}
                    >
                      Бесплатно
                    </FilterChip>
                    <FilterChip
                      selected={filters.customer === 'new'}
                      onSelectedChange={(on) => toggle({ customer: on ? 'new' : undefined })}
                    >
                      Новым клиентам
                    </FilterChip>
                  </div>
                  <div className={styles.listMeta}>
                    <span className="text-caption">{formatOffers(offersView.active.length)}</span>
                    <SortControl
                      value={filters.sort ?? 'reliable'}
                      options={SORT_OPTIONS}
                      onChange={(sort) => toggle({ sort: sort === 'reliable' ? undefined : sort })}
                    />
                  </div>
                </div>

                {offersView.active.length === 0 && filtered ? (
                  <EmptyState
                    illustration="empty-cart"
                    title="Под эти фильтры ничего нет"
                    actions={
                      <Button variant="secondary" onClick={() => filter.change({ sort: filters.sort })}>
                        Сбросить фильтры
                      </Button>
                    }
                  />
                ) : (
                  <ul className={styles.offersGrid}>
                    {offersView.active.map((offer) => (
                      <li key={offer.id}>
                        <OfferCard
                          offer={offer}
                          now={now}
                          context="feed"
                          density="compact"
                          onCopy={() => {}}
                          linkRender={<Link {...offerDetailPath(offer)} />}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {offersView.ended.length > 0 && (
                  <Accordion
                    items={[
                      {
                        id: 'ended',
                        question: `Завершённые (${offersView.ended.length})`,
                        answer: (
                          <ul className={styles.offersGrid}>
                            {offersView.ended.map((offer) => (
                              <li key={offer.id}>
                                <OfferCard
                                  offer={offer}
                                  now={now}
                                  context="feed"
                                  density="compact"
                                  onCopy={() => {}}
                                  linkRender={<Link {...offerDetailPath(offer)} />}
                                />
                              </li>
                            ))}
                          </ul>
                        ),
                      },
                    ]}
                  />
                )}
              </section>
            ) : (
              <EmptyState
                illustration="empty-cart"
                title="Активных офферов по запросу нет"
                description="Откройте страницу магазина выше или выберите категорию в каталоге"
              />
            )}
          </>
        )}
      </main>
      <FilterSheet
        open={filter.open}
        onOpenChange={filter.setOpen}
        filters={filter.draft}
        onChange={filter.setDraft}
        onApply={filter.apply}
        offers={results.offers}
      />
    </>
  )
}

/** P-03 `loading` skeleton for route pendingComponent. */
export function SearchPageSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Загрузка результатов поиска">
      <div className={styles.head}>
        <Skeleton width={280} height={36} />
        <Skeleton width={220} height={18} />
      </div>
      <div className={styles.section}>
        <Skeleton width={200} height={24} />
        <ul className={styles.merchantsGrid}>
          {[0, 1, 2].map((key) => (
            <li key={key}>
              <MerchantTileSkeleton />
            </li>
          ))}
        </ul>
      </div>
      <ul className={styles.offersGrid}>
        {[0, 1, 2, 3].map((key) => (
          <li key={key}>
            <OfferCardSkeleton />
          </li>
        ))}
      </ul>
    </main>
  )
}
