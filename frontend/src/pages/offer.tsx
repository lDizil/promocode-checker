import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'

import { plural, type PluralForms } from '@/common/plural.ts'
import { AnchorNav, type AnchorNavItem } from '@/common/ui/AnchorNav/index.ts'
import { BackLink } from '@/common/ui/BackLink/index.ts'
import { Button } from '@/common/ui/Button/index.ts'
import { GotchaNote } from '@/common/ui/GotchaNote/index.ts'
import { Icon, icons } from '@/common/ui/Icon/index.ts'
import { KeyValueGrid, type KeyValueItem } from '@/common/ui/KeyValueGrid/index.ts'
import { OfflineBanner } from '@/common/ui/OfflineBanner/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { Skeleton } from '@/common/ui/Skeleton/index.ts'
import { StatStrip } from '@/common/ui/StatStrip/index.ts'
import { StepList, type StepListItem } from '@/common/ui/StepList/index.ts'
import { Tag } from '@/common/ui/Tag/index.ts'
import { useActiveAnchor } from '@/common/use-active-anchor.ts'
import { MerchantAvatar } from '@/modules/merchant/index.ts'
import { useConnectionStatus } from '@/modules/network/index.ts'
import {
  AdLabel,
  AvailabilityBadge,
  CodeBox,
  formatAgo,
  formatDate,
  formatHeadline,
  formatTime,
  formatValue,
  OfferCard,
  offerDetailPath,
  OfferFeedback,
  RequirementChip,
  ScoreBar,
  scoreLevel,
  useCopyCode,
  useMerchantOffers,
  useOffer,
  useOffers,
  type Offer,
  type OfferAudience,
  type OfferFilters,
  type OfferListParams,
  type OfferType,
} from '@/modules/offer/index.ts'

import styles from './offer.module.css'

export interface OfferPageProps {
  offerId: string
  merchantSlug?: string
  now: Date
}

const EMPTY_FILTERS: OfferFilters = {}
const FREE_LIST_PARAMS: OfferListParams = { category: 'free' }
const NOOP = () => {}

const CATALOG_PATH: string = '/catalog'
const CATALOG_FREE_PATH: string = '/catalog/free'

const RUB_FORMATTER = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Moscow',
})

const DAY_FORMS: PluralForms = { one: 'день', few: 'дня', many: 'дней' }

const DEFAULT_MECHANIC: Record<'sale' | 'cashback', string> = {
  sale: 'Скидка применится автоматически в корзине',
  cashback: 'Кешбэк вернётся в течение 30 дней',
}

const VIA_METHOD: Record<NonNullable<Offer['verification']['method']>, string> = {
  api: 'через партнёрскую сеть',
  cart_test: 'через тест в корзине',
  crowd: 'по отзывам пользователей',
  manual: 'редакцией',
}

const PLATFORM_LABEL: Record<Offer['conditions']['platform'], string> = {
  app: 'Только в мобильном приложении',
  web: 'Только на сайте',
  both: 'На сайте и в приложении',
}

const CUSTOMER_LABEL: Record<Offer['conditions']['customerType'], { text: string; warning: boolean }> = {
  new: { text: 'Только первый заказ', warning: true },
  existing: { text: 'Только для постоянных клиентов', warning: true },
  all: { text: 'Для всех покупателей', warning: false },
}

const FREE_SUBCATEGORIES: Record<string, string> = {
  'free/cloud': 'Облака и VPS',
  'free/ai': 'ИИ-модели и API',
  'free/hosting': 'Хостинг',
  'free/tools': 'Инструменты',
  'free/students': 'Студентам',
}

const FREE_TYPE_LABEL: Partial<Record<OfferType, string>> = {
  free_credit: 'Кредит',
  free_tier: 'Бесплатный тариф',
  trial: 'Пробный период',
  student: 'Студентам',
  startup: 'Стартапам',
}

const AUDIENCE_LABEL: Record<OfferAudience, string> = {
  individual: 'Физлица',
  student: 'Студенты',
  business: 'Юрлица',
}

const AUDIENCE_LIST = new Intl.ListFormat('ru-RU', { style: 'long', type: 'conjunction' })

function formatRub(amount: number): string {
  return RUB_FORMATTER.format(amount)
}

function formatShortDate(date: Date): string {
  return SHORT_DATE_FORMATTER.format(date)
}

