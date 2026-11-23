import { useSuspenseQuery } from '@tanstack/react-query'

import { offerQueries, type OfferListParams } from '../api/offer.queries.ts'
import type { Offer } from '../model/offer.ts'

export function useOffer(id: string): Offer {
  return useSuspenseQuery(offerQueries.detail(id)).data
}

export function useOffers(params?: OfferListParams): Offer[] {
  return useSuspenseQuery(offerQueries.list(params)).data
}

export function useRecentOffers() {
  return useSuspenseQuery(offerQueries.recent()).data
}
