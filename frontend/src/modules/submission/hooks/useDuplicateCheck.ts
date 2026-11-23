import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { formatAgo } from '@/modules/offer/index.ts'

import { submissionQueries, type DuplicateMatch } from '../api/submission.queries.ts'
import { CODE_PATTERN } from '../model/schema.ts'

const DEBOUNCE_MS = 250

export interface DuplicateCheckMatch extends DuplicateMatch {
  checkedAgo: string | null
}

export function useDuplicateCheck(merchant: string, code: string): DuplicateCheckMatch | null {
  const normalizedMerchant = merchant.trim()
  const normalizedCode = code.trim().toUpperCase()
  const [debounced, setDebounced] = useState({ merchant: normalizedMerchant, code: normalizedCode, at: 0 })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced({ merchant: normalizedMerchant, code: normalizedCode, at: Date.now() })
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [normalizedMerchant, normalizedCode])

  const eligible =
    debounced.merchant.length > 0 &&
    CODE_PATTERN.test(debounced.code) &&
    debounced.merchant === normalizedMerchant &&
    debounced.code === normalizedCode

  const query = useQuery({
    ...submissionQueries.duplicate(debounced.merchant, debounced.code),
    enabled: eligible,
    retry: false,
    staleTime: 30_000,
  })

  if (!eligible || !query.data) return null

  const match = query.data
  const now = new Date(debounced.at)
  return {
    ...match,
    checkedAgo: match.lastCheckedAt ? formatAgo(match.lastCheckedAt, now) : null,
  }
}