function formatDurationDays(days: number): string {
  return `${days} ${plural(days, DAY_FORMS)}`
}

function formatSourceSummary(source: Offer['source']): string {
  switch (source.kind) {
    case 'partner_api':
      return `Партнёрская сеть${source.name ? ` ${source.name}` : ''}`
    case 'partner_channel':
      return `Канал-партнёр${source.name ? ` @${source.name.replace(/^@/, '')}` : ''}`
    case 'official_page':
      return source.name ?? 'Сайт магазина'
    case 'user_submission':
      return 'Прислал пользователь'
  }
}

function pickSimilarFreeOffers(offers: readonly Offer[], current: Offer): Offer[] {
  const active = offers.filter((item) => item.id !== current.id && !item.isEnded)
  const available = active.filter((item) => item.availability?.status !== 'no')
  const unavailable = active.filter((item) => item.availability?.status === 'no')
  return [...available, ...unavailable].slice(0, 2)
}

function buildConditionItems(offer: Offer): KeyValueItem[] {
  const { conditions } = offer
  const customer = CUSTOMER_LABEL[conditions.customerType]

  const items: KeyValueItem[] = [
    { label: 'Для кого', value: customer.text, warning: customer.warning },
    {
      label: 'Минимальная сумма',
      value: conditions.minOrder !== null ? formatRub(conditions.minOrder) : 'Без ограничений',
      warning: conditions.minOrder !== null,
    },
    {
      label: 'Суммируется',
      value:
        conditions.stackableWith.length > 0
          ? `Суммируется: ${conditions.stackableWith.join(', ')}`
          : 'Не суммируется с баллами и другими скидками',
      warning: conditions.stackableWith.length === 0,
    },
    { label: 'Где применить', value: PLATFORM_LABEL[conditions.platform] },
    { label: 'Регион', value: 'Вся Россия' },
    {
      label: 'Срок',
      value: offer.expiresAt ? `До ${formatDate(offer.expiresAt)}` : (offer.afterEnd ?? 'Бессрочно'),
    },
  ]

  if (conditions.categoriesInclude.length > 0) {
    items.push({ label: 'Действует на', value: conditions.categoriesInclude.join(', '), warning: true })
  }
  if (conditions.categoriesExclude.length > 0) {
    items.push({ label: 'Не действует на', value: conditions.categoriesExclude.join(', '), warning: true })
  }
  if (offer.gotchas.length > 0) {
    items.push({ label: 'Ограничения', value: offer.gotchas.join('; '), warning: true })
  }

  return items
}

function buildSourceItems(offer: Offer): KeyValueItem[] {
  const summary = formatSourceSummary(offer.source)
  const sourceValue = offer.source.url ? (
    <a className={styles.inlineLink} href={offer.source.url} target="_blank" rel="noreferrer">
      <span>{summary}</span>
      <Icon icon={icons.ExternalLink} size={12} />
    </a>
  ) : (
    summary
  )

  const items: KeyValueItem[] = [{ label: 'Источник', value: sourceValue }]

  if (offer.adMarking) {
    items.push(
      { label: 'Рекламодатель', value: `${offer.adMarking.advertiser}, ИНН ${offer.adMarking.inn}` },
      { label: 'erid', value: offer.adMarking.erid },
    )
  }

  return items
}

function buildHistorySteps(offer: Offer): StepListItem[] {
  return offer.history.map((item) => ({
    title: item.title,
    description: item.description ?? undefined,
    state: item.state,
    icon:
      item.state === 'current'
        ? icons.ShieldCheck
        : item.title.toLowerCase().includes('измен')
          ? icons.TriangleAlert
          : icons.Plus,
  }))
}

function isRestrictiveRule(rule: string): boolean {
  return /только\s+нов/i.test(rule)
}

function isPaidAfterEnd(afterEnd: string): boolean {
  return !/бесплатно\s+бессрочно/i.test(afterEnd)
}

