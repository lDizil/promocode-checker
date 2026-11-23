import { describe, expect, it } from 'vitest'

import { samokatOffers } from '../api/offer.mocks.ts'
import { buildConditions } from './conditions.ts'
import { activeFilterCount, offerFiltersSearch, viewOffers, type OfferFilters } from './filters.ts'
import {
  formatAgo,
  formatDate,
  formatDayCount,
  formatHeadline,
  formatTime,
  formatVerificationMethod,
} from './format.ts'
import { scoreLevel, sortOffers, toOffer, type Offer } from './offer.ts'

const NOW = new Date('2026-11-16T12:00:00+03:00')
const offers = samokatOffers(NOW).map(toOffer)
const byId = (id: string) => offers.find((offer) => offer.id === id)!
const ids = (filters: OfferFilters, list: readonly Offer[] = offers) =>
  viewOffers(list, filters).active.map((offer) => offer.id)
const variant = (id: string, patch: Partial<Offer>): Offer => ({ ...byId('o3'), id, ...patch })

describe('scoreLevel', () => {
  it('maps score bands and lifecycle from DESIGN_SPEC 3.13', () => {
    expect(['o1', 'o2', 'o4', 'o5'].map((id) => scoreLevel(byId(id)))).toEqual(['high', 'medium', 'low', 'ended'])
    expect(scoreLevel({ isEnded: false, verification: { ...byId('o1').verification, score: null } })).toBe('unknown')
    expect(scoreLevel({ isEnded: false, verification: { ...byId('o1').verification, score: 70 } })).toBe('high')
    expect(scoreLevel({ isEnded: false, verification: { ...byId('o1').verification, score: 69 } })).toBe('medium')
  })
})

describe('sortOffers', () => {
  it('orders P-04 by chance: O1 86, O3 74, O2 58, O4 22, unscored last', () => {
    expect(sortOffers(offers, 'reliable').map((offer) => offer.id)).toEqual(['o1', 'o3', 'o2', 'o4', 'o5'])
  })
})

describe('viewOffers', () => {
  it('matches each offer kind individually and leaves free offers to the unfiltered list', () => {
    const cashback = variant('cashback', { type: 'cashback', kind: 'cashback', code: null })
    const free = variant('free', { type: 'free_tier', kind: 'free', code: null })
    const list = [...offers.filter((offer) => !offer.isEnded), cashback, free]

    expect(ids({ kinds: ['code'] }, list)).toEqual(['o1', 'o2', 'o4'])
    expect(ids({ kinds: ['sale'] }, list)).toEqual(['o3'])
    expect(ids({ kinds: ['cashback'] }, list)).toEqual(['cashback'])
    expect(ids({ kinds: ['code', 'sale'] }, list)).toEqual(['o1', 'o3', 'o2', 'o4'])
    expect(ids({ kinds: [] }, list)).toEqual(ids({}, list))
    expect(ids({}, list)).toContain('free')
  })

  it('keeps offers whose minimum order fits the basket, null minimums included', () => {
    expect(ids({ amount: 0 })).toEqual(['o3'])
    expect(ids({ amount: 1499 })).toEqual(['o3'])
    expect(ids({ amount: 1500 })).toEqual(['o1', 'o3'])
    expect(ids({ amount: 2000 })).toEqual(['o1', 'o3', 'o2'])
    expect(ids({ amount: 3000 })).toEqual(['o1', 'o3', 'o2', 'o4'])
  })

  it('keeps only known scores of 40 and above for reliableOnly', () => {
    const at40 = variant('at40', { verification: { ...byId('o3').verification, score: 40 } })
    const at39 = variant('at39', { verification: { ...byId('o3').verification, score: 39 } })
    const unknown = variant('unknown', { verification: { ...byId('o3').verification, score: null } })

    expect(ids({ reliableOnly: true })).toEqual(['o1', 'o3', 'o2'])
    expect(ids({ reliableOnly: true }, [at40, at39, unknown])).toEqual(['at40'])
    expect(ids({ reliableOnly: true }, [unknown])).toEqual([])
  })

  it('warns when every active offer is low or unscored', () => {
    const unknown = variant('unknown', { verification: { ...byId('o3').verification, score: null } })
    expect(viewOffers([byId('o4'), unknown], {}).allLow).toBe(true)
    expect(viewOffers([byId('o4'), byId('o2')], {}).allLow).toBe(false)
    expect(viewOffers([], {}).allLow).toBe(false)
  })
})

