import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { IconButton } from '../Button/Button.tsx'
import { Menu } from '../Icon/icons.ts'
import { Drawer, type DrawerProps } from './Drawer.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Drawer',
  component: Drawer,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { open: false, side: 'start' as const, label: 'Меню', onOpenChange: fn(), children: null },
  render: (args) => <DrawerDemo {...args} />,
})

function DrawerDemo(args: DrawerProps) {
  const [open, setOpen] = useState(args.open)

  return (
    <div style={{ padding: 16 }}>
      <h1 className="visually-hidden">Drawer</h1>
      <IconButton icon={Menu} label="Открыть меню" onClick={() => setOpen(true)} />
      <Drawer
        {...args}
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          args.onOpenChange(next)
        }}
      >
        <nav aria-label="Меню" style={{ display: 'grid', gap: 4, padding: 24 }}>
          <a href="/">Главная</a>
          <a href="/catalog">Каталог</a>
          <a href="/about/verification">Как мы проверяем</a>
        </nav>
      </Drawer>
    </div>
  )
}

export const Left = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Открыть меню' }))
    const dialog = await canvas.findByRole('dialog', { name: 'Меню' })
    await expect(dialog).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Каталог' })).toBeVisible()
  },
})

export const Right = meta.story({
  args: { side: 'end', label: 'Корзина', open: true },
})

export const Bottom = meta.story({
  args: { side: 'bottom', label: 'Фильтры', open: true },
})

export const Top = meta.story({
  args: { side: 'top', label: 'Уведомления', open: true },
})
