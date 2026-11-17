import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { House, LayoutGrid, ShieldCheck } from '../Icon/icons.ts'
import { NavItem } from './NavItem.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/NavItem',
  component: NavItem,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { icon: LayoutGrid, href: '/catalog', children: 'Каталог', onClick: fn() },
})

export const Default = meta.story({})

export const Active = meta.story({
  args: { active: true, icon: House, href: '/', children: 'Главная' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
  },
})

export const DrawerSize = meta.story({
  args: { size: 'lg', icon: ShieldCheck, href: '/about/verification', children: 'Как мы проверяем' },
})

export const LongLabel = meta.story({
  args: {
    icon: ShieldCheck,
    href: '/about/verification',
    children: 'Как мы проверяем коды и бесплатные офферы',
  },
})

export const RenderLink = meta.story({
  args: {
    icon: LayoutGrid,
    renderLink: ({ className, children, ...rest }) => (
      <a className={className} href="/catalog/food" data-router-link {...rest}>
        {children}
      </a>
    ),
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Каталог' })
    await expect(link).toHaveAttribute('data-router-link')
    await expect(link).toHaveAttribute('href', '/catalog/food')
  },
})
