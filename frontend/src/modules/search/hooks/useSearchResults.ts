import { useSuspenseQuery } from '@tanstack/react-query'

import { searchQueries } from '../api/search.queries.ts'
import type { SearchResults } from '../model/search.ts'

export function useSearchResults(q: string): SearchResults {
  return useSuspenseQuery(searchQueries.results(q)).data
}