function buildEligibilityItems(offer: Offer): KeyValueItem[] {
  if (offer.eligibility) {
    const items: KeyValueItem[] = [
      { label: 'Регион', value: offer.eligibility.region },
      { label: 'Тип лица', value: offer.eligibility.accountType },
      {
        label: 'Аккаунт',
        value: offer.eligibility.accountRule,
        warning: isRestrictiveRule(offer.eligibility.accountRule),
      },
      { label: 'Срок', value: offer.eligibility.duration },
    ]
    if (offer.afterEnd) {
      items.push({
        label: 'После окончания',
        value: offer.afterEnd,
        warning: isPaidAfterEnd(offer.afterEnd),
      })
    }
    return items
  }

  const availabilityStatus = offer.availability?.status ?? 'yes'
  const regionText =
    availabilityStatus === 'no'
      ? (offer.availability?.reason ?? 'Недоступно из РФ')
      : availabilityStatus === 'partial'
        ? (offer.availability?.reason ?? 'Доступно из РФ с ограничениями')
        : 'Доступно из РФ'

  const audienceText =
    offer.audience.length > 0 ? AUDIENCE_LIST.format(offer.audience.map((item) => AUDIENCE_LABEL[item])) : 'Все'

  const durationText = offer.value.durationDays
    ? formatDurationDays(offer.value.durationDays)
    : offer.expiresAt
      ? `До ${formatDate(offer.expiresAt)}`
      : 'Без ограничения срока'

  const items: KeyValueItem[] = [
    { label: 'Регион', value: regionText, warning: availabilityStatus !== 'yes' },
    { label: 'Тип лица', value: audienceText },
    { label: 'Срок', value: durationText },
  ]

  if (offer.afterEnd) {
    items.push({
      label: 'После окончания',
      value: offer.afterEnd,
      warning: isPaidAfterEnd(offer.afterEnd),
    })
  }

  return items
}

function splitGotcha(text: string): { title?: string; body: string } {
  const index = text.indexOf(': ')
  if (index > 0 && !text.slice(0, index).includes('http')) {
    return { title: text.slice(0, index), body: text.slice(index + 2) }
  }
  return { body: text }
}

interface RelatedOffersSectionProps {
  id?: string
  headingId: string
  title: string
  action: ReactNode
  offers: readonly Offer[]
  now: Date
  className?: string
}

function RelatedOffersSection({ id, headingId, title, action, offers, now, className }: RelatedOffersSectionProps) {
  if (offers.length === 0) return null

  return (
    <section id={id} aria-labelledby={headingId} className={[styles.section, className].filter(Boolean).join(' ')}>
      <SectionHeader id={headingId} title={title} action={action} />
      <div className={styles.relatedGrid}>
        {offers.map((item) => (
          <OfferCard
            key={item.id}
            offer={item}
            now={now}
            density="compact"
            context="feed"
            onCopy={NOOP}
            linkRender={<Link {...offerDetailPath(item)} />}
          />
        ))}
      </div>
    </section>
  )
}

interface PromoOfferViewProps {
  offer: Offer
  otherOffers: readonly Offer[]
  now: Date
  copied: boolean
  onCopy: () => void
}

