import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { ThemeToggle, type ThemeToggleProps, type ThemeValue } from './ThemeToggle.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { value: 'light' as const, onChange: fn() },
  render: (args) => <ControlledThemeToggle {...args} />,
})

function ControlledThemeToggle(args: ThemeToggleProps) {
  const [value, setValue] = useState<ThemeValue>(args.value)

  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start', padding: 16, width: 320 }}>
      <ThemeToggle
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next)
          args.onChange(next)
        }}
      />
      <span data-testid="theme-value">Текущая тема: {value}</span>
    </div>
  )
}

const switchChange = fn()

export const SwitchLight = meta.story({
  args: { onChange: switchChange },
  play: async ({ canvas, userEvent }) => {
    const control = canvas.getByRole('switch')
    await expect(control).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(control)
    await expect(switchChange).toHaveBeenCalledWith('dark')
    await expect(control).toHaveAttribute('aria-checked', 'true')
  },
})

export const SwitchDark = meta.story({
  args: { value: 'dark' as const },
})

export const SwitchSystem = meta.story({
  args: { value: 'system' as const },
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch')
    await expect(control).toHaveAccessibleName('Тема: как в системе')
  },
})

export const Segmented = meta.story({
  args: { variant: 'segmented' as const, value: 'system' as const },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Системная' })).toHaveAttribute('aria-checked', 'true')
  },
})

const segmentedChange = fn()

export const SegmentedChange = meta.story({
  args: { variant: 'segmented' as const, value: 'system' as const, onChange: segmentedChange },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Тёмная' }))
    await expect(segmentedChange).toHaveBeenCalledWith('dark')
    await expect(canvas.getByRole('radio', { name: 'Тёмная' })).toHaveAttribute('aria-checked', 'true')
  },
})
