import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { feedbackHandlers } from '../api/feedback.mocks.ts'
import { FAIL_REASON_LABELS } from '../model/reasons.ts'
import { OfferFeedback } from './OfferFeedback.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/OfferFeedback',
  component: OfferFeedback,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { offerId: 'o1' },
})

/** DESIGN_SPEC 5.2 end-to-end: «Нет» → причина → «Отправить» → `sent-fail`. */
export const FailedVote = meta.story({
  beforeEach({ msw }) {
    msw.use(...feedbackHandlers)
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Нет' }))
    await userEvent.click(await canvas.findByRole('radio', { name: FAIL_REASON_LABELS.expired }))
    await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
    await expect(await canvas.findByText(`Спасибо, разберёмся. Причина: ${FAIL_REASON_LABELS.expired}`)).toBeVisible()
  },
})

export const WorkedVote = meta.story({
  beforeEach({ msw }) {
    msw.use(...feedbackHandlers)
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Да' }))
    await expect(await canvas.findByText('Спасибо! Учли в шансе сработать')).toBeVisible()
  },
})

export const EndedOffer = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Сработал?')).not.toBeInTheDocument()
  },
})
