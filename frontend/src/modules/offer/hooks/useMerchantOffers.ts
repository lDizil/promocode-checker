import { useSuspenseQuery } from '@tanstack/react-query'

import { offerQueries } from '../api/offer.queries.ts'
import {
  summarizeOffers,
  viewOffers,
  type OfferFilters,
  type OfferListView,
  type OfferSummary,
} from '../model/filters.ts'
import type { Offer } from '../model/offer.ts'

export interface MerchantOffers extends OfferListView {
  all: Offer[]
  updatedAt: number
  summary: OfferSummary
}

export function useMerchantOffers(slug: string, filters: OfferFilters): MerchantOffers {
  const { data, dataUpdatedAt } = useSuspenseQuery(offerQueries.byMerchant(slug))
  const view = viewOffers(data, filters)
  return {
    ...view,
    all: data,
    updatedAt: dataUpdatedAt,
    summary: summarizeOffers(data.filter((offer) => !offer.isEnded)),
  }
}
