import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { RadioGroup } from './Radio.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const REASONS = [
  { value: 'expired', label: 'Код истёк или не существует' },
  { value: 'min-order', label: 'Не подошла сумма заказа' },
  { value: 'products', label: 'Не подошли товары или категория' },
  { value: 'other', label: 'Другое' },
] as const

const meta = preview.meta({
  title: 'UI/Radio',
  component: RadioGroup,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { options: REASONS, value: 'expired', onValueChange: fn(), label: 'Причина' },
})

export const Default = meta.story()

export const NothingSelected = meta.story({ args: { value: null } })

export const DisabledGroup = meta.story({ args: { disabled: true } })

export const OneDisabledOption = meta.story({
  args: {
    options: REASONS.map((reason) => (reason.value === 'products' ? { ...reason, disabled: true } : reason)),
  },
})

export const LongLabels = meta.story({
  args: {
    options: [
      {
        value: 'long',
        label: 'Скидка не применилась, потому что заказ не дотянул до минимальной суммы, указанной в условиях акции',
      },
      { value: 'short', label: 'Другое' },
    ],
    value: 'long',
  },
})

function Demo() {
  const [value, setValue] = useState<string | null>(null)
  return <RadioGroup options={REASONS} value={value} onValueChange={setValue} label="Причина" />
}

export const Selection = meta.story({
  render: () => <Demo />,
  play: async ({ canvas, userEvent }) => {
    const expired = canvas.getByRole('radio', { name: 'Код истёк или не существует' })
    const minOrder = canvas.getByRole('radio', { name: 'Не подошла сумма заказа' })
    await expect(expired).not.toBeChecked()
    await userEvent.click(minOrder)
    await expect(minOrder).toBeChecked()
    await expect(expired).not.toBeChecked()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('radio', { name: 'Не подошли товары или категория' })).toBeChecked()
  },
})
