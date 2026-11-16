import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Checkbox } from './Checkbox.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { label: 'Только с бесплатной доставкой' },
})

export const Unchecked = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Только с бесплатной доставкой' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  },
})

export const Checked = meta.story({ args: { defaultChecked: true } })

export const Indeterminate = meta.story({ args: { defaultChecked: 'indeterminate' } })

export const Disabled = meta.story({ args: { disabled: true, defaultChecked: true } })

export const LongLabel = meta.story({
  args: {
    label:
      'Согласен получать письма о новых промокодах и бесплатных офферах не чаще одного раза в неделю, а также с политикой конфиденциальности',
  },
})

const onCheckedChange = fn()

function Demo() {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox
      label="Показывать завершённые офферы"
      checked={checked}
      onCheckedChange={(next) => {
        onCheckedChange(next)
        setChecked(next === true)
      }}
    />
  )
}

export const Interactive = meta.story({
  render: () => <Demo />,
  play: async ({ canvas, userEvent }) => {
    onCheckedChange.mockClear()
    const checkbox = canvas.getByRole('checkbox', { name: 'Показывать завершённые офферы' })
    await userEvent.click(checkbox)
    await expect(checkbox).toHaveAttribute('aria-checked', 'true')
    await expect(onCheckedChange).toHaveBeenLastCalledWith(true)
  },
})