describe('offerFiltersSearch', () => {
  it('parses the multi-select filter contract and unsets empty or invalid kinds', () => {
    expect(
      offerFiltersSearch.parse({
        kinds: ['code', 'sale'],
        customer: 'new',
        amount: 1500,
        reliableOnly: true,
        sort: 'value',
      }),
    ).toEqual({
      kinds: ['code', 'sale'],
      customer: 'new',
      amount: 1500,
      reliableOnly: true,
      sort: 'value',
    })
    expect(offerFiltersSearch.parse({ kinds: 'sale' }).kinds).toEqual(['sale'])
    expect(offerFiltersSearch.parse({ kinds: ['code', 'code'] }).kinds).toEqual(['code'])
    expect(offerFiltersSearch.parse({ kinds: [] }).kinds).toBeUndefined()
    expect(offerFiltersSearch.parse({ kinds: ['bogus'] }).kinds).toBeUndefined()
    expect(offerFiltersSearch.parse({ amount: 0 }).amount).toBe(0)
    expect(offerFiltersSearch.parse({ amount: -1 }).amount).toBeUndefined()
    expect(offerFiltersSearch.parse({ sort: 'bogus' }).sort).toBeUndefined()
    expect(offerFiltersSearch.parse({ kinds: ['code'], customer: 'bogus', amount: -1, reliableOnly: 'yes' })).toEqual({
      kinds: ['code'],
    })
  })

  it('drops the legacy single kind param', () => {
    expect(offerFiltersSearch.parse({ kind: 'code' })).not.toHaveProperty('kind')
  })

  it('supports free offer filters without breaking promo defaults', () => {
    const freeYes = variant('free-yes', {
      type: 'free_credit',
      kind: 'free',
      availability: { status: 'yes', reason: null },
      conditions: { ...byId('o3').conditions, requirements: ['card'] },
      audience: ['individual'],
    })
    const freeNo = variant('free-no', {
      type: 'free_credit',
      kind: 'free',
      availability: { status: 'no', reason: 'закрыто' },
      conditions: { ...byId('o3').conditions, requirements: ['foreign_card', 'phone'] },
      audience: ['business'],
    })
    const freeStudent = variant('free-student', {
      type: 'student',
      kind: 'free',
      availability: { status: 'yes', reason: null },
      conditions: { ...byId('o3').conditions, requirements: ['student_status'] },
      audience: ['student'],
    })

    const list = [byId('o1'), freeYes, freeNo, freeStudent]
    expect(ids({ availableInRu: true }, list)).toEqual(['o1', 'free-yes', 'free-student'])
    expect(ids({ kinds: ['free'], availableInRu: true }, list)).toEqual(['free-yes', 'free-student'])
    expect(ids({ kinds: ['free'], noCard: true }, list)).toEqual(['free-student'])
    expect(ids({ kinds: ['free'], noForeignCard: true }, list)).toEqual(['free-yes', 'free-student'])
    expect(ids({ kinds: ['free'], audience: ['student'] }, list)).toEqual(['free-student'])
  })
})

describe('activeFilterCount', () => {
  it('counts selected kinds, customer, amount and reliability but not sort', () => {
    expect(activeFilterCount({})).toBe(0)
    expect(activeFilterCount({ sort: 'value' })).toBe(0)
    expect(activeFilterCount({ kinds: [] })).toBe(0)
    expect(
      activeFilterCount({
        kinds: ['code', 'cashback'],
        customer: 'existing',
        amount: 0,
        reliableOnly: true,
        sort: 'fresh',
      }),
    ).toBe(5)
  })
})

