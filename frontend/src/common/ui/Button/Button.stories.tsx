import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Search, ThumbsUp } from '../Icon/icons.ts'
import { Button, IconButton } from './Button.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Button',
  component: Button,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { children: 'Перейти в магазин', onClick: fn() },
})

export const Primary = meta.story({ args: { variant: 'primary', external: true } })
export const Secondary = meta.story({ args: { variant: 'secondary', icon: ThumbsUp, size: 'sm', children: 'Да' } })
export const OnHighlight = meta.story({ args: { variant: 'on-highlight', external: true } })
export const Ghost = meta.story({ args: { variant: 'ghost', children: 'Сбросить фильтры' } })
export const DangerGhost = meta.story({ args: { variant: 'danger-ghost', children: 'Удалить' } })
export const Disabled = meta.story({ args: { disabled: true } })
export const Block = meta.story({ args: { variant: 'secondary', block: true, external: true } })

export const Sizes = meta.story({
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="lg" />
      <Button {...args} size="md" />
      <Button {...args} size="sm" />
    </div>
  ),
})

export const Pending = meta.story({
  args: { children: 'Отправить', onClick: fn(() => Promise.withResolvers<void>().promise) },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Отправить' })
    await userEvent.click(button)
    await expect(button).toHaveAttribute('aria-busy', 'true')
  },
})

export const IconOnly = meta.story({
  render: () => <IconButton icon={Search} label="Искать" />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Искать' })).toBeVisible()
  },
})
