import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Clock } from '../Icon/icons.ts'
import { TextField } from './TextField.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/TextField',
  component: TextField,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { label: 'Промокод', value: '', onValueChange: fn(), placeholder: 'SAMOKAT300' },
})

export const Placeholder = meta.story()

export const Filled = meta.story({ args: { value: 'SAMOKAT300' } })

export const Code = meta.story({ args: { kind: 'code', value: 'SAMOKAT300' } })

export const Focus = meta.story({
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Промокод' })
    await userEvent.click(input)
    await expect(input).toHaveFocus()
  },
})

export const Helper = meta.story({
  args: { value: 'SAMOKAT300', helper: 'Скидка применится в корзине' },
})

export const HelperHidden = meta.story({
  args: { value: 'SAMOKAT300', helper: 'Скидка применится в корзине', showHelper: false },
})

export const Error = meta.story({
  args: { value: 'SAMOKAT300', helper: 'Скидка применится в корзине', error: 'Такой код уже использован' },
})

export const Disabled = meta.story({
  args: { value: 'AUTUMN200', disabled: true, helper: 'Оффер завершён' },
})

export const Multiline = meta.story({
  args: {
    label: 'Коротко опишите',
    value: '',
    placeholder: 'Например: скидка не применилась к заказу',
    multiline: true,
    maxLength: 200,
    helper: 'Необязательно, до 200 символов',
  },
})

export const TrailingIcon = meta.story({
  args: { label: 'Дата', value: '', placeholder: 'дд.мм.гггг', trailingIcon: Clock },
})

export const TrailingText = meta.story({
  args: { label: 'Минимальная сумма', value: '1 500', trailing: '₽' },
})

function CodeDemo() {
  const [value, setValue] = useState('')
  return <TextField label="Промокод" kind="code" value={value} onValueChange={setValue} placeholder="SAMOKAT300" />
}

export const UpperCaseInput = meta.story({
  render: () => <CodeDemo />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Промокод' })
    await userEvent.type(input, 'samokat300')
    await expect(input).toHaveValue('SAMOKAT300')
  },
})
