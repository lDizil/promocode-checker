import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { toMerchant } from '../model/merchant.ts'
import { merchantDto } from './merchant.dto.ts'

const keys = createQueryKeys('merchant')

export const merchantQueries = {
  all: keys.all,
  detail: (slug: string) =>
    queryOptions({
      queryKey: keys.of('detail', slug),
      queryFn: ({ signal }) => apiGet(`/merchants/${encodeURIComponent(slug)}`, merchantDto, { signal }),
      select: toMerchant,
    }),
}
