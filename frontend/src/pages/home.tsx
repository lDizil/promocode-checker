import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Button } from '@/common/ui/Button/index.ts'
import { CategoryChip } from '@/common/ui/CategoryChip/index.ts'
import { CategoryTile, type CategoryTileProps } from '@/common/ui/CategoryTile/index.ts'
import { icons, type IconGlyph } from '@/common/ui/Icon/index.ts'
import { OfflineBanner } from '@/common/ui/OfflineBanner/index.ts'
import { PromoBlock } from '@/common/ui/PromoBlock/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { Skeleton } from '@/common/ui/Skeleton/index.ts'
import { MerchantTile, MerchantTileSkeleton, useMerchants } from '@/modules/merchant/index.ts'
import { useConnectionStatus } from '@/modules/network/index.ts'
import { OfferCard, OfferCardSkeleton, offerDetailPath, useRecentOffers } from '@/modules/offer/index.ts'
import { SearchAutocomplete } from '@/modules/search/index.ts'

import styles from './home.module.css'

export interface HomePageProps {
  now: Date
  searchSlot?: ReactNode
}

const NUMBER_FORMAT = new Intl.NumberFormat('ru-RU')

interface HeroTileConfig {
  number: string
  title: string
  tone: CategoryTileProps['tone']
  illustration: CategoryTileProps['illustration']
  to: string
}

const HERO_TILES: readonly HeroTileConfig[] = [
  {
    number: '01',
    title: 'Еда и продукты',
    tone: 'light',
    illustration: 'grocery-bag',
    to: '/catalog/food',
  },
  {
    number: '02',
    title: 'Маркет-\nплейсы',
    tone: 'yellow',
    illustration: 'parcel',
    to: '/catalog/marketplaces',
  },
  {
    number: '03',
    title: 'Бесплатно',
    tone: 'purple',
    illustration: 'cloud-coin',
    to: '/catalog/free',
  },
]

interface CategoryChipConfig {
  label: string
  icon: IconGlyph
  to: string
}

const CATEGORY_CHIPS: readonly CategoryChipConfig[] = [
  { label: 'Одежда', icon: icons.Shirt, to: '/catalog/clothing' },
  { label: 'Подписки', icon: icons.BookOpen, to: '/catalog/subscriptions' },
  { label: 'Путешествия', icon: icons.Plane, to: '/catalog/travel' },
  { label: 'Облака и dev', icon: icons.Cloud, to: '/catalog/free/cloud' },
]

/** P-01 «Главная» (DESIGN_SPEC 4.1). */
export function HomePage({ now, searchSlot }: HomePageProps) {
  const online = useConnectionStatus()
  const merchants = useMerchants({ featured: true })
  const recent = useRecentOffers()

  const verifiedToday = NUMBER_FORMAT.format(recent.stats.verifiedToday)
  const merchantsCount = NUMBER_FORMAT.format(recent.stats.merchantsCount)

  return (
    <>
      {!online && <OfflineBanner />}
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="home-hero-title">
          <div className={styles.heroDecor} aria-hidden="true">
            <svg className={styles.heroArc} viewBox="0 0 320 220" fill="none" focusable="false">
              <path
                d="M 16 196 A 170 170 0 0 1 296 28"
                stroke="var(--color-highlight)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className={styles.heroContent}>
            <p className={`${styles.overline} text-overline`}>
              Сегодня проверено {verifiedToday} кодов в {merchantsCount} магазинах
            </p>
            <h1 id="home-hero-title" className={`${styles.heroTitle} text-display`}>
              Промокоды, которые правда работают
            </h1>
            <p className={`${styles.heroSubtitle} text-body`}>
              Проверяем коды и показываем условия до того, как вы откроете корзину
            </p>
            <div className={styles.heroActions}>
              <div className={styles.heroSearch}>{searchSlot ?? <SearchAutocomplete variant="boxed" size="lg" />}</div>
              <Button
                className={styles.allMerchantsBtn}
                variant="primary"
                size="lg"
                external
                render={<Link to="/catalog" />}
              >
                Все магазины
              </Button>
            </div>
          </div>

          <div className={styles.heroTiles}>
            {HERO_TILES.map((tile) => (
              <CategoryTile
                key={tile.number}
                number={tile.number}
                title={tile.title}
                tone={tile.tone}
                illustration={tile.illustration}
                render={<Link to={tile.to} />}
              />
            ))}
          </div>
        </section>

        <div className={styles.body}>
          <div className={styles.columns}>
            <div className={styles.mainColumn}>
              <section className={styles.section} aria-labelledby="home-merchants-title">
                <SectionHeader
                  id="home-merchants-title"
                  title="Магазины и сервисы"
                  action={<Link to={'/catalog' as string}>Все</Link>}
                />
                <ul className={styles.merchantsGrid}>
                  {merchants.slice(0, 12).map((merchant) => (
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

              <section className={styles.section} aria-labelledby="home-categories-title">
                <SectionHeader
                  id="home-categories-title"
                  title="Категории"
                  action={<Link to={'/catalog' as string}>Все</Link>}
                />
                <ul className={styles.categoriesRow}>
                  {CATEGORY_CHIPS.map((chip) => (
                    <li key={chip.to}>
                      <CategoryChip icon={chip.icon} render={<Link to={chip.to} />}>
                        {chip.label}
                      </CategoryChip>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className={styles.recentColumn} aria-labelledby="home-recent-title">
              <SectionHeader
                id="home-recent-title"
                title="Проверено сегодня"
                action={<Link to={'/catalog' as string}>Все</Link>}
              />
              <div className={styles.recentGroups}>
                {recent.justNow.length > 0 && (
                  <div className={styles.recentGroup}>
                    <h3 className={`${styles.groupHeading} text-caption`}>Только что</h3>
                    <ul className={styles.recentList}>
                      {recent.justNow.map((offer) => (
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
                  </div>
                )}

                {recent.earlierToday.length > 0 && (
                  <div className={styles.recentGroup}>
                    <h3 className={`${styles.groupHeading} text-caption`}>Сегодня утром</h3>
                    <ul className={styles.recentList}>
                      {recent.earlierToday.map((offer) => (
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
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className={styles.mobilePromo}>
            <PromoBlock actionRender={<Link to="/submit" />} />
          </div>
        </div>
      </main>
    </>
  )
}

/** P-01 `loading` skeleton for route pendingComponent. */
export function HomePageSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Загрузка главной страницы">
      <Skeleton height={280} />
      <div className={styles.body}>
        <div className={styles.columns}>
          <div className={styles.mainColumn}>
            <div className={styles.section}>
              <Skeleton width={220} height={28} />
              <ul className={styles.merchantsGrid}>
                {Array.from({ length: 12 }, (_, index) => (
                  <li key={index}>
                    <MerchantTileSkeleton />
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={styles.recentColumn}>
            <Skeleton width={200} height={28} />
            <ul className={styles.recentList}>
              {[0, 1, 2, 3].map((index) => (
                <li key={index}>
                  <OfferCardSkeleton density="compact" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
