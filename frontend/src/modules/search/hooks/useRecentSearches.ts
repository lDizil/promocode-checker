import { useCallback, useEffect, useState } from 'react'

import { addRecentSearch, RECENT_SEARCHES_LIMIT, removeRecentSearch } from '../model/search.ts'

export const RECENT_SEARCHES_KEY = 'rk:recent-searches'
const SYNC_EVENT = 'rk:recent-searches-change'

function readRecentSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(0, RECENT_SEARCHES_LIMIT)
  } catch {
    return []
  }
}

function writeRecentSearches(next: readonly string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(SYNC_EVENT))
  } catch {
    // Storage may be unavailable in private browsing or quota-limited contexts.
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setRecent(readRecentSearches())
    sync()

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === RECENT_SEARCHES_KEY) sync()
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(SYNC_EVENT, sync)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(SYNC_EVENT, sync)
    }
  }, [])

  const add = useCallback((query: string) => {
    const current = readRecentSearches()
    const next = addRecentSearch(current, query)
    setRecent(next)
    writeRecentSearches(next)
  }, [])

  const remove = useCallback((query: string) => {
    const current = readRecentSearches()
    const next = removeRecentSearch(current, query)
    setRecent(next)
    writeRecentSearches(next)
  }, [])

  const clear = useCallback(() => {
    setRecent([])
    writeRecentSearches([])
  }, [])

  return { recent, add, remove, clear }
}
