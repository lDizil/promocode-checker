import { useSuspenseQuery } from '@tanstack/react-query'

import { merchantQueries } from '../api/merchant.queries.ts'
import type { Merchant } from '../model/merchant.ts'

export function useMerchant(slug: string): Merchant {
  return useSuspenseQuery(merchantQueries.detail(slug)).data
}
