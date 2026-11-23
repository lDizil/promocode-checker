import { useSuspenseQuery } from '@tanstack/react-query'

import { merchantQueries, type MerchantListParams } from '../api/merchant.queries.ts'
import type { MerchantSummary } from '../model/merchant.ts'

export function useMerchants(params?: MerchantListParams): MerchantSummary[] {
  return useSuspenseQuery(merchantQueries.list(params)).data
}
