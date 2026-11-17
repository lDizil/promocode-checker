import { Link } from '@tanstack/react-router'

import { Accordion } from '@/common/ui/Accordion/index.ts'
import { Button, IconButton } from '@/common/ui/Button/index.ts'
import { EmptyState } from '@/common/ui/EmptyState/index.ts'
import { FilterChip } from '@/common/ui/FilterChip/index.ts'
import { GotchaNote } from '@/common/ui/GotchaNote/index.ts'
import { Icon, icons } from '@/common/ui/Icon/index.ts'
import { OfflineBanner } from '@/common/ui/OfflineBanner/index.ts'
import { PromoBlock } from '@/common/ui/PromoBlock/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { Skeleton } from '@/common/ui/Skeleton/index.ts'
import { SortControl } from '@/common/ui/SortControl/index.ts'
import { StatStrip } from '@/common/ui/StatStrip/index.ts'
import { StepList } from '@/common/ui/StepList/index.ts'
import { formatOffers, MerchantHeader, useMerchant } from '@/modules/merchant/index.ts'
import { useConnectionStatus } from '@/modules/network/index.ts'
import {
  activeFilterCount,
  FilterSheet,
  formatAgo,
  formatDate,
  formatTime,
  OfferCard,
  OfferCardSkeleton,
  OfferFeedback,
  useCopyCode,
  useOfferFilters,
  useOfferRecommendation,
  useMerchantOffers,
  type OfferFilters,
  type OfferSort,
} from '@/modules/offer/index.ts'

import styles from './merchant.module.css'

export interface MerchantPageProps {
  slug: string
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

/** P-04 «Страница магазина» (DESIGN_SPEC 4.4). */
export function MerchantPage({ slug, now, filters: search, onFiltersChange }: MerchantPageProps) {
  const merchant = useMerchant(slug)
  const online = useConnectionStatus()
  const filter = useOfferFilters(search, onFiltersChange)
  const { filters } = filter
  const offers = useMerchantOffers(slug, filters)
  const { copiedId, copy } = useCopyCode()
  const { recommendation, onFeedbackSubmitted } = useOfferRecommendation(offers.active)

  const { toggle, toggleKind } = filter
  const filtered = activeFilterCount(filters) > 0
  const submitLink = <Link to="/submit" search={{ m: merchant.slug }} />

  return (
    <>
      {!online && <OfflineBanner since={formatTime(new Date(offers.updatedAt))} />}
      <main className={styles.page}>
        <div className={styles.main}>
          <MerchantHeader
            merchant={merchant}
            activeCount={offers.summary.count}
            updatedAgo={formatAgo(merchant.updatedAt, now)}
          />

          {offers.totalActive > 0 && (
            <StatStrip
              label="Сводка по офферам"
              cells={[
                { label: 'Активных офферов', value: offers.summary.count },
                { label: 'Лучшая выгода', value: offers.summary.bestValue ?? '—' },
                { label: 'Лучший шанс', value: offers.summary.bestScore ?? '—' },
              ]}
            />
          )}

          {offers.totalActive === 0 ? (
            <EmptyState
              illustration="empty-cart"
              title="Проверенных кодов сейчас нет"
              description={
                merchant.lastWorkingCodeAt
                  ? `Последний рабочий код был ${formatDate(merchant.lastWorkingCodeAt)}. Знаете рабочий код — пришлите, проверим`
                  : 'Знаете рабочий код — пришлите, проверим'
              }
              actions={
                <Button external render={submitLink}>
                  Прислать код
                </Button>
              }
            />
          ) : (
            <section aria-labelledby="offers-title" className={styles.offers}>
              <h2 id="offers-title" className="visually-hidden">
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
                    selected={filters.customer === 'new'}
                    onSelectedChange={(on) => toggle({ customer: on ? 'new' : undefined })}
                  >
                    Новым клиентам
                  </FilterChip>
                  <FilterChip
                    selected={filters.customer === 'existing'}
                    onSelectedChange={(on) => toggle({ customer: on ? 'existing' : undefined })}
                  >
                    Постоянным
                  </FilterChip>
                </div>
                <div className={styles.listMeta}>
                  <span className="text-caption">{formatOffers(offers.active.length)}</span>
                  <SortControl
                    value={filters.sort ?? 'reliable'}
                    options={SORT_OPTIONS}
                    onChange={(sort) => toggle({ sort: sort === 'reliable' ? undefined : sort })}
                  />
                </div>
              </div>

              {offers.allLow && (
                <GotchaNote tone="neutral">
                  Сейчас у магазина {merchant.name} нет надёжных кодов. Ниже — коды с жалобами, пробуйте на свой риск
                </GotchaNote>
              )}

              {offers.active.length === 0 && filtered ? (
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
                <ul className={styles.list}>
                  {offers.active.map((offer) => (
                    <li
                      key={offer.id}
                      className={styles.offer}
                      data-recommended={recommendation?.offerId === offer.id || undefined}
                    >
                      {recommendation?.offerId === offer.id && (
                        <p className={`${styles.recommendation} text-caption`} role="status">
                          <Icon icon={icons.ArrowDown} size={16} />
                          {recommendation.message}
                        </p>
                      )}
                      <OfferCard
                        offer={offer}
                        now={now}
                        context="merchant"
                        density="full"
                        copied={copiedId === offer.id}
                        onCopy={() => copy(offer)}
                        feedbackSlot={
                          <OfferFeedback key={offer.id} offerId={offer.id} onSubmitted={onFeedbackSubmitted} />
                        }
                        detailsLink={
                          <IconButton
                            icon={icons.ChevronRight}
                            label="Подробнее"
                            size="sm"
                            render={<Link to="/m/$slug/o/$offerId" params={{ slug, offerId: offer.id }} />}
                          />
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}

              {offers.ended.length > 0 && (
                <Accordion
                  items={[
                    {
                      id: 'ended',
                      question: `Завершённые (${offers.ended.length})`,
                      answer: (
                        <ul className={styles.list}>
                          {offers.ended.map((offer) => (
                            <li key={offer.id}>
                              <OfferCard offer={offer} now={now} context="merchant" density="full" onCopy={() => {}} />
                            </li>
                          ))}
                        </ul>
                      ),
                    },
                  ]}
                />
              )}
            </section>
          )}
        </div>

        <aside className={styles.aside}>
          {merchant.howToApply.length > 0 && (
            <section className={styles.panel}>
              <SectionHeader title={`Как применить код в ${merchant.name}`} />
              <StepList steps={merchant.howToApply.map((title) => ({ title }))} />
            </section>
          )}
          {merchant.faq.length > 0 && (
            <section className={styles.panel}>
              <SectionHeader title="Частые вопросы" />
              <Accordion items={merchant.faq.map(({ question, answer }) => ({ question, answer }))} />
            </section>
          )}
          <PromoBlock title={`Знаете код для ${merchant.name}?`} actionRender={submitLink} />
        </aside>
      </main>
      <FilterSheet
        open={filter.open}
        onOpenChange={filter.setOpen}
        filters={filter.draft}
        onChange={filter.setDraft}
        onApply={filter.apply}
        offers={offers.all}
      />
    </>
  )
}

/** P-04 `loading`: header placeholder and three card skeletons. */
export function MerchantPageSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Загрузка магазина">
      <div className={styles.main}>
        <Skeleton height={64} width={320} />
        <Skeleton height={96} />
        <ul className={styles.list}>
          {[0, 1, 2].map((key) => (
            <li key={key}>
              <OfferCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
