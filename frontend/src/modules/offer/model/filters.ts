import { z } from 'zod'

import { formatValue } from './format.ts'
import { sortOffers, type Offer, type OfferAudience } from './offer.ts'

const OFFER_KINDS = ['code', 'sale', 'cashback', 'free'] as const
const OFFER_SORTS = ['reliable', 'value', 'fresh', 'expiring'] as const
const AUDIENCES = ['individual', 'student', 'business'] as const
const FREE_TYPES = ['free_credit', 'free_tier', 'trial', 'student', 'startup'] as const

function enumArraySearch<T extends string>(values: readonly [T, ...T[]]) {
  return z
    .union([z.enum(values), z.array(z.enum(values))])
    .optional()
    .catch(undefined)
    .transform((value) => {
      if (value === undefined) return undefined
      const unique = [...new Set(Array.isArray(value) ? value : [value])]
      return unique.length > 0 ? unique : undefined
    })
    .optional()
}

/**
 * URL search params of offer lists (P-04, P-06, P-03). Invalid values fall back instead of 500-ing the page;
 * defaults stay out of the URL so canonical routes stay clean.
 */
export const offerFiltersSearch = z.object({
  kinds: enumArraySearch(OFFER_KINDS),
  customer: z.enum(['new', 'existing']).optional().catch(undefined),
  amount: z.number().nonnegative().optional().catch(undefined),
  reliableOnly: z.boolean().optional().catch(undefined),
  sort: z.enum(OFFER_SORTS).optional().catch(undefined),
  availableInRu: z.boolean().optional().catch(undefined),
  noCard: z.boolean().optional().catch(undefined),
  noForeignCard: z.boolean().optional().catch(undefined),
  ruCardOk: z.boolean().optional().catch(undefined),
  noKyc: z.boolean().optional().catch(undefined),
  noPhone: z.boolean().optional().catch(undefined),
  forever: z.boolean().optional().catch(undefined),
  audience: enumArraySearch(AUDIENCES),
  freeTypes: enumArraySearch(FREE_TYPES),
})

export type OfferFilters = z.infer<typeof offerFiltersSearch>

export interface OfferListView {
  active: Offer[]
  ended: Offer[]
  /** Active offers before filters, for the «нет кодов» vs «под фильтры ничего нет» distinction. */
  totalActive: number
  /** No active offer has a known reliable score; unknown scores count as unreliable (P-04 `all-low`). */
  allLow: boolean
}

const RELIABLE_SCORE_MIN = 40

function matchesFreeConstraints(offer: Offer, filters: OfferFilters): boolean {
  const { requirements } = offer.conditions
  if (filters.availableInRu && offer.kind === 'free' && offer.availability?.status === 'no') return false
  if (filters.noCard && (requirements.includes('card') || requirements.includes('foreign_card'))) return false
  if (filters.noForeignCard && requirements.includes('foreign_card')) return false
  if (filters.ruCardOk && requirements.includes('foreign_card')) return false
  if (filters.noKyc && requirements.includes('kyc')) return false
  if (filters.noPhone && requirements.includes('phone')) return false
  if (filters.forever) {
    const isForever =
      offer.expiresAt === null &&
      offer.value.durationDays === null &&
      (!offer.afterEnd || offer.afterEnd.toLowerCase().includes('бессроч'))
    if (!isForever) return false
  }
  if (filters.audience?.length && !filters.audience.some((item: OfferAudience) => offer.audience.includes(item))) {
    return false
  }
  if (filters.freeTypes?.length && !filters.freeTypes.some((type) => type === offer.type)) return false
  return true
}

function matches(offer: Offer, filters: OfferFilters): boolean {
  if (filters.kinds?.length && !filters.kinds.some((kind) => kind === offer.kind)) return false
  if (filters.customer && offer.conditions.customerType !== 'all' && offer.conditions.customerType !== filters.customer)
    return false
  if (filters.amount !== undefined) {
    const { minOrder } = offer.conditions
    // No minimum fits any basket; otherwise the basket must cover it.
    if (minOrder !== null && minOrder > filters.amount) return false
  }
  if (filters.reliableOnly && (offer.verification.score === null || offer.verification.score < RELIABLE_SCORE_MIN))
    return false
  if (!matchesFreeConstraints(offer, filters)) return false
  return true
}

export function viewOffers(offers: readonly Offer[], filters: OfferFilters): OfferListView {
  const active = offers.filter((offer) => !offer.isEnded)
  const visible = sortOffers(
    active.filter((offer) => matches(offer, filters)),
    filters.sort ?? 'reliable',
  )
  return {
    active: visible,
    ended: offers.filter((offer) => offer.isEnded),
    totalActive: active.length,
    allLow:
      active.length > 0 &&
      active.every((offer) => offer.verification.score === null || offer.verification.score < RELIABLE_SCORE_MIN),
  }
}

/** FilterChip counter: each selected type, customer, amount, reliability and free constraint; sort is not a filter. */
export function activeFilterCount(filters: OfferFilters): number {
  return (
    (filters.kinds?.length ?? 0) +
    (filters.customer ? 1 : 0) +
    (filters.amount === undefined ? 0 : 1) +
    (filters.reliableOnly ? 1 : 0) +
    (filters.availableInRu ? 1 : 0) +
    (filters.noCard ? 1 : 0) +
    (filters.noForeignCard ? 1 : 0) +
    (filters.ruCardOk ? 1 : 0) +
    (filters.noKyc ? 1 : 0) +
    (filters.noPhone ? 1 : 0) +
    (filters.forever ? 1 : 0) +
    (filters.audience?.length ?? 0) +
    (filters.freeTypes?.length ?? 0)
  )
}

export function offerDetailPath(offer: Pick<Offer, 'id' | 'merchant'>) {
  return {
    to: '/m/$slug/o/$offerId' as const,
    params: { slug: offer.merchant.slug, offerId: offer.id },
  }
}

export interface OfferSummary {
  count: number
  bestValue: string | null
  bestScore: number | null
}

/** StatStrip on P-04: «Активных офферов», «Лучшая выгода», «Лучший шанс». */
export function summarizeOffers(active: readonly Offer[]): OfferSummary {
  const fixed = active.filter((offer) => offer.value.kind === 'fixed' && !offer.value.label)
  const best = fixed.reduce<Offer | null>(
    (top, offer) => (!top || offer.value.amount > top.value.amount ? offer : top),
    null,
  )
  const scores = active.map((offer) => offer.verification.score).filter((score) => score !== null)
  return {
    count: active.length,
    bestValue: best ? formatValue(best.value) : null,
    bestScore: scores.length > 0 ? Math.max(...scores) : null,
  }
}
