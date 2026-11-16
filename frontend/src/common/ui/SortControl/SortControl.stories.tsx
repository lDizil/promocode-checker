import { useState } from 'react'
import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { SortControl, type SortOption } from './SortControl.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const OPTIONS: SortOption[] = [
  { value: 'reliable', label: 'Сначала надёжные' },
  { value: 'beneficial', label: 'Сначала выгодные' },
  { value: 'fresh', label: 'Сначала свежие' },
  { value: 'ending', label: 'Скоро закончатся' },
]

const meta = preview.meta({
  title: 'UI/SortControl',
  component: SortControl,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { options: OPTIONS, value: 'reliable', onChange: () => {} },
})

export const Default = meta.story({})

function Demo() {
  const [value, setValue] = useState('reliable')

  return <SortControl value={value} options={OPTIONS} onChange={setValue} />
}

export const Interactive = meta.story({
  render: () => <Demo />,
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Сортировка: Сначала надёжные' })
    await userEvent.click(trigger)
    await userEvent.click(await canvas.findByRole('menuitemradio', { name: 'Сначала выгодные' }))
    await expect(canvas.getByRole('button', { name: 'Сортировка: Сначала выгодные' })).toBeVisible()
  },
})

export const SelectedOther = meta.story({ args: { value: 'fresh' } })

export const LongOption = meta.story({
  args: {
    options: [
      { value: 'reliable', label: 'Сначала надёжные, проверенные за последние сутки' },
      { value: 'beneficial', label: 'Сначала выгодные по размеру скидки' },
    ],
    value: 'beneficial',
  },
})
