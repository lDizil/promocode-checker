import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { FAIL_REASON_LABELS } from '../model/reasons.ts'
import { FeedbackBar } from './FeedbackBar.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/FeedbackBar',
  component: FeedbackBar,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { onWorked: fn(), onFailed: fn(), onChange: fn() },
})

export const Idle = meta.story({})

export const Pending = meta.story({ args: { pending: true } })

export const SentSuccessFresh = meta.story({ args: { state: 'sent-success', fresh: true } })

export const SentSuccessSettled = meta.story({ args: { state: 'sent-success' } })

export const SentFail = meta.story({ args: { state: 'sent-fail', reasonLabel: FAIL_REASON_LABELS.expired } })

export const SentFailWithoutReason = meta.story({ args: { state: 'sent-fail' } })

export const Votes = meta.story({
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Да' }))
    await expect(args.onWorked).toHaveBeenCalledTimes(1)
    await userEvent.click(canvas.getByRole('button', { name: 'Нет' }))
    await expect(args.onFailed).toHaveBeenCalledTimes(1)
  },
})

export const Disabled = meta.story({
  args: { state: 'disabled' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Сработал?')).not.toBeInTheDocument()
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
  },
})