describe('formatHeadline', () => {
  it('joins value and threshold with non-breaking spaces', () => {
    expect(formatHeadline(byId('o1'))).toBe('−300\u00a0₽ на заказ от 1\u00a0500\u00a0₽')
    expect(formatHeadline(byId('o3'))).toBe('2 по цене 1')
  })
})

describe('formatAgo', () => {
  it('follows DESIGN_SPEC 3.14 buckets', () => {
    const minus = (ms: number) => new Date(NOW.getTime() - ms)
    expect(formatAgo(minus(30_000), NOW)).toBe('только что')
    expect(formatAgo(minus(2 * 3_600_000), NOW)).toBe('2 ч назад')
    expect(formatAgo(minus(26 * 3_600_000), NOW)).toBe('вчера')
    expect(formatAgo(minus(3 * 86_400_000), NOW)).toBe('3 дня назад')
    expect(formatAgo(minus(10 * 86_400_000), NOW)).toBe('06.11.2026')
  })
})

describe('formatDate', () => {
  it('renders the Europe/Moscow calendar day at midnight boundaries', () => {
    expect(formatDate(new Date('2026-11-05T20:59:00Z'))).toBe('05.11.2026')
    expect(formatDate(new Date('2026-11-05T21:00:00Z'))).toBe('06.11.2026')
  })
})

describe('formatTime', () => {
  it('renders Europe/Moscow clock time', () => {
    expect(formatTime(new Date('2026-11-05T21:30:00Z'))).toBe('00:30')
  })
})

describe('formatDayCount', () => {
  it('uses the shared Russian plural forms for days', () => {
    expect([1, 2, 5, 11, 21].map(formatDayCount)).toEqual(['1 день', '2 дня', '5 дней', '11 дней', '21 день'])
  })
})

describe('formatVerificationMethod', () => {
  it('maps method labels from DESIGN_SPEC 3.14 and keeps the unknown state null', () => {
    const methods = ['api', 'cart_test', 'crowd', 'manual'] as const
    expect(methods.map(formatVerificationMethod)).toEqual([
      'партнёрская сеть',
      'тест в корзине',
      'отзывы пользователей',
      'редакция',
    ])
    expect(formatVerificationMethod(null)).toBeNull()
  })
})

describe('buildConditions', () => {
  it('lists restrictions before deadlines before neutral notes', () => {
    expect(buildConditions(byId('o1'), NOW).map((item) => item.kind)).toEqual([
      'restriction',
      'restriction',
      'restriction',
      'deadline',
      'neutral',
    ])
  })

  it('marks deadlines within three days as urgent', () => {
    const soon = { ...byId('o2'), expiresAt: new Date('2026-11-18T12:00:00+03:00') }
    expect(buildConditions(soon, NOW).find((item) => item.kind === 'deadline')).toMatchObject({ urgent: true })
  })

  it('renders included and excluded categories as restrictions before the deadline', () => {
    const categoryOffer = variant('categories', {
      conditions: {
        ...byId('o3').conditions,
        categoriesInclude: ['Готовая еда', 'Напитки'],
        categoriesExclude: ['Алкоголь'],
      },
      expiresAt: new Date('2026-11-20T23:59:59+03:00'),
    })
    const items = buildConditions(categoryOffer, NOW)
    const texts = items.map((item) => item.text)

    expect(texts).toContain('Только категории: Готовая еда и Напитки')
    expect(texts).toContain('Не действует на категории: Алкоголь')
    const deadline = items.findIndex((item) => item.kind === 'deadline')
    expect(texts.indexOf('Только категории: Готовая еда и Напитки')).toBeLessThan(deadline)
    expect(texts.indexOf('Не действует на категории: Алкоголь')).toBeLessThan(deadline)
  })

  it('adds no category lines for empty lists', () => {
    expect(buildConditions(byId('o1'), NOW).some((item) => item.text.includes('категори'))).toBe(false)
  })
})
