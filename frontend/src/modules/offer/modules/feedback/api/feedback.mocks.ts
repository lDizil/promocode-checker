import { http, HttpResponse } from 'msw'

import { feedbackRequestDto, type FeedbackRequest, type FeedbackResponse } from './feedback.dto.ts'

/** Plausible recalculated score: a «worked» vote raises it, a failure lowers it (DESIGN_SPEC 3.13). */
export function makeFeedbackResponse(offerId: string, feedback: FeedbackRequest): FeedbackResponse {
  return {
    offer_id: offerId,
    verdict: feedback.verdict,
    reason: feedback.reason ?? null,
    score: feedback.verdict === 'worked' ? 86 : 74,
  }
}

export const feedbackHandlers = [
  http.post('*/api/offers/:id/feedback', async ({ params, request }) => {
    const parsed = feedbackRequestDto.safeParse(await request.json())
    if (!parsed.success) return HttpResponse.json({ message: 'Invalid feedback' }, { status: 422 })
    return HttpResponse.json(makeFeedbackResponse(String(params['id']), parsed.data))
  }),
]