/** P-05 «Детальная страница оффера» (DESIGN_SPEC 4.5). */
function PromoOfferView({ offer, otherOffers, now, copied, onCopy }: PromoOfferViewProps) {
  const level = scoreLevel(offer)
  const checkedAt = offer.verification.lastCheckedAt
  const success = offer.verification.success7d
  const total = success + offer.verification.fail7d
  const viaMethod = offer.verification.method ? VIA_METHOD[offer.verification.method] : null
  const topLabel = offer.kind === 'code' ? 'Код' : offer.kind === 'cashback' ? 'Кешбэк' : 'Акция'

  const anchorItems: AnchorNavItem[] = [
    { id: 'top', label: topLabel },
    { id: 'reliability', label: 'Надёжность' },
    { id: 'conditions', label: 'Условия' },
    { id: 'source', label: 'Источник' },
    ...(offer.history.length > 0 ? [{ id: 'history', label: 'История' }] : []),
    ...(!offer.isEnded && otherOffers.length > 0 ? [{ id: 'other', label: 'Другие офферы' }] : []),
  ]
  const activeId = useActiveAnchor(anchorItems.map((item) => item.id))

  const allOffersAction = (
    <Link to="/m/$slug" params={{ slug: offer.merchant.slug }}>
      Все офферы →
    </Link>
  )

  return (
    <main className={styles.page}>
      <section id="top" className={styles.hero} aria-labelledby="offer-headline">
        <div className={styles.navRow}>
          <BackLink render={<Link to="/m/$slug" params={{ slug: offer.merchant.slug }} />}>
            Все коды {offer.merchant.name}
          </BackLink>
        </div>

        <div className={styles.statusRow}>
          {offer.isEnded ? (
            <span className={styles.neutralTag}>
              <span className={styles.neutralDot} aria-hidden="true" />
              Завершён
            </span>
          ) : level === 'low' ? (
            <Tag tone="danger">Много жалоб</Tag>
          ) : level === 'medium' ? (
            <Tag tone="user">{checkedAt ? `Проверен ${formatAgo(checkedAt, now)}` : 'Ещё не проверен'}</Tag>
          ) : level === 'unknown' ? (
            <span className={styles.neutralTag}>
              <span className={styles.neutralDot} aria-hidden="true" />
              Ещё не проверен
            </span>
          ) : (
            <Tag tone="success">{checkedAt ? `Проверен ${formatAgo(checkedAt, now)}` : 'Проверен'}</Tag>
          )}

          {(checkedAt || offer.expiresAt) && (
            <div className={`text-caption ${styles.topMeta}`}>
              {checkedAt && (
                <span>
                  Проверено: {formatDate(checkedAt)}, {formatTime(checkedAt)}
                </span>
              )}
              {offer.expiresAt && <span>Действует до: {formatDate(offer.expiresAt)}</span>}
            </div>
          )}
        </div>

        <div className={styles.brandRow}>
          <Link to="/m/$slug" params={{ slug: offer.merchant.slug }} className={styles.merchantLink}>
            <MerchantAvatar name={offer.merchant.name} logoUrl={offer.merchant.logoUrl} size={48} />
            <span className={`text-title ${styles.merchantName}`}>{offer.merchant.name}</span>
          </Link>
          {offer.adMarking && <AdLabel marking={offer.adMarking} />}
        </div>

        <h1
          id="offer-headline"
          className={`text-display ${styles.headline} ${offer.isEnded ? styles.headlineEnded : ''}`}
        >
          {formatHeadline(offer)}
        </h1>

        {offer.isEnded && (
          <GotchaNote tone="neutral">
            Этот оффер завершён {formatDate(offer.endedAt ?? offer.expiresAt ?? now)}
          </GotchaNote>
        )}

        {offer.kind === 'code' ? (
          <div className={styles.actionRow}>
            <CodeBox
              code={offer.code ?? ''}
              state={offer.isEnded ? 'disabled' : copied ? 'copied' : 'default'}
              onCopy={onCopy}
            />
            {!offer.isEnded && (
              <Button
                variant="primary"
                size="lg"
                external
                render={<a href={offer.targetUrl} target="_blank" rel="noreferrer" />}
              >
                Перейти в {offer.merchant.name}
              </Button>
            )}
          </div>
        ) : (
          (!offer.isEnded || offer.mechanicText) && (
            <div className={styles.mechanicActionRow}>
              <p className={`text-body ${styles.mechanicLine}`}>
                <Icon icon={offer.kind === 'cashback' ? icons.Wallet : icons.Percent} size={16} />
                <span>{offer.mechanicText ?? DEFAULT_MECHANIC[offer.kind === 'cashback' ? 'cashback' : 'sale']}</span>
              </p>
              {!offer.isEnded && (
                <Button
                  variant="primary"
                  size="lg"
                  external
                  render={<a href={offer.targetUrl} target="_blank" rel="noreferrer" />}
                >
                  Перейти в {offer.merchant.name}
                </Button>
              )}
            </div>
          )
        )}

        <div className={styles.statWrap}>
          <StatStrip
            label="Параметры оффера"
            cells={[
              { label: 'Выгода', value: formatValue(offer.value) },
              {
                label: 'Мин. заказ',
                value: offer.conditions.minOrder !== null ? formatRub(offer.conditions.minOrder) : 'Без порога',
              },
              { label: 'Сработал', value: total > 0 ? `${success} из ${total}` : '—' },
              { label: 'Действует до', value: offer.expiresAt ? formatShortDate(offer.expiresAt) : 'Без срока' },
            ]}
          />
        </div>
      </section>

      {offer.isEnded && otherOffers.length > 0 && (
        <RelatedOffersSection
          headingId="ended-active-title"
          title={`Действующие офферы ${offer.merchant.name}`}
          action={allOffersAction}
          offers={otherOffers}
          now={now}
          className={styles.raisedRelated}
        />
      )}

      <div className={styles.bodyGrid}>
        <div className={styles.anchorCol}>
          <AnchorNav items={anchorItems} activeId={activeId} />
        </div>

        <div className={styles.contentCol}>
          <section id="reliability" aria-labelledby="reliability-title" className={styles.section}>
            <SectionHeader
              id="reliability-title"
              title="Надёжность"
              action={<Link to="/about/verification">Почему такой шанс?</Link>}
            />
            <ScoreBar
              variant="segmented"
              level={level}
              score={offer.verification.score}
              success7d={success}
              fail7d={offer.verification.fail7d}
            />
            <div className={styles.metaNotes}>
              <p className={`text-body-sm ${styles.metaNote}`}>
                <Icon
                  icon={checkedAt ? icons.ShieldCheck : icons.CircleHelp}
                  size={16}
                  className={styles.metaNoteIcon}
                />
                <span>
                  {checkedAt
                    ? `Проверено ${formatAgo(checkedAt, now)}${viaMethod ? ` ${viaMethod}` : ''}`
                    : 'Ещё не проверяли'}
                </span>
              </p>
              {offer.failReasons.length > 0 && (
                <p className={`text-body-sm ${styles.metaNote}`}>
                  <Icon icon={icons.TriangleAlert} size={16} className={styles.metaNoteIcon} />
                  <span>
                    Частые причины неудач:{' '}
                    {offer.failReasons.map((item) => `${item.reason} (${item.count})`).join(', ')}
                  </span>
                </p>
              )}
            </div>
          </section>

          <section id="conditions" aria-labelledby="conditions-title" className={styles.section}>
            <SectionHeader id="conditions-title" title="Условия" />
            <KeyValueGrid items={buildConditionItems(offer)} />
          </section>

          {!offer.isEnded && (
            <section aria-label="Отзыв о промокоде" className={styles.feedbackCard}>
              <OfferFeedback key={offer.id} offerId={offer.id} size="md" />
            </section>
          )}

          <section id="source" aria-labelledby="source-title" className={styles.section}>
            <SectionHeader id="source-title" title="Источник и реклама" />
            <KeyValueGrid items={buildSourceItems(offer)} />
          </section>

          {offer.history.length > 0 && (
            <section id="history" aria-labelledby="history-title" className={styles.section}>
              <SectionHeader id="history-title" title="История" />
              <StepList label="История оффера" steps={buildHistorySteps(offer)} />
            </section>
          )}

          {!offer.isEnded && (
            <RelatedOffersSection
              id="other"
              headingId="other-title"
              title={`Другие офферы ${offer.merchant.name}`}
              action={allOffersAction}
              offers={otherOffers}
              now={now}
            />
          )}
        </div>
      </div>
    </main>
  )
}

