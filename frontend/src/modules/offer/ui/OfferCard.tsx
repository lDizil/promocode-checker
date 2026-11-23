import { cloneElement, type ReactElement, type ReactNode } from 'react'

import { Button } from '@/common/ui/Button/index.ts'
import { Icon, type IconGlyph } from '@/common/ui/Icon/Icon.tsx'
import { icons } from '@/common/ui/Icon/index.ts'
import { Tag, type TagTone } from '@/common/ui/Tag/index.ts'
import { MerchantAvatar } from '@/modules/merchant/index.ts'

import { buildConditions } from '../model/conditions.ts'
import { formatAgo, formatDate, formatHeadline, formatVerificationMethod } from '../model/format.ts'
import { scoreLevel, type Offer, type SourceKind } from '../model/offer.ts'
import { AdLabel } from './AdLabel.tsx'
import { AvailabilityBadge } from './AvailabilityBadge.tsx'
import { CodeBox } from './CodeBox.tsx'
import { ConditionList } from './ConditionList.tsx'
import { ScoreBadge } from './ScoreBadge.tsx'
import { ScoreBar } from './ScoreBar.tsx'
import { SourceLink } from './SourceLink.tsx'
import styles from './OfferCard.module.css'

const MECHANIC: Record<Exclude<Offer['kind'], 'code'>, { icon: IconGlyph; text: string }> = {
  sale: { icon: icons.Percent, text: 'Скидка применится автоматически в корзине' },
  cashback: { icon: icons.Wallet, text: 'Кешбэк вернётся в течение 30 дней' },
  free: { icon: icons.Gift, text: 'Грант начислят после привязки платёжного аккаунта' },
}

const FREE_TYPE: Record<Offer['type'], string> = {
  promo_code: 'Промокод',
  sale: 'Акция',
  cashback: 'Кешбэк',
  free_credit: 'Кредит',
  free_tier: 'Бесплатный тариф',
  trial: 'Пробный период',
  student: 'Студентам',
  startup: 'Стартапам',
}

const SOURCE_TAG: Record<SourceKind, { tone: TagTone; label: string }> = {
  partner_api: { tone: 'partner', label: 'Партнёр' },
  official_page: { tone: 'merchant', label: 'Магазин' },
  partner_channel: { tone: 'partner', label: 'Партнёр' },
  user_submission: { tone: 'user', label: 'Пользователь' },
}

const AVAILABILITY_SHORT = {
  yes: 'Доступно из РФ',
  partial: 'Из РФ — с ограничениями',
  no: 'Недоступно из РФ',
} as const

const REQUIREMENT_SHORT: Record<Offer['conditions']['requirements'][number], string> = {
  card: 'нужна карта РФ',
  foreign_card: 'нужна зарубежная карта',
  phone: 'нужен телефон',
  kyc: 'нужна верификация',
  corporate_domain: 'нужна корпоративная почта',
  student_status: 'нужен статус студента',
}

export interface OfferCardProps {
  offer: Offer
  now: Date
  /** `merchant` hides the merchant row, `feed` shows avatar plus name (DESIGN_SPEC 3.20). */
  context?: 'merchant' | 'feed'
  density?: 'full' | 'compact'
  /** CodeBox state comes from `useCopyCode().copiedId`. */
  copied?: boolean
  onCopy: () => void
  /** FeedbackBar, assembled by the page; hidden for ended offers. */
  feedbackSlot?: ReactNode
  /** Icon-only «Подробнее» (e.g. IconButton with a router Link render); full density only. */
  detailsLink?: ReactElement
  /** Optional router Link element for clickable compact cards (stretched across the card via CSS). */
  linkRender?: ReactElement<{ className?: string; children?: ReactNode }>
}

