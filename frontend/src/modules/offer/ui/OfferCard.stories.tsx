import { faker } from '@faker-js/faker'
import { expect, fn } from 'storybook/test'

import preview, { STORY_NOW } from '#.storybook/preview'

import { makeOfferDto, samokatOffers } from '../api/offer.mocks.ts'
import { toOffer } from '../model/offer.ts'
import { OfferCard } from './OfferCard.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const offers = samokatOffers(STORY_NOW).map(toOffer)
const [o1, o2, o3, o4, o5] = offers

faker.seed(11)
const freeOffer = toOffer(
  makeOfferDto(faker, STORY_NOW, {
    type: 'free_credit',
    merchant: { slug: 'yandex-cloud', name: 'Yandex Cloud', logo_url: null },
    title: 'Кредит на 60 дней',
    code: null,
    value: { amount: 4000, currency: 'RUB', kind: 'credit', duration_days: 60, label: null },
    conditions: {
      min_order: null,
      categories_include: [],
      categories_exclude: [],
      customer_type: 'all',
      stackable_with: [],
      platform: 'both',
      region_allow: [],
      region_deny: [],
      requirements: ['card'],
    },
    availability: { status: 'yes', reason: null },
    after_end: 'После 60 дней — платно',
    gotchas: ['Не тратится на GPU и Marketplace'],
    source: { kind: 'official_page', name: null, url: 'https://yandex.cloud/' },
    verification: {
      last_checked_at: '2026-11-11T10:00:00+03:00',
      method: 'manual',
      score: null,
      success_7d: 0,
      fail_7d: 0,
    },
    lifecycle: 'active',
  }),
)

faker.seed(12)
const unavailableOffer = toOffer(
  makeOfferDto(faker, STORY_NOW, {
    type: 'free_tier',
    merchant: { slug: 'aws', name: 'AWS', logo_url: null },
    title: 'Кредит до $200 на 6 месяцев',
    code: null,
    value: { amount: 200, currency: 'USD', kind: 'credit', duration_days: null, label: null },
    availability: { status: 'no', reason: 'регистрация закрыта с 03.2022' },
    conditions: {
      min_order: null,
      categories_include: [],
      categories_exclude: [],
      customer_type: 'all',
      stackable_with: [],
      platform: 'both',
      region_allow: [],
      region_deny: [],
      requirements: ['foreign_card', 'phone'],
    },
    source: { kind: 'official_page', name: null, url: 'https://aws.amazon.com/' },
    verification: {
      last_checked_at: '2026-11-08T10:00:00+03:00',
      method: 'manual',
      score: null,
      success_7d: 0,
      fail_7d: 0,
    },
  }),
)

faker.seed(13)
const manyConditionsOffer = toOffer(
  makeOfferDto(faker, STORY_NOW, {
    conditions: {
      min_order: 2500,
      categories_include: [],
      categories_exclude: [],
      customer_type: 'new',
      stackable_with: [],
      platform: 'app',
      region_allow: [],
      region_deny: [],
      requirements: ['card', 'phone', 'kyc'],
    },
    gotchas: [
      'Не суммируется с баллами',
      'Не действует на алкоголь',
      'Только для Москвы',
      'Один код на аккаунт',
      'Не действует в праздники',
      'Только на первый заказ в приложении',
      'Не суммируется с подпиской',
      'Не действует на товары по акции',
    ],
    expires_at: '2026-11-18T23:59:59+03:00',
    ad_marking: { advertiser: 'ООО «Самокат»', inn: '0000000000', erid: '2VtzqvXYZ12' },
  }),
)

faker.seed(14)
const longOffer = toOffer(
  makeOfferDto(faker, STORY_NOW, {
    merchant: {
      slug: 'long-merchant',
      name: 'Яндекс Маркет и ещё очень длинное название магазина, которое не влезает в строку',
      logo_url: null,
    },
    title: 'Очень длинное название оффера, которое должно переноситься на несколько строк и не ломать карточку',
    code: 'VERYLONGPROMOCODEWITHOUTBREAKS2026',
  }),
)

faker.seed(15)
const noScoreOffer = toOffer(
  makeOfferDto(faker, STORY_NOW, {
    verification: {
      last_checked_at: '2026-11-16T11:00:00+03:00',
      method: 'crowd',
      score: null,
      success_7d: 0,
      fail_7d: 0,
    },
  }),
)

const feedbackSlot = <span className="text-body-sm">Сработал? Да · Нет</span>

const meta = preview.meta({
  title: 'Offer/OfferCard',
  component: OfferCard,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    offer: o1!,
    now: STORY_NOW,
    context: 'merchant' as const,
    density: 'full' as const,
    copied: false,
    onCopy: fn(),
    feedbackSlot,
  },
})

export const MerchantFull = meta.story({
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {offers.map((offer) => (
        <OfferCard {...args} key={offer.id} offer={offer} />
      ))}
    </div>
  ),
})

export const MerchantO1 = meta.story({ args: { offer: o1! } })
export const MerchantO2 = meta.story({ args: { offer: o2! } })
export const MerchantO3 = meta.story({ args: { offer: o3! } })
export const MerchantO4 = meta.story({ args: { offer: o4! } })
export const MerchantO5 = meta.story({ args: { offer: o5! } })

export const FeedFull = meta.story({
  args: { context: 'feed' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <OfferCard {...args} offer={o1!} />
      <OfferCard
        {...args}
        offer={o3!}
        detailsLink={
          <a href="#offer-details" aria-label="Подробнее об оффере">
            →
          </a>
        }
      />
    </div>
  ),
})

export const Compact = meta.story({
  args: { density: 'compact' },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      <OfferCard {...args} offer={o1!} />
      <OfferCard {...args} offer={o2!} context="feed" />
      <OfferCard {...args} offer={o4!} />
      <OfferCard {...args} offer={o5!} />
      <OfferCard {...args} offer={freeOffer} context="feed" />
    </div>
  ),
})

export const Free = meta.story({ args: { offer: freeOffer, context: 'feed' } })

export const Low = meta.story({ args: { offer: o4! } })

export const Ended = meta.story({ args: { offer: o5! } })

export const Copied = meta.story({ args: { offer: o1!, copied: true } })

export const AdLabel = meta.story({ args: { offer: o1!, context: 'feed' } })

export const FreeUnavailable = meta.story({ args: { offer: unavailableOffer, context: 'feed' } })

export const NoScore = meta.story({ args: { offer: noScoreOffer, context: 'feed' } })

export const ManyConditions = meta.story({ args: { offer: manyConditionsOffer, context: 'feed' } })

export const LongText = meta.story({ args: { offer: longOffer, context: 'feed' } })

export const CopyAndExpand = meta.story({
  args: { offer: o1!, context: 'merchant', onCopy: fn() },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Промокод/ }))
    await expect(args.onCopy).toHaveBeenCalledTimes(1)

    await userEvent.click(canvas.getByRole('button', { name: '+1 условие' }))
    await expect(canvas.getByText('Только в приложении')).toBeVisible()
  },
})
