import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { toOffer } from '../model/offer.ts'
import { offerDto, offerListDto } from './offer.dto.ts'

const keys = createQueryKeys('offer')

// The cache holds raw DTOs (JSON-serialisable for SSR dehydration); `select` maps to the domain.
export const offerQueries = {
  all: keys.all,
  byMerchant: (slug: string) =>
    queryOptions({
      queryKey: keys.of('by-merchant', slug),
      queryFn: ({ signal }) => apiGet(`/merchants/${encodeURIComponent(slug)}/offers`, offerListDto, { signal }),
      select: (data) => data.items.map(toOffer),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: keys.of('detail', id),
      queryFn: ({ signal }) => apiGet(`/offers/${encodeURIComponent(id)}`, offerDto, { signal }),
      select: toOffer,
    }),
}
