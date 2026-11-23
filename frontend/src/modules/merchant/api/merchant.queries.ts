import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { toMerchant, toMerchantSummary } from '../model/merchant.ts'
import { merchantDto, merchantListDto } from './merchant.dto.ts'

const keys = createQueryKeys('merchant')

export interface MerchantListParams {
  category?: string
  featured?: boolean
}

function buildQuery(params?: MerchantListParams): string {
  if (!params) return ''
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.featured) search.set('featured', 'true')
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const merchantQueries = {
  all: keys.all,
  list: (params?: MerchantListParams) =>
    queryOptions({
      queryKey: keys.of('list', params?.category ?? 'all', params?.featured ? 'featured' : 'all'),
      queryFn: ({ signal }) => apiGet(`/merchants${buildQuery(params)}`, merchantListDto, { signal }),
      select: (data) => data.items.map(toMerchantSummary),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: keys.of('detail', slug),
      queryFn: ({ signal }) => apiGet(`/merchants/${encodeURIComponent(slug)}`, merchantDto, { signal }),
      select: toMerchant,
    }),
}
