import { z } from 'zod'

import { formatValue } from './format.ts'
import { sortOffers, type Offer } from './offer.ts'

const OFFER_KINDS = ['code', 'sale', 'cashback'] as const
const OFFER_SORTS = ['reliable', 'value', 'fresh', 'expiring'] as const

const kindsSearch = z
  .union([z.enum(OFFER_KINDS), z.array(z.enum(OFFER_KINDS))])
  .optional()
  .catch(undefined)
  .transform((value) => {
    if (value === undefined) return undefined
    const kinds = [...new Set(Array.isArray(value) ? value : [value])]
    return kinds.length > 0 ? kinds : undefined
  })
  .optional()

/**
 * URL search params of offer lists (P-04). Invalid values fall back instead of 500-ing the page;
 * defaults stay out of the URL so the canonical /m/samokat is not redirected.
 */
export const offerFiltersSearch = z.object({
  kinds: kindsSearch,
  customer: z.enum(['new', 'existing']).optional().catch(undefined),
  amount: z.number().nonnegative().optional().catch(undefined),
  reliableOnly: z.boolean().optional().catch(undefined),
  sort: z.enum(OFFER_SORTS).optional().catch(undefined),
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

/** FilterChip counter: each selected type, customer, amount and reliability; sort is not a filter. */
export function activeFilterCount(filters: OfferFilters): number {
  return (
    (filters.kinds?.length ?? 0) +
    (filters.customer ? 1 : 0) +
    (filters.amount === undefined ? 0 : 1) +
    (filters.reliableOnly ? 1 : 0)
  )
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
