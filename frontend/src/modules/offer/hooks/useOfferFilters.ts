import { useCallback, useEffect, useRef, useState } from 'react'

import { toast } from '@/common/ui/Toast/index.ts'

import type { OfferFilters } from '../model/filters.ts'

export function useOfferFilters(search: OfferFilters, onChange: (next: OfferFilters) => Promise<unknown>) {
  const [filters, setFilters] = useState(search)
  const [draft, setDraft] = useState(search)
  const [open, setOpen] = useState(false)
  const latest = useRef(search)
  const pending = useRef(0)
  const navigation = useRef<Promise<unknown>>(Promise.resolve())

  useEffect(() => {
    if (pending.current !== 0) return
    latest.current = search
    setFilters(search)
  }, [search])

  const change = useCallback(
    (next: OfferFilters) => {
      latest.current = next
      setFilters(next)
      pending.current++
      const scheduled = navigation.current.then(() => onChange(next))
      navigation.current = scheduled.catch(() => undefined)
      void scheduled
        .finally(() => {
          pending.current--
        })
        .catch(() => {
          if (latest.current !== next) return
          latest.current = search
          setFilters(search)
          toast.error('Не удалось применить фильтры. Попробуйте ещё раз')
        })
    },
    [onChange, search],
  )

  const toggle = (patch: Partial<OfferFilters>) => change({ ...latest.current, ...patch })
  const toggleKind = (kind: NonNullable<OfferFilters['kinds']>[number], selected: boolean) => {
    const kinds = latest.current.kinds ?? []
    toggle({ kinds: selected ? [...kinds, kind] : kinds.filter((value) => value !== kind) })
  }
  const openSheet = () => {
    setDraft(latest.current)
    setOpen(true)
  }
  const apply = () => {
    change(draft)
    setOpen(false)
  }

  return { filters, draft, setDraft, open, setOpen, openSheet, apply, change, toggle, toggleKind }
}
