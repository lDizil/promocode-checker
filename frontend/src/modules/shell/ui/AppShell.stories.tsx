import { useState } from 'react'
import { expect, fn, within } from 'storybook/test'

import preview from '#.storybook/preview'

import type { ThemeValue } from '@/common/ui/ThemeToggle/index.ts'
import { offerHandlers } from '@/modules/offer/mocks.ts'
import { searchHandlers } from '@/modules/search/mocks.ts'

import { AppShellView, type AppShellViewProps } from './AppShellView.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

function ShellContent() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 className="text-h1">Главная</h1>
      <p style={{ maxWidth: '48ch', color: 'var(--color-text-muted)' }}>
        Плейсхолдер страницы: оболочка проверяется отдельно от содержимого.
      </p>
    </main>
  )
}

const meta = preview.meta({
  title: 'Shell/AppShell',
  component: AppShellView,
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: FIGMA } },
  args: { children: <ShellContent />, theme: 'system' as const, onThemeChange: fn() },
  beforeEach({ msw }) {
    msw.use(...offerHandlers, ...searchHandlers)
  },
})

function AppShellDemo({ width, ...args }: AppShellViewProps & { width: number }) {
  const [theme, setTheme] = useState<ThemeValue>(args.theme)

  return (
    <div style={{ width, marginInline: 'auto' }}>
      <AppShellView
        {...args}
        theme={theme}
        onThemeChange={(next) => {
          setTheme(next)
          args.onThemeChange(next)
        }}
      />
    </div>
  )
}

export const Mobile = meta.story({
  render: (args) => <AppShellDemo {...args} width={360} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Меню' }))
    const dialog = await canvas.findByRole('dialog', { name: 'Меню' })
    await expect(dialog).toBeVisible()
    await expect(within(dialog).getByRole('link', { name: 'Главная' })).toBeVisible()
    await expect(within(dialog).getByRole('link', { name: 'Каталог' })).toBeVisible()
    await expect(within(dialog).getByRole('link', { name: 'Как мы проверяем' })).toBeVisible()
  },
})

export const Desktop = meta.story({
  render: (args) => <AppShellDemo {...args} width={1440} />,
  play: async ({ canvas, userEvent }) => {
    const sidebar = canvas.getByRole('complementary', { name: 'Боковая панель' })
    await expect(within(sidebar).getByRole('navigation', { name: 'Главное меню' })).toBeVisible()
    await expect(within(sidebar).getByText('Знаете код?')).toBeVisible()
    await expect(canvas.getByText(/проверено сегодня/)).toBeVisible()
    const toggle = canvas.getByRole('switch')
    await expect(toggle).toBeVisible()
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    await expect(canvas.getByRole('button', { name: 'Меню', hidden: true })).not.toBeVisible()
  },
})

export const WithPromo = meta.story({
  args: {
    promo: (
      <div
        style={{
          padding: 16,
          borderRadius: 4,
          background: 'var(--color-highlight)',
          color: 'var(--color-on-highlight)',
        }}
      >
        Промо-блок: Знаете код?
      </div>
    ),
  },
  render: (args) => <AppShellDemo {...args} width={1440} />,
  play: async ({ canvas }) => {
    const promos = canvas.getAllByText('Промо-блок: Знаете код?')
    await expect(promos[0]).toBeVisible()
  },
})
