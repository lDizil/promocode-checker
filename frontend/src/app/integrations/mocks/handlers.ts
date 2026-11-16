import { merchantHandlers } from '@/modules/merchant/mocks.ts'
import { feedbackHandlers, offerHandlers } from '@/modules/offer/mocks.ts'

// Specific routes first: /merchants/:slug/offers must win over /merchants/:slug.
export const handlers = [...feedbackHandlers, ...offerHandlers, ...merchantHandlers]
