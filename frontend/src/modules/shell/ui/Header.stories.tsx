import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Header, type HeaderProps } from './Header.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'Shell/Header',
  component: Header,
  parameters: { layout: 'fullscreen', design: { type: 'figma', url: FIGMA } },
  args: { query: '', onQueryChange: fn(), onMenuOpen: fn(), onSearchSubmit: fn() },
  render: (args) => <HeaderDemo {...args} />,
})

function HeaderDemo(args: HeaderProps) {
  const [query, setQuery] = useState(args.query)

  return (
    <Header
      {...args}
      query={query}
      onQueryChange={(next) => {
        setQuery(next)
        args.onQueryChange(next)
      }}
    />
  )
}

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
    const input = await canvas.findByRole('searchbox')
    await userEvent.type(input, 'Самокат')
    await expect(input).toHaveValue('Самокат')
    await userEvent.click(canvas.getByRole('button', { name: 'Отмена' }))
    await expect(canvas.queryByRole('searchbox')).not.toBeInTheDocument()
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
