import { expect, fn, waitFor } from 'storybook/test'

import preview from '#.storybook/preview'

import { FailReasonSheet } from './FailReasonSheet.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/FailReasonSheet',
  component: FailReasonSheet,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { open: true, onOpenChange: fn(), onSubmit: fn() },
})

export const Open = meta.story()

export const Submitting = meta.story({ args: { pending: true } })

export const ServerError = meta.story({ args: { error: 'Не удалось отправить. Попробуйте ещё раз.' } })

export const OtherSelected = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Другое' }))
    await expect(canvas.getByRole('textbox', { name: 'Коротко опишите' })).toBeVisible()
  },
})

export const Validation = meta.story({
  play: async ({ args, canvas, userEvent }) => {
    const submit = canvas.getByRole('button', { name: 'Отправить' })
    await expect(submit).toBeDisabled()
    await userEvent.click(canvas.getByRole('radio', { name: 'Код истёк или не существует' }))
    await expect(submit).toBeEnabled()
    await userEvent.click(submit)
    await waitFor(() => expect(args.onSubmit).toHaveBeenCalledWith({ reason: 'expired' }))
  },
})

export const Comment = meta.story({
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Другое' }))
    await userEvent.type(canvas.getByRole('textbox', { name: 'Коротко опишите' }), 'Скидка не применилась')
    await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
    await waitFor(() =>
      expect(args.onSubmit).toHaveBeenCalledWith({ reason: 'other', comment: 'Скидка не применилась' }),
    )
  },
})
