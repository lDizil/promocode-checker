import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { SearchField, type SearchFieldProps } from './SearchField.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/SearchField',
  component: SearchField,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { value: '', onChange: fn(), onSubmit: fn() },
  render: (args) => <ControlledSearchField {...args} />,
})

function ControlledSearchField(args: SearchFieldProps) {
  const [value, setValue] = useState(args.value)

  return (
    <SearchField
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next)
        args.onChange(next)
      }}
    />
  )
}

const submit = fn()

export const Default = meta.story({
  args: { onSubmit: submit },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('searchbox', { name: 'Поиск по магазинам и сервисам' })
    await userEvent.type(input, 'Самокат')
    await expect(input).toHaveValue('Самокат')
    await expect(canvas.getByRole('button', { name: 'Очистить' })).toBeVisible()
    await userEvent.keyboard('{Enter}')
    await expect(submit).toHaveBeenCalledWith('Самокат')
  },
})

export const Clear = meta.story({
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('searchbox')
    await userEvent.type(input, 'Ozon')
    await userEvent.click(canvas.getByRole('button', { name: 'Очистить' }))
    await expect(input).toHaveValue('')
    await expect(input).toHaveFocus()
    await expect(canvas.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
  },
})

export const KeyboardClear = meta.story({
  args: { value: 'Самокат', onChange: fn(), onSubmit: fn() },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('searchbox')
    await userEvent.click(input)
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Очистить' })).toHaveFocus()
    await userEvent.keyboard(' ')
    await expect(input).toHaveValue('')
    await expect(input).toHaveFocus()
    await expect(args.onChange).toHaveBeenCalledWith('')
    await expect(args.onSubmit).not.toHaveBeenCalled()
  },
})

export const Large = meta.story({
  args: { size: 'lg', placeholder: 'Магазин или сервис, например Самокат' },
})

export const BareTopbar = meta.story({
  args: { variant: 'bare', size: 'md' },
})

export const Filled = meta.story({
  args: { value: 'Яндекс Еда' },
})

export const LongPlaceholder = meta.story({
  args: { placeholder: 'Очень длинный плейсхолдер, который должен обрезаться, а не ломать шапку' },
})
