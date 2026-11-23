import { merchantHandlers } from '@/modules/merchant/mocks.ts'
import { feedbackHandlers, offerHandlers } from '@/modules/offer/mocks.ts'
import { searchHandlers } from '@/modules/search/mocks.ts'
import { submissionHandlers } from '@/modules/submission/mocks.ts'

// Specific routes first: /api/offers/check-duplicate & /api/offers/recent before /api/offers/:id,
// and /merchants/:slug/offers before /merchants/:slug.
export const handlers = [
  ...searchHandlers,
  ...submissionHandlers,
  ...feedbackHandlers,
  ...offerHandlers,
  ...merchantHandlers,
]
