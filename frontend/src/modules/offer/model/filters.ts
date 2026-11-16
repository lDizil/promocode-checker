import { z } from 'zod'

import { formatValue } from './format.ts'
import { sortOffers, type Offer } from './offer.ts'

/**
 * URL search params of offer lists (P-04). Invalid values fall back instead of 500-ing the page;
 * defaults stay out of the URL so the canonical /m/samokat is not redirected.
 */
export const offerFiltersSearch = z.object({
  kind: z.enum(['code', 'sale']).optional().catch(undefined),
  customer: z.enum(['new', 'existing']).optional().catch(undefined),
  sort: z.enum(['reliable', 'value', 'fresh', 'expiring']).optional().catch(undefined),
})

export type OfferFilters = z.infer<typeof offerFiltersSearch>

export interface OfferListView {
  active: Offer[]
  ended: Offer[]
  /** Active offers before filters, for the «нет кодов» vs «под фильтры ничего нет» distinction. */
  totalActive: number
  /** Every active offer is `low` (P-04 `all-low`). */
  allLow: boolean
}

function matches(offer: Offer, filters: OfferFilters): boolean {
  if (filters.kind === 'code' && offer.kind !== 'code') return false
  if (filters.kind === 'sale' && offer.kind === 'code') return false
  if (filters.customer && offer.conditions.customerType !== 'all' && offer.conditions.customerType !== filters.customer)
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
    allLow: active.length > 0 && active.every((offer) => (offer.verification.score ?? 0) < 40),
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
