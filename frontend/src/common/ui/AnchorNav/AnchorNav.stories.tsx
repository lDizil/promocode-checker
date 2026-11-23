import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { AnchorNav } from './AnchorNav.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=20-13903'

const ITEMS = [
  { id: 'code', label: 'Код' },
  { id: 'reliability', label: 'Надёжность' },
  { id: 'conditions', label: 'Условия' },
  { id: 'source', label: 'Источник' },
  { id: 'history', label: 'История' },
]

const meta = preview.meta({
  title: 'UI/AnchorNav',
  component: AnchorNav,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { items: ITEMS, activeId: 'reliability' },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    const active = canvas.getByRole('link', { name: 'Надёжность' })
    await expect(active).toHaveAttribute('aria-current', 'location')
    await expect(active).toHaveAttribute('href', '#reliability')
  },
})
