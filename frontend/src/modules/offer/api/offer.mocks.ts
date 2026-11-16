import type { Faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'

import type { OfferDto } from './offer.dto.ts'

const HOUR = 60 * 60 * 1000
const ago = (now: Date, ms: number) => new Date(now.getTime() - ms).toISOString()

const SAMOKAT = { slug: 'samokat', name: 'Самокат', logo_url: null }

const base = (now: Date): Omit<OfferDto, 'id' | 'title' | 'code' | 'value'> => ({
  type: 'promo_code',
  merchant: SAMOKAT,
  description_short: null,
  conditions: {
    min_order: null,
    categories_include: [],
    categories_exclude: [],
    customer_type: 'all',
    stackable_with: [],
    platform: 'both',
    region_allow: [],
    region_deny: [],
    requirements: [],
  },
  availability: null,
  starts_at: null,
  expires_at: null,
  ended_at: null,
  after_end: null,
  gotchas: [],
  source: { kind: 'partner_api', name: 'Admitad', url: null },
  target_url: 'https://samokat.ru/',
  ad_marking: null,
  verification: { last_checked_at: ago(now, 2 * HOUR), method: 'api', score: 80, success_7d: 10, fail_7d: 2 },
  lifecycle: 'active',
})

const value = (amount: number, kind: OfferDto['value']['kind'] = 'fixed', label: string | null = null) => ({
  amount,
  currency: kind === 'percent' ? null : 'RUB',
  kind,
  duration_days: null,
  label,
})

/** Offers O1–O5 from DESIGN_SPEC 2.2, relative to `now` so «2 ч назад» stays true. */
export function samokatOffers(now: Date): OfferDto[] {
  const b = base(now)
  return [
    {
      ...b,
      id: 'o1',
      title: 'Скидка на первый заказ',
      code: 'SAMOKAT300',
      value: value(300),
      conditions: { ...b.conditions, min_order: 1500, customer_type: 'new', platform: 'app' },
      expires_at: '2026-11-30T23:59:59+03:00',
      ad_marking: { advertiser: 'ООО «Самокат»', inn: '0000000000', erid: '2VtzqvXYZ12' },
      verification: { last_checked_at: ago(now, 2 * HOUR), method: 'api', score: 86, success_7d: 41, fail_7d: 6 },
    },
    {
      ...b,
      id: 'o2',
      title: 'Скидка на готовую еду',
      code: 'VKUSNO15',
      value: value(15, 'percent'),
      conditions: { ...b.conditions, min_order: 2000, categories_include: ['Готовая еда'] },
      expires_at: '2026-11-20T23:59:59+03:00',
      source: { kind: 'user_submission', name: null, url: null },
      verification: { last_checked_at: ago(now, 26 * HOUR), method: 'crowd', score: 58, success_7d: 7, fail_7d: 5 },
    },
    {
      ...b,
      id: 'o3',
      type: 'sale',
      title: 'Молочные продукты по вторникам',
      code: null,
      value: value(0, 'fixed', '2 по цене 1'),
      expires_at: '2026-12-31T23:59:59+03:00',
      source: { kind: 'official_page', name: null, url: 'https://samokat.ru/promo' },
      verification: { last_checked_at: ago(now, 5 * HOUR), method: 'manual', score: 74, success_7d: 12, fail_7d: 3 },
    },
    {
      ...b,
      id: 'o4',
      title: 'Скидка на большой заказ',
      code: 'SAMO500',
      value: value(500),
      conditions: { ...b.conditions, min_order: 3000 },
      source: { kind: 'user_submission', name: null, url: null },
      verification: { last_checked_at: ago(now, 72 * HOUR), method: 'crowd', score: 22, success_7d: 3, fail_7d: 11 },
    },
    {
      ...b,
      id: 'o5',
      title: 'Осенняя скидка',
      code: 'AUTUMN200',
      value: value(200),
      ended_at: '2026-11-01T00:00:00+03:00',
      verification: { last_checked_at: null, method: null, score: null, success_7d: 0, fail_7d: 0 },
      lifecycle: 'ended',
    },
  ]
}

/** Random but seedable offer; pass a faker seeded per story so screenshots stay stable. */
export function makeOfferDto(faker: Faker, now: Date, overrides: Partial<OfferDto> = {}): OfferDto {
  const success = faker.number.int({ min: 0, max: 60 })
  const fail = faker.number.int({ min: 0, max: 20 })
  return {
    ...base(now),
    id: faker.string.alphanumeric(8),
    title: faker.commerce.productName(),
    code: faker.string.alphanumeric({ length: 8, casing: 'upper' }),
    value: value(faker.number.int({ min: 1, max: 20 }) * 100),
    verification: {
      last_checked_at: ago(now, faker.number.int({ min: 1, max: 240 }) * 60_000),
      method: faker.helpers.arrayElement(['api', 'crowd', 'manual']),
      score: faker.number.int({ min: 0, max: 100 }),
      success_7d: success,
      fail_7d: fail,
    },
    ...overrides,
  }
}

export const offerHandlers = [
  http.get('*/api/merchants/:slug/offers', ({ params }) => {
    const items = params['slug'] === 'samokat' ? samokatOffers(new Date()) : []
    return HttpResponse.json({ items, total: items.length })
  }),
  http.get('*/api/offers/:id', ({ params }) => {
    const offer = samokatOffers(new Date()).find((item) => item.id === params['id'])
    return offer ? HttpResponse.json(offer) : HttpResponse.json({ message: 'Not found' }, { status: 404 })
  }),
]
