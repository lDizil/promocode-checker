import { useSuspenseQuery } from '@tanstack/react-query'

import { offerQueries } from '../api/offer.queries.ts'
import {
  summarizeOffers,
  viewOffers,
  type OfferFilters,
  type OfferListView,
  type OfferSummary,
} from '../model/filters.ts'

export interface MerchantOffers extends OfferListView {
  summary: OfferSummary
}

export function useMerchantOffers(slug: string, filters: OfferFilters): MerchantOffers {
  const { data } = useSuspenseQuery(offerQueries.byMerchant(slug))
  const view = viewOffers(data, filters)
  return { ...view, summary: summarizeOffers(data.filter((offer) => !offer.isEnded)) }
}
