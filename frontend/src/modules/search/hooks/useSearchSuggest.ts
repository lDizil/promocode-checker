import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { searchQueries } from '../api/search.queries.ts'

export function useSearchSuggest(query: string, delayMs = 150) {
  const trimmed = query.trim()
  const [debouncedQuery, setDebouncedQuery] = useState(trimmed)

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setDebouncedQuery(trimmed)
      },
      trimmed === '' ? 0 : delayMs,
    )
    return () => clearTimeout(timer)
  }, [trimmed, delayMs])

  const effectiveQuery = trimmed === '' ? '' : debouncedQuery
  const result = useQuery(searchQueries.suggest(effectiveQuery))
  const isDebouncing = trimmed.length > 0 && trimmed !== effectiveQuery
  const isLoading = trimmed.length > 0 && (isDebouncing || result.isLoading)

  return {
    data: effectiveQuery ? result.data : undefined,
    isLoading,
    isError: result.isError,
  }
}
