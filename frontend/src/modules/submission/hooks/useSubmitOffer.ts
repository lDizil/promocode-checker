import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { ApiError } from '@/common/http.ts'
import { toast } from '@/common/ui/Toast/index.ts'

import { submitOfferMutationOptions, type SubmittedOffer } from '../api/submission.mutations.ts'
import { toSubmissionRequest, type SubmissionFormValues } from '../model/schema.ts'

export interface UseSubmitOfferResult {
  submit: (values: SubmissionFormValues) => void
  pending: boolean
  rateLimited: boolean
  submittedResult: SubmittedOffer | null
  reset: () => void
}

export function useSubmitOffer(): UseSubmitOfferResult {
  const [submittedResult, setSubmittedResult] = useState<SubmittedOffer | null>(null)
  const [rateLimited, setRateLimited] = useState(false)
  const submittingRef = useRef(false)

  const mutation = useMutation({
    ...submitOfferMutationOptions(),
    onSuccess: (data) => {
      setRateLimited(false)
      setSubmittedResult(data)
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 429) {
        setRateLimited(true)
        return
      }
      toast.error('Не отправилось. Попробуйте ещё раз')
    },
    onSettled: () => {
      submittingRef.current = false
    },
  })

  const submit = (values: SubmissionFormValues) => {
    if (submittingRef.current || mutation.isPending) return
    const payload = toSubmissionRequest(values)
    submittingRef.current = true
    setRateLimited(false)
    mutation.mutate(payload)
  }

  const reset = () => {
    submittingRef.current = false
    setSubmittedResult(null)
    setRateLimited(false)
    mutation.reset()
  }

  return {
    submit,
    pending: mutation.isPending,
    rateLimited,
    submittedResult,
    reset,
  }
}
