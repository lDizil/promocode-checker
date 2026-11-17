import { mutationOptions, type QueryClient } from '@tanstack/react-query'

import { apiSend } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { feedbackResponseDto, type FeedbackRequest } from './feedback.dto.ts'

// The offer module owns the `offer` key scope; feedback changes the offer's score, so the root is refreshed.
const offerKeyRoot = createQueryKeys('offer').all

export function feedbackMutationOptions(queryClient: QueryClient, offerId: string) {
  return mutationOptions({
    mutationKey: ['offer', 'feedback', offerId],
    networkMode: 'online',
    mutationFn: (feedback: FeedbackRequest) =>
      apiSend('POST', `/offers/${encodeURIComponent(offerId)}/feedback`, feedback, feedbackResponseDto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: offerKeyRoot }),
  })
}
