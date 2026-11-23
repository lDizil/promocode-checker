import { mutationOptions } from '@tanstack/react-query'

import { apiSend } from '@/common/http.ts'
import { createQueryKeys } from '@/common/query-keys.ts'

import { submissionResponseDto, type SubmissionRequest, type SubmissionResponse } from './submission.dto.ts'

const keys = createQueryKeys('submission')

export interface SubmittedOffer {
  id: string
  status: 'pending'
  merchantName: string
  merchantSlug: string | null
}

export function toSubmittedOffer(dto: SubmissionResponse): SubmittedOffer {
  return {
    id: dto.id,
    status: dto.status,
    merchantName: dto.merchant_name,
    merchantSlug: dto.merchant_slug,
  }
}

export function submitOfferMutationOptions() {
  return mutationOptions({
    mutationKey: keys.of('create'),
    networkMode: 'online',
    mutationFn: async (payload: SubmissionRequest): Promise<SubmittedOffer> => {
      const dto = await apiSend('POST', '/submissions', payload, submissionResponseDto)
      return toSubmittedOffer(dto)
    },
  })
}
