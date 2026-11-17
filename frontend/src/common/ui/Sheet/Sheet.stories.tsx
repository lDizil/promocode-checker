import { useState } from 'react'
import { expect, fn, waitFor } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from '../Button/Button.tsx'
import { Sheet } from './Sheet.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const BODY = (
  <p className="text-body">
    Радио-список причин и поле для комментария живут внутри этого слоя. На mobile он выезжает снизу, на desktop
    показывается панелью по центру.
  </p>
)

const meta = preview.meta({
  title: 'UI/Sheet',
  component: Sheet,
  parameters: { design: { type: 'figma', url: FIGMA } },
  args: {
    open: true,
    onOpenChange: fn(),
    title: 'Что пошло не так?',
    children: BODY,
  },
})

export const Dialog = meta.story({ args: { presentation: 'dialog' } })

export const BottomSheet = meta.story({ args: { presentation: 'sheet' } })

export const Responsive = meta.story({ args: { presentation: 'auto' } })

export const WithDescription = meta.story({
  args: { description: 'Выберите причину — так мы поправим шанс сработать.' },
})

const LONG_LINES = Array.from(
  { length: 12 },
  (_, index) => `Строка содержимого ${index + 1}. Проверяем, что панель прокручивается, а заголовок остаётся на месте.`,
)

export const LongContent = meta.story({
  args: {
    children: (
      <div className="text-body" style={{ display: 'grid', gap: 12 }}>
        {LONG_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    ),
  },
})

function Demo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Оставить отзыв</Button>
      <Sheet open={open} onOpenChange={setOpen} title="Что пошло не так?">
        {BODY}
      </Sheet>
    </>
  )
}

export const OpenAndClose = meta.story({
  render: () => <Demo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Оставить отзыв' }))
    // The sheet fades in; wait for the open transition before asserting visibility.
    await waitFor(() => expect(canvas.getByRole('dialog', { name: 'Что пошло не так?' })).toBeVisible())
    await userEvent.click(canvas.getByRole('button', { name: 'Закрыть' }))
    await waitFor(() => expect(canvas.queryByRole('dialog')).not.toBeInTheDocument())
  },
})