interface FreeOfferViewProps {
  offer: Offer
  similarOffers: readonly Offer[]
  now: Date
}

/** P-08 «Детальная бесплатного оффера» (DESIGN_SPEC 4.8). */
function FreeOfferView({ offer, similarOffers, now }: FreeOfferViewProps) {
  const availabilityStatus = offer.availability?.status ?? 'yes'
  const unavailable = availabilityStatus === 'no'
  const subLabel = FREE_SUBCATEGORIES[offer.categorySlug]
  const subPath: string = `/catalog/${offer.categorySlug}`
  const typeLabel = FREE_TYPE_LABEL[offer.type]
  const checkedAt = offer.verification.lastCheckedAt
  const sourceName = offer.source.name ?? 'официальная документация'

  const anchorItems: AnchorNavItem[] = [
    { id: 'eligibility', label: 'Кто может получить' },
    { id: 'requirements', label: 'Что нужно' },
    ...(offer.howToGet.length > 0 ? [{ id: 'how-to-get', label: 'Как получить' }] : []),
    ...(offer.gotchas.length > 0 ? [{ id: 'gotchas', label: 'Подвохи' }] : []),
    ...(!offer.isEnded ? [{ id: 'feedback', label: 'Отзывы' }] : []),
  ]
  const activeId = useActiveAnchor(anchorItems.map((item) => item.id))

  const allFreeAction = <Link to={CATALOG_FREE_PATH}>Все бесплатные →</Link>

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="free-offer-headline">
        <nav aria-label="Хлебные крошки" className={`text-body-sm ${styles.breadcrumbs}`}>
          <Link to={CATALOG_PATH} className={styles.crumbLink}>
            <Icon icon={icons.ArrowLeft} size={16} />
            <span>Каталог</span>
          </Link>
          <span className={styles.crumbSep} aria-hidden="true">
            ›
          </span>
          <Link to={CATALOG_FREE_PATH} className={styles.crumbLink}>
            Бесплатно
          </Link>
          {subLabel && (
            <>
              <span className={styles.crumbSep} aria-hidden="true">
                ›
              </span>
              <Link to={subPath} className={styles.crumbLink}>
                {subLabel}
              </Link>
            </>
          )}
          <span className={styles.crumbSep} aria-hidden="true">
            ›
          </span>
          <span className={styles.crumbCurrent} aria-current="page">
            {offer.merchant.name}
          </span>
        </nav>

        <div className={styles.statusRow}>
          <AvailabilityBadge
            availability={availabilityStatus}
            reason={availabilityStatus === 'partial' ? offer.availability?.reason : null}
          />
          <div className={`text-caption ${styles.topMeta}`}>
            <span>{checkedAt ? `Проверено: ${formatDate(checkedAt)}` : 'Ещё не проверено'}</span>
            <span>Источник: {sourceName}</span>
          </div>
        </div>

        <div className={styles.brandRow}>
          <div className={styles.brandIdentity}>
            <MerchantAvatar name={offer.merchant.name} logoUrl={offer.merchant.logoUrl} size={48} />
            <span className={`text-title ${styles.merchantName}`}>
              {offer.merchant.name} · {offer.title}
            </span>
          </div>
          {typeLabel && <span className={styles.typeChip}>{typeLabel}</span>}
        </div>

        <div className={styles.headlineGroup}>
          <h1
            id="free-offer-headline"
            className={`text-display ${styles.headline} ${offer.isEnded ? styles.headlineEnded : ''}`}
          >
            {formatHeadline(offer)}
          </h1>
          {offer.description && <p className={`text-body ${styles.description}`}>{offer.description}</p>}
        </div>

        {unavailable && (
          <div className={styles.dangerBanner} role="note">
            <Icon icon={icons.CircleX} size={16} className={styles.dangerIcon} />
            <p className={styles.bannerText}>
              {offer.availability?.reason
                ? `Недоступно из России: ${offer.availability.reason}`
                : 'Недоступно из России'}
            </p>
          </div>
        )}

        {offer.isEnded && (
          <GotchaNote tone="neutral">Оффер завершён {formatDate(offer.endedAt ?? offer.expiresAt ?? now)}</GotchaNote>
        )}

        {offer.lifecycle === 'changed' && offer.changedNote && (
          <GotchaNote tone="warning" title="Условия изменились">
            {offer.changedNote}
          </GotchaNote>
        )}

        {!offer.isEnded && (
          <div className={styles.freeCta}>
            <Button
              variant={unavailable ? 'secondary' : 'primary'}
              size="lg"
              external
              block
              render={<a href={offer.targetUrl} target="_blank" rel="noreferrer" />}
            >
              {unavailable ? 'Официальная страница' : `Получить на сайте ${offer.merchant.name}`}
            </Button>
          </div>
        )}
      </section>

      {offer.isEnded && similarOffers.length > 0 && (
        <RelatedOffersSection
          headingId="ended-similar-title"
          title="Похожие офферы"
          action={allFreeAction}
          offers={similarOffers}
          now={now}
          className={styles.raisedRelated}
        />
      )}

      <div className={styles.bodyGrid}>
        <div className={styles.anchorCol}>
          <AnchorNav items={anchorItems} activeId={activeId} />
        </div>

        <div className={styles.contentCol}>
          <section id="eligibility" aria-labelledby="eligibility-title" className={styles.section}>
            <SectionHeader id="eligibility-title" title="Кто может получить" />
            <KeyValueGrid items={buildEligibilityItems(offer)} />
          </section>

          <section id="requirements" aria-labelledby="requirements-title" className={styles.section}>
            <SectionHeader id="requirements-title" title="Что нужно" />
            <div className={styles.chipsRow}>
              {offer.conditions.requirements.length > 0 ? (
                offer.conditions.requirements.map((requirement) => (
                  <RequirementChip key={requirement} requirement={requirement} />
                ))
              ) : (
                <RequirementChip requirement="no_card" />
              )}
            </div>
            {offer.eligibility?.requirementsNote && (
              <p className={`text-body-sm ${styles.note}`}>{offer.eligibility.requirementsNote}</p>
            )}
          </section>

          {offer.howToGet.length > 0 && (
            <section id="how-to-get" aria-labelledby="how-to-get-title" className={styles.section}>
              <SectionHeader id="how-to-get-title" title="Как получить" />
              <StepList
                label="Как получить"
                steps={offer.howToGet.map((step) => ({
                  title: step.title,
                  description: step.description ?? undefined,
                }))}
              />
            </section>
          )}

          {offer.gotchas.length > 0 && (
            <section id="gotchas" aria-labelledby="gotchas-title" className={styles.section}>
              <SectionHeader id="gotchas-title" title="Подвохи" />
              <div className={styles.gotchaStack}>
                {offer.gotchas.map((gotcha) => {
                  const { title, body } = splitGotcha(gotcha)
                  return title ? (
                    <GotchaNote key={gotcha} title={title}>
                      {body}
                    </GotchaNote>
                  ) : (
                    <GotchaNote key={gotcha} showTitle={false}>
                      {body}
                    </GotchaNote>
                  )
                })}
              </div>
            </section>
          )}

          <p className={`text-body-sm ${styles.sourceLine}`}>
            <span>{checkedAt ? `Проверено ${formatDate(checkedAt)}` : 'Ещё не проверено'}</span>
            {offer.source.url && (
              <>
                <span aria-hidden="true">·</span>
                <a className={styles.inlineLink} href={offer.source.url} target="_blank" rel="noreferrer">
                  <span>{sourceName}</span>
                  <Icon icon={icons.ArrowUpRight} size={16} />
                </a>
              </>
            )}
          </p>

          {!offer.isEnded && (
            <section id="feedback" aria-label="Отзыв об оффере" className={styles.feedbackCard}>
              <OfferFeedback key={offer.id} offerId={offer.id} mode="free" size="md" />
            </section>
          )}

          {!offer.isEnded && (
            <RelatedOffersSection
              headingId="similar-title"
              title="Похожие офферы"
              action={allFreeAction}
              offers={similarOffers}
              now={now}
            />
          )}
        </div>
      </div>
    </main>
  )
}

