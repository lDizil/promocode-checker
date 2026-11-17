import { useCallback, useEffect, useRef, useState } from 'react'

import { toast } from '@/common/ui/Toast/index.ts'

import type { Offer } from '../model/offer.ts'

const RESET_MS = 2000
const OPEN_MERCHANT_MS = 800

export interface CopyCodeResult {
  /** Id of the offer copied last; `null` once the 2 s reset has passed. */
  copiedId: string | null
  copy: (offer: Pick<Offer, 'id' | 'code' | 'merchant' | 'targetUrl'>) => Promise<boolean>
}

/** DESIGN_SPEC 3.12: clipboard write plus the 2 s «Скопировано» timer. */
export function useCopyCode(): CopyCodeResult {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const opening = useRef<{ timer: ReturnType<typeof setTimeout>; window: Window } | null>(null)
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
      if (opening.current) {
        clearTimeout(opening.current.timer)
        opening.current.window.close()
      }
    },
    [clear],
  )

  const copy = useCallback(
    async (offer: Pick<Offer, 'id' | 'code' | 'merchant' | 'targetUrl'>): Promise<boolean> => {
      if (!offer.code) return false
      const currentAttempt = ++attempt.current
      if (opening.current) {
        clearTimeout(opening.current.timer)
        opening.current.window.close()
        opening.current = null
      }
      let merchantWindow: Window | null = null
      try {
        const copied = navigator.clipboard.writeText(offer.code)
        // Reserve during the click; a new tab must not steal focus before the clipboard write starts.
        merchantWindow = window.open('about:blank', '_blank')
        if (merchantWindow) merchantWindow.opener = null
        await copied
      } catch {
        merchantWindow?.close()
        toast.error('Не удалось скопировать код', { description: 'Выделите код и скопируйте его вручную' })
        return false
      }
      if (currentAttempt !== attempt.current) {
        merchantWindow?.close()
        return false
      }
      clear()
      setCopiedId(offer.id)
      timer.current = setTimeout(() => {
        setCopiedId(null)
        timer.current = null
      }, RESET_MS)
      toast.success(`Код скопирован. ${merchantWindow ? 'Открываем' : 'Откройте'} ${offer.merchant.name}…`, {
        action: { label: 'Открыть магазин', href: offer.targetUrl },
      })
      if (merchantWindow) {
        const openTimer = setTimeout(() => {
          if (!merchantWindow.closed) merchantWindow.location.replace(offer.targetUrl)
          opening.current = null
        }, OPEN_MERCHANT_MS)
        opening.current = { timer: openTimer, window: merchantWindow }
      }
      return true
    },
    [clear],
  )

  return { copiedId, copy }
}