/** DESIGN_SPEC 3.20: one card for codes, sales, cashback and free offers. */
export function OfferCard({
  offer,
  now,
  context = 'feed',
  density = 'full',
  copied = false,
  onCopy,
  feedbackSlot,
  detailsLink,
  linkRender,
}: OfferCardProps) {
  const level = scoreLevel(offer)
  const isFree = offer.kind === 'free'
  const headline = formatHeadline(offer)
  const sourceTag = SOURCE_TAG[offer.source.kind]
  const tag = isFree ? { tone: 'success' as TagTone, label: 'Официально' } : sourceTag
  const checkedAt = offer.verification.lastCheckedAt
  const totalReviews = offer.verification.success7d + offer.verification.fail7d
  const meta = isFree
    ? [FREE_TYPE[offer.type], checkedAt ? `проверено ${formatDate(checkedAt)}` : 'ещё не проверен'].join(' · ')
    : [
        checkedAt ? `Проверено ${formatAgo(checkedAt, now)}` : 'Ещё не проверен',
        formatVerificationMethod(offer.verification.method),
      ]
        .filter(Boolean)
        .join(' · ')
  const endedDate = offer.endedAt ?? offer.expiresAt

  if (density === 'compact') {
    const requirement = offer.conditions.requirements[0]
    const compactMeta = isFree
      ? [
          AVAILABILITY_SHORT[offer.availability?.status ?? 'yes'],
          requirement ? REQUIREMENT_SHORT[requirement] : null,
          checkedAt ? formatDate(checkedAt) : null,
        ]
      : offer.isEnded
        ? [offer.code ?? headline, endedDate ? `завершён ${formatDate(endedDate)}` : 'завершён']
        : [
            offer.code ?? headline,
            offer.verification.score === null ? 'ещё не проверен' : `шанс ${offer.verification.score}`,
            checkedAt ? formatAgo(checkedAt, now) : null,
          ]

    const valueNode = linkRender
      ? cloneElement(
          linkRender,
          { className: [styles.compactLink, linkRender.props.className].filter(Boolean).join(' ') },
          headline,
        )
      : headline

    return (
      <article className={styles.root} data-density="compact" data-ended={offer.isEnded || undefined}>
        <div className={styles.compactHead}>
          <div className={styles.compactMerchantRow}>
            <MerchantAvatar name={offer.merchant.name} logoUrl={offer.merchant.logoUrl} size={24} />
            <span className={`text-title ${styles.compactMerchant}`}>{offer.merchant.name}</span>
          </div>
          {offer.adMarking && (
            <div className={styles.compactAd}>
              <AdLabel marking={offer.adMarking} />
            </div>
          )}
        </div>
        <p className={`text-title ${styles.compactValue}`}>{valueNode}</p>
        <div className={styles.compactFoot}>
          <p className={`text-body-sm ${styles.compactMeta}`}>{compactMeta.filter(Boolean).join(' · ')}</p>
          <Tag tone={tag.tone}>{tag.label}</Tag>
        </div>
      </article>
    )
  }

  return (
    <article
      className={styles.root}
      data-density="full"
      data-context={context}
      data-ended={offer.isEnded || undefined}
      data-level={level}
    >
      {(context === 'feed' || offer.adMarking) && (
        <div className={styles.header} data-merchant-hidden={context === 'merchant' || undefined}>
          {context === 'feed' && (
            <div className={styles.merchant}>
              <MerchantAvatar name={offer.merchant.name} logoUrl={offer.merchant.logoUrl} size={32} />
              <span className={`text-title ${styles.merchantName}`}>{offer.merchant.name}</span>
            </div>
          )}
          {offer.adMarking && (
            <div className={styles.ad}>
              <AdLabel marking={offer.adMarking} />
            </div>
          )}
        </div>
      )}

      {level === 'low' && (
        <p className={styles.lowBanner}>
          Много жалоб за неделю: {offer.verification.fail7d} из {totalReviews} не сработали
        </p>
      )}

      <p className={`text-value ${styles.value}`}>{headline}</p>

      {offer.kind === 'code' ? (
        <CodeBox
          code={offer.code ?? ''}
          state={offer.isEnded ? 'disabled' : copied ? 'copied' : 'default'}
          onCopy={onCopy}
        />
      ) : (
        !offer.isEnded && (
          <div className={styles.mechanicBlock}>
            <p className={styles.mechanic}>
              <Icon icon={MECHANIC[offer.kind].icon} size={16} />
              <span className="text-body-sm">{offer.mechanicText ?? MECHANIC[offer.kind].text}</span>
            </p>
            <Button
              variant="secondary"
              block
              external
              render={<a href={offer.targetUrl} target="_blank" rel="noreferrer" />}
            >
              {isFree
                ? offer.availability?.status === 'no'
                  ? 'Подробнее об условиях'
                  : 'Получить на сайте'
                : 'Перейти в магазин'}
            </Button>
          </div>
        )
      )}

      <div className={styles.trust}>
        {isFree ? (
          <AvailabilityBadge
            availability={offer.availability?.status ?? 'yes'}
            reason={offer.availability?.reason ?? null}
          />
        ) : (
          <>
            <ScoreBadge level={level} score={offer.verification.score} />
            {!offer.isEnded && offer.verification.score !== null && (
              <ScoreBar
                level={level}
                score={offer.verification.score}
                success7d={offer.verification.success7d}
                fail7d={offer.verification.fail7d}
              />
            )}
          </>
        )}
      </div>

      <div className={styles.metaRow}>
        <p className={`text-caption ${styles.meta}`}>{meta}</p>
        <Tag tone={tag.tone}>{tag.label}</Tag>
      </div>

      <ConditionList columns={context === 'merchant' ? 1 : 2} conditions={buildConditions(offer, now)} />

      <footer className={styles.footer}>
        {offer.isEnded ? (
          <p className={`text-caption ${styles.endedText}`}>
            {endedDate ? `Завершён ${formatDate(endedDate)}` : 'Завершён'}
          </p>
        ) : (
          feedbackSlot && <div className={styles.feedback}>{feedbackSlot}</div>
        )}
        <div className={styles.footerMeta}>
          <div className={styles.source}>
            <SourceLink source={offer.source} />
          </div>
          {detailsLink && <div className={styles.details}>{detailsLink}</div>}
        </div>
      </footer>
    </article>
  )
}
