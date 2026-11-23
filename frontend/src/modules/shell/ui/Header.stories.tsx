import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { searchHandlers } from '@/modules/search/mocks.ts'

import { Header } from './Header.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Shell/Header',
  component: Header,
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: FIGMA } },
  args: { onMenuOpen: fn() },
  beforeEach({ msw }) {
    msw.use(...searchHandlers)
  },
})

export const Collapsed = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Рабочий код' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Поиск' })).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Меню' })).toBeVisible()
  },
})

export const SearchExpanded = meta.story({
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Поиск' }))
    const input = await canvas.findByRole('combobox')
    await userEvent.type(input, 'Самокат')
    await expect(input).toHaveValue('Самокат')
    await userEvent.click(canvas.getByRole('button', { name: 'Отмена' }))
    await expect(canvas.queryByRole('combobox')).not.toBeInTheDocument()
  },
})

export const HomeWithoutSearch = meta.story({
  args: { showSearch: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button', { name: 'Поиск' })).not.toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Меню' })).toBeVisible()
  },
})

const openMenu = fn()

export const OpenMenu = meta.story({
  args: { onMenuOpen: openMenu },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Меню' }))
    await expect(openMenu).toHaveBeenCalledOnce()
  },
})
