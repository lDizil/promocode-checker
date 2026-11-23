import { useEffect, useState } from 'react'

/** Tracks the topmost visible section ID on the client while returning the first ID during SSR. */
export function useActiveAnchor(ids: readonly string[]): string {
  const first = ids[0] ?? ''
  const [active, setActive] = useState(first)
  const key = ids.join('|')

  useEffect(() => {
    if (ids.length === 0 || typeof IntersectionObserver === 'undefined') return
    setActive(ids[0] ?? '')

    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    if (elements.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const current = ids.find((id) => visible.has(id))
        if (current) setActive(current)
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 },
    )

    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
    // `key` reflects the ordered section list so callers may pass inline arrays safely.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return active
}
