import preview, { STORY_NOW } from '#.storybook/preview'

import { samokatOffers } from '../api/offer.mocks.ts'
import { toOffer } from '../model/offer.ts'
import { VerifiedMeta } from './VerifiedMeta.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const offers = samokatOffers(STORY_NOW).map(toOffer)

const meta = preview.meta({
  title: 'Offer/VerifiedMeta',
  component: VerifiedMeta,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { offer: offers[0]!, now: STORY_NOW },
})

export const Fresh = meta.story({})

export const CrowdReviewed = meta.story({ args: { offer: offers[1]! } })

export const Stale = meta.story({
  args: {
    offer: {
      verification: {
        lastCheckedAt: new Date('2026-11-01T09:00:00+03:00'),
        method: 'manual',
        score: 74,
        success7d: 12,
        fail7d: 3,
      },
    },
  },
})

export const NeverChecked = meta.story({ args: { offer: offers[4]! } })

export const UnknownMethod = meta.story({
  args: {
    offer: {
      verification: { lastCheckedAt: null, method: null, score: null, success7d: 4, fail7d: 2 },
    },
  },
})
