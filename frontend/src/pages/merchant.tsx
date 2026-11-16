import { Link } from '@tanstack/react-router'

import { Accordion } from '@/common/ui/Accordion/index.ts'
import { Button } from '@/common/ui/Button/index.ts'
import { EmptyState } from '@/common/ui/EmptyState/index.ts'
import { FilterChip } from '@/common/ui/FilterChip/index.ts'
import { GotchaNote } from '@/common/ui/GotchaNote/index.ts'
import { PromoBlock } from '@/common/ui/PromoBlock/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { Skeleton } from '@/common/ui/Skeleton/index.ts'
import { SortControl } from '@/common/ui/SortControl/index.ts'
import { StatStrip } from '@/common/ui/StatStrip/index.ts'
import { StepList } from '@/common/ui/StepList/index.ts'
import { toast } from '@/common/ui/Toast/index.ts'
import { formatOffers, MerchantHeader, useMerchant } from '@/modules/merchant/index.ts'
import {
  formatAgo,
  formatDate,
  OfferCard,
  OfferCardSkeleton,
  OfferFeedback,
  useCopyCode,
  useMerchantOffers,
  type Offer,
  type OfferFilters,
  type OfferSort,
} from '@/modules/offer/index.ts'

import styles from './merchant.module.css'

export interface MerchantPageProps {
  slug: string
  now: Date
  filters: OfferFilters
  onFiltersChange: (next: OfferFilters) => void
}

const SORT_OPTIONS: { value: OfferSort; label: string }[] = [
  { value: 'reliable', label: 'Сначала надёжные' },
  { value: 'value', label: 'Сначала выгодные' },
  { value: 'fresh', label: 'Сначала свежие' },
  { value: 'expiring', label: 'Скоро закончатся' },
]

/** P-04 «Страница магазина» (DESIGN_SPEC 4.4). */
export function MerchantPage({ slug, now, filters, onFiltersChange }: MerchantPageProps) {
  const merchant = useMerchant(slug)
  const offers = useMerchantOffers(slug, filters)
  const { copiedId, copy } = useCopyCode()

  const onCopy = (offer: Offer) => {
    copy(offer)
    toast.success(`Код скопирован. Откройте ${merchant.name} и вставьте его при оплате`, {
      action: { label: 'Открыть магазин', href: offer.targetUrl },
    })
  }

  const toggle = (patch: Partial<OfferFilters>) => onFiltersChange({ ...filters, ...patch })
  const filtered = filters.kind !== undefined || filters.customer !== undefined
  const submitLink = <Link to="/submit" search={{ m: merchant.slug }} />

  return (
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
                  selected={filters.kind === 'code'}
                  onSelectedChange={(on) => toggle({ kind: on ? 'code' : undefined })}
                >
                  Промокоды
                </FilterChip>
                <FilterChip
                  selected={filters.kind === 'sale'}
                  onSelectedChange={(on) => toggle({ kind: on ? 'sale' : undefined })}
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
                  <Button variant="secondary" onClick={() => onFiltersChange({ sort: filters.sort })}>
                    Сбросить фильтры
                  </Button>
                }
              />
            ) : (
              <ul className={styles.list}>
                {offers.active.map((offer) => (
                  <li key={offer.id}>
                    <OfferCard
                      offer={offer}
                      now={now}
                      context="merchant"
                      density="full"
                      copied={copiedId === offer.id}
                      onCopy={() => onCopy(offer)}
                      feedbackSlot={<OfferFeedback key={offer.id} offerId={offer.id} />}
                      detailsLink={<Link to="/m/$slug/o/$offerId" params={{ slug, offerId: offer.id }} />}
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
