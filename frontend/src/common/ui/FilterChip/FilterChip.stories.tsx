import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Filter } from '../Icon/icons.ts'
import { FilterChip } from './FilterChip.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'
const clickSpy = fn()

const meta = preview.meta({
  title: 'UI/FilterChip',
  component: FilterChip,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { children: 'Промокоды' },
})

export const Default = meta.story({
  args: { kind: 'toggle' },
})

export const Selected = meta.story({
  args: { kind: 'toggle', selected: true },
})

export const FiltersCounter = meta.story({
  args: { children: 'Фильтры', icon: Filter, kind: 'dropdown', count: 2, onClick: clickSpy },
  play: async ({ canvas, userEvent }) => {
    clickSpy.mockClear()
    const chip = canvas.getByRole('button', { name: 'Фильтры · 2' })
    await expect(chip).toHaveAttribute('aria-haspopup', 'dialog')
    await userEvent.click(chip)
    await expect(clickSpy).toHaveBeenCalledOnce()
  },
})

export const FiltersEmptyCounter = meta.story({
  args: { children: 'Фильтры', icon: Filter, kind: 'dropdown', count: 0 },
})

export const DropdownSelected = meta.story({
  args: { children: 'Есть подвох', kind: 'dropdown', selected: true },
})

export const Row = meta.story({
  render: () => (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', maxWidth: 360 }}>
      <FilterChip kind="dropdown" icon={Filter} count={2}>
        Фильтры
      </FilterChip>
      <FilterChip>Промокоды</FilterChip>
      <FilterChip>Акции</FilterChip>
      <FilterChip>Новым клиентам</FilterChip>
      <FilterChip>Постоянным</FilterChip>
    </div>
  ),
})

export const ToggleInteractive = meta.story({
  render: () => {
    const [selected, setSelected] = useState(false)
    return (
      <FilterChip selected={selected} onSelectedChange={setSelected}>
        Промокоды
      </FilterChip>
    )
  },
  play: async ({ canvas, userEvent }) => {
    const chip = canvas.getByRole('button', { name: 'Промокоды' })
    await userEvent.click(chip)
    await expect(chip).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(chip)
    await expect(chip).toHaveAttribute('aria-pressed', 'false')
  },
})

export const Disabled = meta.story({
  args: { kind: 'toggle', disabled: true },
})

export const LongLabel = meta.story({
  args: { children: 'Только для новых клиентов с заказом от 1 500 ₽' },
})
