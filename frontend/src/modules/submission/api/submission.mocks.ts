import { delay, http, HttpResponse } from 'msw'

import { allMockOffers } from '@/modules/offer/mocks.ts'

import { submissionRequestDto } from './submission.dto.ts'

const SUBMIT_DELAY_MS = 250

export const submissionHandlers = [
  http.get('*/api/offers/check-duplicate', ({ request }) => {
    const url = new URL(request.url)
    const merchant = url.searchParams.get('merchant')?.trim().toLowerCase() ?? ''
    const code = url.searchParams.get('code')?.trim().toUpperCase() ?? ''

    if (!merchant || !code) {
      return HttpResponse.json({ duplicate: null })
    }

    const match = allMockOffers(new Date()).find(
      (offer) =>
        offer.code?.toUpperCase() === code &&
        (offer.merchant.slug.toLowerCase() === merchant || offer.merchant.name.toLowerCase() === merchant),
    )

    if (!match || !match.code) {
      return HttpResponse.json({ duplicate: null })
    }

    return HttpResponse.json({
      duplicate: {
        id: match.id,
        merchant_slug: match.merchant.slug,
        code: match.code,
        score: match.verification.score,
        last_checked_at: match.verification.last_checked_at,
      },
    })
  }),

  http.post('*/api/submissions', async ({ request }) => {
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return HttpResponse.json({ message: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = submissionRequestDto.safeParse(body)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid submission', issues: parsed.error.issues }, { status: 422 })
    }

    const code = parsed.data.code.trim().toUpperCase()
    if (code === 'ERROR500') {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
    if (code === 'LIMIT429') {
      return HttpResponse.json({ message: 'Too many requests' }, { status: 429 })
    }

    await delay(SUBMIT_DELAY_MS)
    return HttpResponse.json(
      {
        id: 'sub-1',
        status: 'pending',
        merchant_name: parsed.data.merchant_name,
        merchant_slug: parsed.data.merchant_slug,
      },
      { status: 201 },
    )
  }),
]
