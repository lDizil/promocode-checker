import { onlineManager } from '@tanstack/react-query'
import { expect, fn, waitFor } from 'storybook/test'

import preview from '#.storybook/preview'

import { toast, Toaster } from '@/common/ui/Toast/index.ts'

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
  args: { onSubmitted: fn() },
  beforeEach({ msw }) {
    msw.use(...feedbackHandlers)
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Нет' }))
    await userEvent.click(await canvas.findByRole('radio', { name: FAIL_REASON_LABELS.expired }))
    await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
    await expect(await canvas.findByText(`Спасибо, разберёмся. Причина: ${FAIL_REASON_LABELS.expired}`)).toBeVisible()
    await expect(args.onSubmitted).toHaveBeenCalledTimes(1)
    await expect(args.onSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({ offer_id: 'o1', verdict: 'failed', reason: 'expired' }),
    )
  },
})

export const WorkedVote = meta.story({
  args: { onSubmitted: fn() },
  beforeEach({ msw }) {
    msw.use(...feedbackHandlers)
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Да' }))
    await expect(await canvas.findByText('Спасибо! Учли в шансе сработать')).toBeVisible()
    await expect(args.onSubmitted).toHaveBeenCalledTimes(1)
    await expect(args.onSubmitted).toHaveBeenCalledWith(expect.objectContaining({ offer_id: 'o1', verdict: 'worked' }))
  },
})

/** A failed vote made offline stays queued; it is sent, and only then confirmed, on reconnect. */
export const QueuedOffline = meta.story({
  args: { onSubmitted: fn() },
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
  beforeEach({ msw }) {
    msw.use(...feedbackHandlers)
  },
  play: async ({ args, canvas, userEvent }) => {
    onlineManager.setOnline(false)
    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Нет' }))
      await userEvent.click(await canvas.findByRole('radio', { name: FAIL_REASON_LABELS.expired }))
      await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
      await waitFor(() => {
        expect(canvas.getAllByText('Отправим, когда появится связь').length).toBeGreaterThanOrEqual(2)
      })
      await expect(
        canvas.queryByText(`Спасибо, разберёмся. Причина: ${FAIL_REASON_LABELS.expired}`),
      ).not.toBeInTheDocument()
      await expect(args.onSubmitted).not.toHaveBeenCalled()

      onlineManager.setOnline(true)
      await expect(await canvas.findByText(`Спасибо, разберёмся. Причина: ${FAIL_REASON_LABELS.expired}`)).toBeVisible()
      await expect(args.onSubmitted).toHaveBeenCalledTimes(1)
      await expect(args.onSubmitted).toHaveBeenCalledWith(
        expect.objectContaining({ offer_id: 'o1', verdict: 'failed', reason: 'expired' }),
      )
    } finally {
      onlineManager.setOnline(true)
      toast.dismiss()
    }
  },
})

export const EndedOffer = meta.story({
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Сработал?')).not.toBeInTheDocument()
  },
})
