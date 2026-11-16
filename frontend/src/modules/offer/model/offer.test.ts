import { describe, expect, it } from 'vitest'

import { samokatOffers } from '../api/offer.mocks.ts'
import { buildConditions } from './conditions.ts'
import { formatAgo, formatHeadline } from './format.ts'
import { scoreLevel, sortOffers, toOffer } from './offer.ts'

const NOW = new Date('2026-11-16T12:00:00+03:00')
const offers = samokatOffers(NOW).map(toOffer)
const byId = (id: string) => offers.find((offer) => offer.id === id)!

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
})
