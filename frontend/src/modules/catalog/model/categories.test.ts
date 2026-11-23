import { describe, expect, it } from 'vitest'

import type { Offer } from '@/modules/offer/index.ts'

import {
  countHiddenUnavailable,
  FREE_SUBCATEGORIES,
  isFreeSubcategory,
  matchesCategory,
  resolveCatalogBranch,
  TOP_CATEGORIES,
} from './categories.ts'

function makeOffer(overrides: Partial<Offer>): Offer {
  return {
    id: 'o-test',
    type: 'promo_code',
    kind: 'code',
    categorySlug: 'food',
    merchant: { slug: 'samokat', name: 'Самокат', logoUrl: null },
    title: 'Тестовый оффер',
    description: null,
    mechanicText: null,
    code: 'TEST',
    value: { amount: 300, currency: 'RUB', kind: 'fixed', durationDays: null, label: null },
    conditions: {
      minOrder: null,
      customerType: 'all',
      stackableWith: [],
      platform: 'both',
      categoriesInclude: [],
      categoriesExclude: [],
      requirements: [],
    },
    availability: null,
    startsAt: null,
    expiresAt: null,
    endedAt: null,
    afterEnd: null,
    gotchas: [],
    eligibility: null,
    howToGet: [],
    failReasons: [],
    history: [],
    changedNote: null,
    audience: ['individual'],
    source: { kind: 'partner_api', name: 'Admitad', url: null },
    targetUrl: 'https://samokat.ru/',
    adMarking: null,
    verification: {
      lastCheckedAt: new Date('2026-11-16T10:00:00+03:00'),
      method: 'api',
      score: 80,
      success7d: 10,
      fail7d: 2,
    },
    lifecycle: 'active',
    isEnded: false,
    ...overrides,
  }
}

describe('category tree constants', () => {
  it('defines canonical top categories and free subcategories from Figma', () => {
    expect(TOP_CATEGORIES.map((c) => c.slug)).toEqual([
      'all',
      'food',
      'marketplaces',
      'clothing',
      'subscriptions',
      'travel',
      'free',
    ])
    expect(FREE_SUBCATEGORIES.map((c) => c.fullSlug)).toEqual([
      'free/cloud',
      'free/ai',
      'free/hosting',
      'free/tools',
      'free/students',
    ])
  })
})

describe('isFreeSubcategory', () => {
  it('recognises only known free subcategory slugs', () => {
    expect(isFreeSubcategory('cloud')).toBe(true)
    expect(isFreeSubcategory('ai')).toBe(true)
    expect(isFreeSubcategory('hosting')).toBe(true)
    expect(isFreeSubcategory('tools')).toBe(true)
    expect(isFreeSubcategory('students')).toBe(true)

    expect(isFreeSubcategory('yandex-cloud-grant')).toBe(false)
    expect(isFreeSubcategory('free')).toBe(false)
    expect(isFreeSubcategory('unknown')).toBe(false)
  })
})

describe('resolveCatalogBranch', () => {
  it('resolves root all, top categories, free branch and free subcategories', () => {
    expect(resolveCatalogBranch()).toMatchObject({
      slug: 'all',
      fullSlug: 'all',
      label: 'Все',
      title: 'Каталог',
      path: '/catalog',
      isFree: false,
    })
    expect(resolveCatalogBranch('all')?.fullSlug).toBe('all')
    expect(resolveCatalogBranch('food')).toMatchObject({
      slug: 'food',
      fullSlug: 'food',
      label: 'Еда и продукты',
      title: 'Еда и продукты',
      path: '/catalog/food',
      isFree: false,
    })
    expect(resolveCatalogBranch('free')).toMatchObject({
      slug: 'free',
      fullSlug: 'free',
      label: 'Бесплатно',
      title: 'Бесплатные кредиты и тарифы',
      path: '/catalog/free',
      isFree: true,
    })
    expect(resolveCatalogBranch('free', 'ai')).toMatchObject({
      slug: 'ai',
      fullSlug: 'free/ai',
      label: 'ИИ-модели и API',
      title: 'ИИ-модели и API',
      path: '/catalog/free/ai',
      isFree: true,
    })
    expect(resolveCatalogBranch('free/cloud')).toMatchObject({
      slug: 'cloud',
      fullSlug: 'free/cloud',
      path: '/catalog/free/cloud',
      isFree: true,
    })
  })

  it('returns null for unknown categories or invalid subcategory pairings', () => {
    expect(resolveCatalogBranch('unknown')).toBeNull()
    expect(resolveCatalogBranch('virtual-cards')).toBeNull()
    expect(resolveCatalogBranch('free', 'unknown')).toBeNull()
    expect(resolveCatalogBranch('free/unknown')).toBeNull()
    expect(resolveCatalogBranch('food', 'cloud')).toBeNull()
  })
})

