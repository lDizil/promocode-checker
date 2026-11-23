import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { toOffer } from '../model/offer.ts'
import { offerDto, offerListDto, recentOffersDto } from './offer.dto.ts'

const keys = createQueryKeys('offer')

export interface OfferListParams {
  category?: string
  kind?: string
  q?: string
}

function buildQuery(params?: OfferListParams): string {
  if (!params) return ''
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.kind) search.set('kind', params.kind)
  if (params.q) search.set('q', params.q)
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

// The cache holds raw DTOs (JSON-serialisable for SSR dehydration); `select` maps to the domain.
export const offerQueries = {
  all: keys.all,
  recent: () =>
    queryOptions({
      queryKey: keys.of('recent'),
      queryFn: ({ signal }) => apiGet('/offers/recent', recentOffersDto, { signal }),
      select: (data) => ({
        stats: { verifiedToday: data.stats.verified_today, merchantsCount: data.stats.merchants_count },
        justNow: data.just_now.map(toOffer),
        earlierToday: data.earlier_today.map(toOffer),
      }),
    }),
  list: (params?: OfferListParams) =>
    queryOptions({
      queryKey: keys.of('list', params?.category ?? 'all', params?.kind ?? 'all', params?.q ?? ''),
      queryFn: ({ signal }) => apiGet(`/offers${buildQuery(params)}`, offerListDto, { signal }),
      select: (data) => data.items.map(toOffer),
    }),
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
