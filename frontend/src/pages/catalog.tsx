import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { plural, type PluralForms } from '@/common/plural.ts'
import { Button, IconButton } from '@/common/ui/Button/index.ts'
import { EmptyState } from '@/common/ui/EmptyState/index.ts'
import { FilterChip } from '@/common/ui/FilterChip/index.ts'
import { icons } from '@/common/ui/Icon/index.ts'
import { OfflineBanner } from '@/common/ui/OfflineBanner/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { Skeleton } from '@/common/ui/Skeleton/index.ts'
import { SortControl } from '@/common/ui/SortControl/index.ts'
import {
  CatalogMobileTabs,
  CatalogSidebar,
  countHiddenUnavailable,
  FreeFilterSheet,
  matchesCategory,
  resolveCatalogBranch,
} from '@/modules/catalog/index.ts'
import { formatOffers, MerchantTile, MerchantTileSkeleton, useMerchants } from '@/modules/merchant/index.ts'
import { useConnectionStatus } from '@/modules/network/index.ts'
import {
  activeFilterCount,
  FilterSheet,
  OfferCard,
  OfferCardSkeleton,
  offerDetailPath,
  OfferFeedback,
  useCopyCode,
  useOfferFilters,
  useOffers,
  viewOffers,
  type OfferFilters,
  type OfferSort,
} from '@/modules/offer/index.ts'

import styles from './catalog.module.css'

export interface CatalogPageProps {
  branchSlug: string
  now: Date
  filters: OfferFilters
  onFiltersChange: (next: OfferFilters) => Promise<unknown>
}

const SORT_OPTIONS: { value: OfferSort; label: string }[] = [
  { value: 'reliable', label: 'Сначала надёжные' },
  { value: 'value', label: 'Сначала выгодные' },
  { value: 'fresh', label: 'Сначала свежие' },
  { value: 'expiring', label: 'Скоро закончатся' },
]

const HIDDEN_VERB: PluralForms = { one: 'Скрыт', few: 'Скрыто', many: 'Скрыто' }
const HIDDEN_ADJ: PluralForms = { one: 'недоступный', few: 'недоступных', many: 'недоступных' }

function hiddenSummary(count: number): string {
  return `${plural(count, HIDDEN_VERB)} ${formatOffers(count)}, ${plural(count, HIDDEN_ADJ)} из России.`
}