describe('matchesCategory', () => {
  it('matches all, exact branch, and nested free subcategories', () => {
    expect(matchesCategory('food', 'all')).toBe(true)
    expect(matchesCategory('free/ai', 'all')).toBe(true)

    expect(matchesCategory('food', 'food')).toBe(true)
    expect(matchesCategory('marketplaces', 'food')).toBe(false)

    expect(matchesCategory('free/cloud', 'free')).toBe(true)
    expect(matchesCategory('free/ai', 'free')).toBe(true)
    expect(matchesCategory('free', 'free')).toBe(true)
    expect(matchesCategory('food', 'free')).toBe(false)

    expect(matchesCategory('free/ai', 'free/ai')).toBe(true)
    expect(matchesCategory('free/cloud', 'free/ai')).toBe(false)
  })
})

describe('countHiddenUnavailable', () => {
  const promo = makeOffer({ id: 'o1', kind: 'code', type: 'promo_code' })
  const freeYes = makeOffer({
    id: 'f1',
    kind: 'free',
    type: 'free_credit',
    categorySlug: 'free/cloud',
    availability: { status: 'yes', reason: null },
  })
  const freePartial = makeOffer({
    id: 'f2',
    kind: 'free',
    type: 'free_tier',
    categorySlug: 'free/hosting',
    availability: { status: 'partial', reason: 'может замедляться' },
  })
  const freeNoAws = makeOffer({
    id: 'f3',
    kind: 'free',
    type: 'free_credit',
    categorySlug: 'free/cloud',
    availability: { status: 'no', reason: 'закрыто' },
    conditions: {
      minOrder: null,
      customerType: 'all',
      stackableWith: [],
      platform: 'both',
      categoriesInclude: [],
      categoriesExclude: [],
      requirements: ['foreign_card'],
    },
  })
  const freeNoOpenAi = makeOffer({
    id: 'f6',
    kind: 'free',
    type: 'free_credit',
    categorySlug: 'free/ai',
    availability: { status: 'no', reason: 'заблокировано' },
  })
  const freeNoEnded = makeOffer({
    id: 'f-ended',
    kind: 'free',
    type: 'free_credit',
    categorySlug: 'free/cloud',
    availability: { status: 'no', reason: 'закрыто' },
    lifecycle: 'ended',
    isEnded: true,
  })

  const offers = [promo, freeYes, freePartial, freeNoAws, freeNoOpenAi, freeNoEnded]

  it('counts active free offers with availability status no hidden by availableInRu', () => {
    expect(countHiddenUnavailable(offers, { availableInRu: true })).toBe(2)
    expect(countHiddenUnavailable(offers, { availableInRu: false })).toBe(0)
    expect(countHiddenUnavailable(offers, {})).toBe(0)
  })

  it('respects other active filters so showing unavailable actually reveals hidden items', () => {
    expect(countHiddenUnavailable(offers, { availableInRu: true, kinds: ['code'] })).toBe(0)
    expect(countHiddenUnavailable(offers, { availableInRu: true, noCard: true })).toBe(1)
  })
})
