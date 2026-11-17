import { expect } from 'storybook/test'

import preview from '#.storybook/preview'

import { Gift, Globe, GraduationCap, LayoutGrid, Percent, Wallet } from '../Icon/icons.ts'
import { CategoryChip } from './CategoryChip.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/CategoryChip',
  component: CategoryChip,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { icon: LayoutGrid, children: 'Еда и продукты', href: '/c/food' },
})

export const Default = meta.story({})

export const AllCategories = meta.story({
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      <CategoryChip icon={LayoutGrid} href="/c/food">
        Еда и продукты
      </CategoryChip>
      <CategoryChip icon={Percent} href="/c/marketplaces">
        Маркетплейсы
      </CategoryChip>
      <CategoryChip icon={Wallet} href="/c/clothes">
        Одежда
      </CategoryChip>
      <CategoryChip icon={GraduationCap} href="/c/subscriptions">
        Подписки
      </CategoryChip>
      <CategoryChip icon={Globe} href="/c/travel">
        Путешествия
      </CategoryChip>
      <CategoryChip icon={Gift} href="/c/dev">
        Облака и dev
      </CategoryChip>
    </div>
  ),
  play: async ({ canvas }) => {
    await canvas.findByRole('link', { name: 'Облака и dev' })
  },
})

export const RouterLinkRender = meta.story({
  args: { render: <a href="/c/dev" data-router-link="" />, href: undefined, children: 'Облака и dev', icon: Gift },
  play: async ({ canvas }) => {
    const link = await canvas.findByRole('link', { name: 'Облака и dev' })
    await expect(link).toHaveAttribute('data-router-link', '')
  },
})

export const LongLabel = meta.story({
  args: { children: 'Подписки на сервисы и доставку еды', icon: GraduationCap },
})
