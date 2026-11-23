import { useCallback, useEffect, useRef, useState } from 'react'

import { toast } from '@/common/ui/Toast/index.ts'

import type { Offer } from '../model/offer.ts'

const RESET_MS = 2000

export interface CopyCodeResult {
  /** Id of the offer copied last; `null` once the 2 s reset has passed. */
  copiedId: string | null
  copy: (offer: Pick<Offer, 'id' | 'code' | 'merchant' | 'targetUrl'>) => Promise<boolean>
}

/** DESIGN_SPEC 3.12: clipboard write plus the 2 s «Скопировано» timer without auto-redirecting. */
export function useCopyCode(): CopyCodeResult {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attempt = useRef(0)

  const clear = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(
    () => () => {
      clear()
      attempt.current++
    },
    [clear],
  )

  const copy = useCallback(
    async (offer: Pick<Offer, 'id' | 'code' | 'merchant' | 'targetUrl'>): Promise<boolean> => {
      if (!offer.code) return false
      const currentAttempt = ++attempt.current
      try {
        await navigator.clipboard.writeText(offer.code)
      } catch {
        toast.error('Не удалось скопировать код', { description: 'Выделите код и скопируйте его вручную' })
        return false
      }
      if (currentAttempt !== attempt.current) return false
      clear()
      setCopiedId(offer.id)
      timer.current = setTimeout(() => {
        setCopiedId(null)
        timer.current = null
      }, RESET_MS)
      toast.success('Код скопирован', {
        action: { label: 'Открыть магазин', href: offer.targetUrl },
      })
      return true
    },
    [clear],
  )

  return { copiedId, copy }
}
