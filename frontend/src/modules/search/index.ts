export { searchQueries } from './api/search.queries.ts'
export { useAutoFocus } from './hooks/useAutoFocus.ts'
export { RECENT_SEARCHES_KEY, useRecentSearches } from './hooks/useRecentSearches.ts'
export { useSearchResults } from './hooks/useSearchResults.ts'
export { useSearchSuggest } from './hooks/useSearchSuggest.ts'
export {
  addRecentSearch,
  findTypoSuggestion,
  levenshtein,
  RECENT_SEARCHES_LIMIT,
  removeRecentSearch,
  splitHighlight,
  type DidYouMean,
  type HighlightPart,
  type SearchResults,
  type SearchSuggestItem,
  type SearchSuggestKind,
  type SearchSuggestResponse,
} from './model/search.ts'
export { SearchAutocomplete, type SearchAutocompleteProps } from './ui/SearchAutocomplete.tsx'
