import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { CategoryTile } from './CategoryTile.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=13-361'

const meta = preview.meta({
  title: 'UI/CategoryTile',
  component: CategoryTile,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    number: '01',
    title: 'Еда и продукты',
    tone: 'light' as const,
    illustration: 'grocery-bag' as const,
    href: '/catalog/food',
  },
})

export const Light = meta.story({
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: /Еда и продукты/ })
    await expect(link).toHaveAttribute('href', '/catalog/food')
  },
})

export const Yellow = meta.story({
  args: {
    number: '02',
    title: 'Маркет-\nплейсы',
    tone: 'yellow' as const,
    illustration: 'parcel' as const,
    href: '/catalog/marketplaces',
  },
})

export const Purple = meta.story({
  args: {
    number: '03',
    title: 'Бесплатно',
    tone: 'purple' as const,
    illustration: 'cloud-coin' as const,
    href: '/catalog/free',
  },
})

export const Trio = meta.story({
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <CategoryTile number="01" title="Еда и продукты" tone="light" illustration="grocery-bag" href="/catalog/food" />
      <CategoryTile
        number="02"
        title={'Маркет-\nплейсы'}
        tone="yellow"
        illustration="parcel"
        href="/catalog/marketplaces"
      />
      <CategoryTile number="03" title="Бесплатно" tone="purple" illustration="cloud-coin" href="/catalog/free" />
    </div>
  ),
})
