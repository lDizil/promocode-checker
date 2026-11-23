import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { TabStrip } from './TabStrip.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=20-52615'

const meta = preview.meta({
  title: 'UI/TabStrip',
  component: TabStrip,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    label: 'Категории каталога',
    items: [
      { key: 'all', label: 'Все', active: false, render: <a href="/catalog" /> },
      { key: 'free', label: 'Бесплатно', active: true, render: <a href="/catalog/free" /> },
      { key: 'food', label: 'Еда и продукты', active: false, render: <a href="/catalog/food" /> },
      { key: 'marketplaces', label: 'Маркетплейсы', active: false, render: <a href="/catalog/marketplaces" /> },
    ],
  },
})

export const Default = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Бесплатно' })).toHaveAttribute('aria-current', 'page')
    await expect(canvas.getByRole('link', { name: 'Все' })).not.toHaveAttribute('aria-current')
  },
})
