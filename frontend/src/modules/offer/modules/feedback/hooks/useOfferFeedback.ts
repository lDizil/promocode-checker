import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import { logger } from '@/common/logger.ts'
import { toast } from '@/common/ui/Toast/index.ts'

import type { FailReason, FeedbackRequest, FeedbackResponse } from '../api/feedback.dto.ts'
import { feedbackMutationOptions } from '../api/feedback.mutations.ts'
import { FAIL_REASON_LABELS, type FailReasonInput } from '../model/reasons.ts'

export type OfferFeedbackState = 'idle' | 'sent-success' | 'sent-fail'

const THANK_YOU_MS = 3000
const QUEUED_MESSAGE = 'Отправим, когда появится связь'

export interface OfferFeedbackController {
  state: OfferFeedbackState
  /** True while the «Спасибо! Учли в шансе сработать» line is shown; settles after 3 s. */
  fresh: boolean
  /** True while the mutation is paused by TanStack Query until the connection returns. */
  queued: boolean
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
export function useOfferFeedback(
  offerId: string,
  onSubmitted?: (response: FeedbackResponse) => void,
): OfferFeedbackController {
  const queryClient = useQueryClient()
  const [state, setState] = useState<OfferFeedbackState>('idle')
  const [fresh, setFresh] = useState(false)
  const [reason, setReason] = useState<FailReason | null>(null)
  const [sheetOpen, setSheetOpenState] = useState(false)
  const submittingRef = useRef(false)
  const queuedNoticeRef = useRef<number | null>(null)
  const onSubmittedRef = useRef(onSubmitted)

  useEffect(() => {
    onSubmittedRef.current = onSubmitted
  }, [onSubmitted])

  const options = feedbackMutationOptions(queryClient, offerId)
  const mutation = useMutation<FeedbackResponse, Error, FeedbackRequest>({
    ...options,
    // Keep the shared invalidation, then settle the local verdict and notify the page.
    onSuccess: async (response, variables, onMutateResult, context) => {
      await options.onSuccess?.(response, variables, onMutateResult, context)
      if (variables.verdict === 'worked') {
        setState('sent-success')
        setFresh(true)
        setReason(null)
      } else {
        setReason(response.reason ?? variables.reason ?? null)
        setState('sent-fail')
        setFresh(false)
        setSheetOpenState(false)
      }
      try {
        onSubmittedRef.current?.(response)
      } catch (error) {
        logger.error('OfferFeedback onSubmitted failed', { error })
      }
    },
    onSettled: () => {
      submittingRef.current = false
    },
  })

  useEffect(() => {
    if (!mutation.isPaused || queuedNoticeRef.current === mutation.submittedAt) return
    queuedNoticeRef.current = mutation.submittedAt
    toast.info(QUEUED_MESSAGE)
  }, [mutation.isPaused, mutation.submittedAt])

  useEffect(() => {
    if (!fresh) return
    const timer = setTimeout(() => setFresh(false), THANK_YOU_MS)
    return () => clearTimeout(timer)
  }, [fresh])

  const beginSubmit = () => {
    if (submittingRef.current || mutation.isPending) return false
    submittingRef.current = true
    return true
  }

  const submitWorked = () => {
    if (!beginSubmit()) return
    setReason(null)
    mutation.mutate({ verdict: 'worked' })
  }

  const submitFailed = (input: FailReasonInput) => {
    if (!beginSubmit()) return
    const comment = input.comment?.trim()
    setReason(input.reason)
    mutation.mutate({ verdict: 'failed', reason: input.reason, ...(comment ? { comment } : {}) })
  }

  const setSheetOpen = (open: boolean) => {
    if (open && !mutation.isPending) mutation.reset()
    setSheetOpenState(open)
  }

  const change = () => {
    setState('idle')
    setFresh(false)
    setReason(null)
    submittingRef.current = false
    mutation.reset()
  }

  return {
    state,
    fresh,
    queued: mutation.isPaused,
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
