import { useCallback, useEffect, useRef, useState } from 'react'

import type { Offer } from '../model/offer.ts'

const RESET_MS = 2000

export interface CopyCodeResult {
  /** Id of the offer copied last; `null` once the 2 s reset has passed. */
  copiedId: string | null
  copy: (offer: Pick<Offer, 'id' | 'code'>) => void
}

/** DESIGN_SPEC 3.12: clipboard write plus the 2 s «Скопировано» timer. */
export function useCopyCode(): CopyCodeResult {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clear = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => clear, [clear])

  const copy = useCallback(
    (offer: Pick<Offer, 'id' | 'code'>) => {
      if (!offer.code) return
      void navigator.clipboard
        .writeText(offer.code)
        .then(() => {
          clear()
          setCopiedId(offer.id)
          timer.current = setTimeout(() => {
            setCopiedId(null)
            timer.current = null
          }, RESET_MS)
        })
        .catch(() => {
          // A blocked clipboard (insecure origin, denied permission) keeps the card in `default`.
        })
    },
    [clear],
  )

  return { copiedId, copy }
}
