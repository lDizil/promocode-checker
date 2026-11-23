import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { duplicateCheckDto, type DuplicateCheckDto } from './submission.dto.ts'

const keys = createQueryKeys('submission')

export interface DuplicateMatch {
  id: string
  merchantSlug: string
  code: string
  score: number | null
  lastCheckedAt: Date | null
}

function toDuplicateMatch(dto: DuplicateCheckDto): DuplicateMatch | null {
  if (!dto.duplicate) return null
  return {
    id: dto.duplicate.id,
    merchantSlug: dto.duplicate.merchant_slug,
    code: dto.duplicate.code,
    score: dto.duplicate.score,
    lastCheckedAt: dto.duplicate.last_checked_at === null ? null : new Date(dto.duplicate.last_checked_at),
  }
}

export const submissionQueries = {
  all: keys.all,
  duplicate: (merchant: string, code: string) => {
    const normalizedMerchant = merchant.trim()
    const normalizedCode = code.trim().toUpperCase()
    const qs = new URLSearchParams({
      merchant: normalizedMerchant,
      code: normalizedCode,
    }).toString()
    return queryOptions({
      queryKey: keys.of('duplicate', normalizedMerchant.toLowerCase(), normalizedCode),
      queryFn: ({ signal }) => apiGet(`/offers/check-duplicate?${qs}`, duplicateCheckDto, { signal }),
      select: toDuplicateMatch,
    })
  },
}
