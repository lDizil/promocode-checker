import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import type { FailReason } from '../api/feedback.dto.ts'
import { feedbackMutationOptions } from '../api/feedback.mutations.ts'
import { FAIL_REASON_LABELS, type FailReasonInput } from '../model/reasons.ts'

export type OfferFeedbackState = 'idle' | 'sent-success' | 'sent-fail'

const THANK_YOU_MS = 3000

export interface OfferFeedbackController {
  state: OfferFeedbackState
  /** True while the «Спасибо! Учли в шансе сработать» line is shown; settles after 3 s. */
  fresh: boolean
  reason: FailReason | null
  reasonLabel: string | null
  sheetOpen: boolean
  pending: boolean
  error: string | null
  setSheetOpen: (open: boolean) => void
  submitWorked: () => void
  submitFailed: (input: FailReasonInput) => void
  change: () => void
}

/**
 * DESIGN_SPEC 5.2: idle → sent-success / sent-fail, with `FailReasonSheet` on the «Нет» path.
 * State belongs to one offer: render the owner with `key={offerId}` to start a new verdict on an offer swap.
 */
export function useOfferFeedback(offerId: string): OfferFeedbackController {
  const queryClient = useQueryClient()
  const [state, setState] = useState<OfferFeedbackState>('idle')
  const [fresh, setFresh] = useState(false)
  const [reason, setReason] = useState<FailReason | null>(null)
  const [sheetOpen, setSheetOpenState] = useState(false)
  const mutation = useMutation(feedbackMutationOptions(queryClient, offerId))

  useEffect(() => {
    if (!fresh) return
    const timer = setTimeout(() => setFresh(false), THANK_YOU_MS)
    return () => clearTimeout(timer)
  }, [fresh])

  const submitWorked = () => {
    if (mutation.isPending) return
    mutation.mutate(
      { verdict: 'worked' },
      {
        onSuccess: () => {
          setState('sent-success')
          setFresh(true)
          setReason(null)
        },
      },
    )
  }

  const submitFailed = (input: FailReasonInput) => {
    if (mutation.isPending) return
    const comment = input.comment?.trim()
    mutation.mutate(
      { verdict: 'failed', reason: input.reason, ...(comment ? { comment } : {}) },
      {
        onSuccess: (response) => {
          setReason(response.reason ?? input.reason)
          setState('sent-fail')
          setFresh(false)
          setSheetOpenState(false)
        },
      },
    )
  }

  const setSheetOpen = (open: boolean) => {
    if (open) mutation.reset()
    setSheetOpenState(open)
  }

  const change = () => {
    setState('idle')
    setFresh(false)
    setReason(null)
    mutation.reset()
  }

  return {
    state,
    fresh,
    reason,
    reasonLabel: reason === null ? null : FAIL_REASON_LABELS[reason],
    sheetOpen,
    pending: mutation.isPending,
    error: mutation.isError ? 'Не удалось отправить. Попробуйте ещё раз.' : null,
    setSheetOpen,
    submitWorked,
    submitFailed,
    change,
  }
}
