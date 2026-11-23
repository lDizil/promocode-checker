import { queryOptions } from '@tanstack/react-query'

import { apiGet } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { toSearchResults, toSearchSuggest } from '../model/search.ts'
import { searchResultsDto, searchSuggestResponseDto } from './search.dto.ts'

const keys = createQueryKeys('search')

export const searchQueries = {
  all: keys.all,
  suggest: (q: string) => {
    const trimmed = q.trim()
    return queryOptions({
      queryKey: keys.of('suggest', trimmed),
      queryFn: ({ signal }) =>
        apiGet(`/search/suggest?q=${encodeURIComponent(trimmed)}`, searchSuggestResponseDto, { signal }),
      select: toSearchSuggest,
      enabled: trimmed.length > 0,
    })
  },
  results: (q: string) => {
    const trimmed = q.trim()
    return queryOptions({
      queryKey: keys.of('results', trimmed),
      queryFn: ({ signal }) => apiGet(`/search?q=${encodeURIComponent(trimmed)}`, searchResultsDto, { signal }),
      select: toSearchResults,
    })
  },
}
