import { useEffect, type RefObject } from 'react'

export function useAutoFocus(containerRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    containerRef.current?.querySelector<HTMLInputElement>('input')?.focus()
  }, [containerRef, enabled])
}
