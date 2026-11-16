import { expect, fn } from 'storybook/test'

import preview from '#.storybook/preview'

import { Button } from '../Button/Button.tsx'
import { toast, Toaster, type ToastVariant } from './Toast.tsx'

const FIGMA = 'https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8'

const meta = preview.meta({
  title: 'UI/Toast',
  component: Toaster,
  parameters: { design: { type: 'figma', url: FIGMA } },
})

const MESSAGES: Record<ToastVariant, string> = {
  info: 'Показываем сохранённые данные',
  success: 'Код скопирован',
  error: 'Не удалось отправить отзыв',
}

interface DemoProps {
  variant: ToastVariant
  message?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function Demo({ variant, message, description, actionLabel, onAction }: DemoProps) {
  return (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <Button
        onClick={() => {
          const options = {
            description,
            action: actionLabel ? { label: actionLabel, onAction: () => onAction?.() } : undefined,
          }
          toast[variant](message ?? MESSAGES[variant], options)
        }}
      >
        Показать
      </Button>
      <Toaster />
    </div>
  )
}

export const Info = meta.story({
  render: () => <Demo variant="info" />,
  play: async ({ canvas, userEvent }) => {
    toast.dismiss()
    await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
    await expect(await canvas.findByText(MESSAGES.info)).toBeVisible()
    toast.dismiss()
  },
})

export const Success = meta.story({
  render: () => <Demo variant="success" />,
  play: async ({ canvas, userEvent }) => {
    toast.dismiss()
    await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
    await expect(await canvas.findByText(MESSAGES.success)).toBeVisible()
    toast.dismiss()
  },
})

export const Error = meta.story({
  render: () => <Demo variant="error" />,
  play: async ({ canvas, userEvent }) => {
    toast.dismiss()
    await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
    await expect(await canvas.findByText(MESSAGES.error)).toBeVisible()
    toast.dismiss()
  },
})

const actionSpy = fn()

export const WithAction = meta.story({
  render: () => <Demo variant="success" message="Код скопирован" actionLabel="Открыть" onAction={actionSpy} />,
  play: async ({ canvas, userEvent }) => {
    toast.dismiss()
    actionSpy.mockClear()
    await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Открыть' }))
    await expect(actionSpy).toHaveBeenCalledOnce()
    toast.dismiss()
  },
})

export const WithDescription = meta.story({
  render: () => <Demo variant="info" message="Отзыв в очереди" description="Отправим, когда появится связь" />,
  play: async ({ canvas, userEvent }) => {
    toast.dismiss()
    await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
    await expect(await canvas.findByText('Отправим, когда появится связь')).toBeVisible()
    toast.dismiss()
  },
})

export const LongMessage = meta.story({
  render: () => (
    <Demo
      variant="error"
      message="Не удалось отправить отзыв: проверьте соединение и попробуйте ещё раз через несколько минут"
      actionLabel="Повторить"
    />
  ),
  play: async ({ canvas, userEvent }) => {
    toast.dismiss()
    await userEvent.click(canvas.getByRole('button', { name: 'Показать' }))
    await expect(await canvas.findByText(/Не удалось отправить отзыв/)).toBeVisible()
    toast.dismiss()
  },
})
