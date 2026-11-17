import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { CodeBox } from './CodeBox.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Offer/CodeBox',
  component: CodeBox,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { code: 'SAMOKAT300', state: 'default' as const, onCopy: fn() },
})

export const Default = meta.story({})

export const Copied = meta.story({ args: { state: 'copied' } })

export const Disabled = meta.story({ args: { state: 'disabled', code: 'AUTUMN200' } })

export const LongCode = meta.story({ args: { code: 'SUPERMEGALONGPROMOCODE2026' } })

export const Copy = meta.story({
  args: { onCopy: fn() },
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Промокод S A M O K A T 3 0 0. Копировать' }))
    await expect(args.onCopy).toHaveBeenCalledTimes(1)
  },
})
