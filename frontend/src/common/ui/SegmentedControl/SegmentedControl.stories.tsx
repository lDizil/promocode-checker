import { useState } from 'react'
import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { SegmentedControl, type SegmentedControlProps } from './SegmentedControl.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const OPTIONS = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
]

const meta = preview.meta({
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: { value: 'system', options: OPTIONS, label: 'Тема', onChange: fn() },
  render: (args) => <ControlledSegmentedControl {...args} />,
})

function ControlledSegmentedControl(args: SegmentedControlProps) {
  const [value, setValue] = useState(args.value)

  return (
    <SegmentedControl
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next)
        args.onChange(next)
      }}
    />
  )
}

export const System = meta.story({
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Системная' })).toHaveAttribute('aria-checked', 'true')
  },
})

export const Light = meta.story({ args: { value: 'light' } })

export const Dark = meta.story({ args: { value: 'dark' } })

const changeTheme = fn()

export const ChangeValue = meta.story({
  args: { onChange: changeTheme },
  play: async ({ canvas, userEvent }) => {
    const dark = canvas.getByRole('radio', { name: 'Тёмная' })
    await userEvent.click(dark)
    await expect(dark).toHaveAttribute('aria-checked', 'true')
    await expect(changeTheme).toHaveBeenCalledWith('dark')
  },
})

export const TwoSegments = meta.story({
  args: {
    label: 'Плотность',
    value: 'comfortable',
    options: [
      { value: 'compact', label: 'Компактно' },
      { value: 'comfortable', label: 'Свободно' },
    ],
  },
})

export const Narrow = meta.story({
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
})