function CatalogMerchants({ branchFullSlug }: { branchFullSlug: string }) {
  const allMerchants = useMerchants(branchFullSlug === 'all' ? undefined : { category: branchFullSlug })
  const merchants = allMerchants.filter((merchant) => matchesCategory(merchant.categorySlug, branchFullSlug))
  const [expanded, setExpanded] = useState(false)

  if (merchants.length === 0) return null

  const visible = expanded ? merchants : merchants.slice(0, 6)

  return (
    <section className={styles.merchantsSection} aria-labelledby="catalog-merchants-title">
      <SectionHeader
        id="catalog-merchants-title"
        title="Магазины и сервисы"
        action={
          merchants.length > 6 ? (
            <button type="button" className={styles.expandBtn} onClick={() => setExpanded((prev) => !prev)}>
              {expanded ? 'Свернуть' : `Все ${merchants.length}`}
            </button>
          ) : undefined
        }
      />
      <ul className={styles.merchantsGrid}>
        {visible.map((merchant) => (
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
  )
}

/** P-06 «Единый каталог» (DESIGN_SPEC 4.6). */
export function CatalogPage({ branchSlug, now, filters: search, onFiltersChange }: CatalogPageProps) {
  const branch = resolveCatalogBranch(branchSlug)
  const online = useConnectionStatus()
  const filter = useOfferFilters(search, onFiltersChange)
  const { filters, toggle, toggleKind } = filter
  const { copiedId, copy } = useCopyCode()
  const rawOffers = useOffers(branch && branch.fullSlug !== 'all' ? { category: branch.fullSlug } : undefined)

  if (!branch) {
    return (
      <main className={styles.page}>
        <EmptyState
          illustration="plug"
          headingLevel={1}
          title="Такой категории нет"
          actions={<Button render={<Link to={'/catalog' as string} />}>Весь каталог</Button>}
        />
      </main>
    )
  }

  const branchOffers = rawOffers.filter((offer) => matchesCategory(offer.categorySlug, branch.fullSlug))
  const hasFreeOffers = branchOffers.some((offer) => !offer.isEnded && offer.kind === 'free')
  const showAvailableChip = branch.isFree || hasFreeOffers
  const effectiveAvailableInRu = filters.availableInRu ?? showAvailableChip
  const effectiveFilters: OfferFilters = {
    ...filters,
    availableInRu: effectiveAvailableInRu ? true : undefined,
  }

  const offersView = viewOffers(branchOffers, effectiveFilters)
  const hiddenCount = countHiddenUnavailable(branchOffers, effectiveFilters)

  const filterSheetOffers =
    !branch.isFree && effectiveFilters.availableInRu
      ? branchOffers.filter((offer) => !(offer.kind === 'free' && offer.availability?.status === 'no'))
      : branchOffers

  return (
    <>
      {!online && <OfflineBanner />}
      <main className={styles.page}>
        <header className={styles.head}>
          <h1 className="text-h1">{branch.title}</h1>
          <p className={`${styles.description} text-body-sm`}>{branch.description}</p>
        </header>

        <div className={styles.mobileTabs}>
          <CatalogMobileTabs activeSlug={branch.fullSlug} />
        </div>

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <CatalogSidebar activeSlug={branch.fullSlug} />
          </div>

          <div className={styles.content}>
            {!branch.isFree && <CatalogMerchants branchFullSlug={branch.fullSlug} />}

            <section className={styles.content} aria-labelledby="catalog-offers-title">
              <h2 id="catalog-offers-title" className="visually-hidden">
                Офферы каталога
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

                  {showAvailableChip && (
                    <FilterChip
                      selected={effectiveAvailableInRu}
                      onSelectedChange={(on) => toggle({ availableInRu: on ? undefined : false })}
                    >
                      Доступно из РФ
                    </FilterChip>
                  )}

                  {branch.isFree ? (
                    <>
                      <FilterChip
                        selected={filters.noCard ?? false}
                        onSelectedChange={(on) => toggle({ noCard: on ? true : undefined })}
                      >
                        Без карты
                      </FilterChip>
                      <FilterChip
                        selected={filters.noForeignCard ?? false}
                        onSelectedChange={(on) => toggle({ noForeignCard: on ? true : undefined })}
                      >
                        Без зарубежной карты
                      </FilterChip>
                      <FilterChip
                        selected={filters.forever ?? false}
                        onSelectedChange={(on) => toggle({ forever: on ? true : undefined })}
                      >
                        Бессрочно
                      </FilterChip>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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

              {hiddenCount > 0 && (
                <div className={styles.hiddenBanner} role="status">
                  <span className="text-body-sm">{hiddenSummary(hiddenCount)}</span>
                  <button
                    type="button"
                    className={`${styles.showUnavailableBtn} text-body-sm-strong`}
                    onClick={() => toggle({ availableInRu: false })}
                  >
                    Показать
                  </button>
                </div>
              )}

              {offersView.active.length === 0 ? (
                offersView.totalActive > 0 ? (
                  <EmptyState
                    illustration="empty-cart"
                    title="Под эти условия офферов нет"
                    actions={
                      <Button variant="secondary" onClick={() => filter.change({ sort: filters.sort })}>
                        Сбросить фильтры
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    illustration="empty-cart"
                    title="В этой категории пока нет офферов"
                    description="Посмотрите другие разделы или откройте весь каталог"
                    actions={
                      <Button variant="secondary" render={<Link to={'/catalog' as string} />}>
                        Открыть весь каталог
                      </Button>
                    }
                  />
                )
              ) : (
                <ul className={styles.feed}>
                  {offersView.active.map((offer) => (
                    <li key={offer.id}>
                      <OfferCard
                        offer={offer}
                        now={now}
                        context="feed"
                        density="full"
                        copied={copiedId === offer.id}
                        onCopy={() => copy(offer)}
                        feedbackSlot={
                          <OfferFeedback
                            key={offer.id}
                            offerId={offer.id}
                            mode={offer.kind === 'free' ? 'free' : 'promo'}
                          />
                        }
                        detailsLink={
                          <IconButton
                            icon={icons.ChevronRight}
                            label="Подробнее"
                            size="sm"
                            render={<Link {...offerDetailPath(offer)} />}
                          />
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </main>

      {branch.isFree ? (
        <FreeFilterSheet
          open={filter.open}
          onOpenChange={filter.setOpen}
          filters={filter.draft}
          onChange={filter.setDraft}
          onApply={filter.apply}
          offers={branchOffers}
        />
      ) : (
        <FilterSheet
          open={filter.open}
          onOpenChange={filter.setOpen}
          filters={filter.draft}
          onChange={filter.setDraft}
          onApply={filter.apply}
          offers={filterSheetOffers}
        />
      )}
    </>
  )
}

/** P-06 `loading` skeleton for route pendingComponent. */
export function CatalogPageSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Загрузка каталога">
      <div className={styles.head}>
        <Skeleton width={240} height={36} />
        <Skeleton width={420} height={18} />
      </div>
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <Skeleton width={240} height={420} />
        </div>
        <div className={styles.content}>
          <ul className={styles.merchantsGrid}>
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <li key={key}>
                <MerchantTileSkeleton />
              </li>
            ))}
          </ul>
          <ul className={styles.feed}>
            {[0, 1, 2, 3].map((key) => (
              <li key={key}>
                <OfferCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