function PromoOfferContent({ offer, merchantSlug, now }: { offer: Offer; merchantSlug?: string; now: Date }) {
  const slug = merchantSlug ?? offer.merchant.slug
  const { active, updatedAt } = useMerchantOffers(slug, EMPTY_FILTERS)
  const { copiedId, copy } = useCopyCode()
  const online = useConnectionStatus()
  const otherOffers = active.filter((item) => item.id !== offer.id).slice(0, 2)

  return (
    <>
      {!online && <OfflineBanner since={formatTime(new Date(updatedAt))} />}
      <PromoOfferView
        offer={offer}
        otherOffers={otherOffers}
        now={now}
        copied={copiedId === offer.id}
        onCopy={() => copy(offer)}
      />
    </>
  )
}

function FreeOfferContent({ offer, now }: { offer: Offer; now: Date }) {
  const freeOffers = useOffers(FREE_LIST_PARAMS)
  const online = useConnectionStatus()
  const similarOffers = pickSimilarFreeOffers(freeOffers, offer)

  return (
    <>
      {!online && <OfflineBanner />}
      <FreeOfferView offer={offer} similarOffers={similarOffers} now={now} />
    </>
  )
}

/** P-05 / P-08 «Детальная страница оффера» (DESIGN_SPEC 4.5, 4.8). */
export function OfferPage({ offerId, merchantSlug, now }: OfferPageProps) {
  const offer = useOffer(offerId)
  return offer.kind === 'free' ? (
    <FreeOfferContent offer={offer} now={now} />
  ) : (
    <PromoOfferContent offer={offer} merchantSlug={merchantSlug} now={now} />
  )
}

/** Loading skeleton for P-05 / P-08. */
export function OfferPageSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-label="Загрузка оффера">
      <div className={styles.hero}>
        <Skeleton height={20} width={220} />
        <Skeleton height={48} width={280} />
        <Skeleton height={52} width="72%" />
        <Skeleton height={52} />
        <Skeleton height={88} />
      </div>
      <div className={styles.bodyGrid}>
        <div className={styles.anchorCol}>
          <Skeleton height={180} />
        </div>
        <div className={styles.contentCol}>
          <Skeleton height={120} />
          <Skeleton height={180} />
          <Skeleton height={80} />
        </div>
      </div>
    </main>
  )
}
