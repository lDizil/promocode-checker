import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Autocomplete, type AutocompleteGroupData } from './Autocomplete.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=20-24579'

const GROUPS: AutocompleteGroupData[] = [
  {
    key: 'merchants',
    options: [
      { value: 'samokat', label: 'Самокат', subtitle: '4 проверенных оффера' },
      { value: 'yandex-eda', label: 'Яндекс Еда', subtitle: '3 проверенных оффера' },
    ],
  },
]

const selectOption = fn()

const meta = preview.meta({
  title: 'UI/Autocomplete',
  component: Autocomplete,
  parameters: { design: { type: 'figma', url: FIGMA } },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return (
      <div style={{ maxWidth: 480, minHeight: 260 }}>
        <Autocomplete
          {...args}
          value={value}
          onValueChange={(next, reason) => {
            setValue(next)
            args.onValueChange(next, reason)
          }}
        />
      </div>
    )
  },
  args: {
    value: '',
    onValueChange: fn(),
    onOptionSelect: selectOption,
    groups: GROUPS,
    footer: '↑↓ — выбор · Enter — перейти · Esc — закрыть',
  },
})

export const Default = meta.story({
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    const item = await canvas.findByText('Самокат')
    await expect(item).toBeVisible()
    await userEvent.click(item)
    await expect(selectOption).toHaveBeenCalledTimes(1)
  },
})

export const FieldVariant = meta.story({
  args: {
    variant: 'field' as const,
    label: 'Магазин или сервис',
    placeholder: 'Начните вводить название',
    helper: 'Выберите магазин из списка или введите новый',
  },
})
