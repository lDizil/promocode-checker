import { expect, fn, waitFor } from 'storybook/test'

import preview from '#.storybook/preview'

import { Toaster } from '@/common/ui/Toast/index.ts'

import { samokatOffers } from '../api/offer.mocks.ts'
import { useCopyCode } from '../hooks/useCopyCode.ts'
import { toOffer } from '../model/offer.ts'
import { CodeBox } from './CodeBox.tsx'

const offer = toOffer(samokatOffers(new Date('2026-11-16T12:00:00+03:00'))[0]!)

function Demo() {
  const { copiedId, copy } = useCopyCode()
  return (
    <>
      <CodeBox code={offer.code!} state={copiedId === offer.id ? 'copied' : 'default'} onCopy={() => copy(offer)} />
      <Toaster />
    </>
  )
}

const meta = preview.meta({ title: 'Offer/CopyCode', component: Demo })

export const ClipboardDenied = meta.story({
  render: () => <Demo />,
  play: async ({ canvas, userEvent }) => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) },
    })
    try {
      await userEvent.click(canvas.getByRole('button', { name: /Копировать/ }))
      await waitFor(() => expect(canvas.getByText('Не удалось скопировать код')).toBeVisible())
      await expect(canvas.getByText('Копировать')).toBeVisible()
      await expect(canvas.queryByText('Скопировано')).not.toBeInTheDocument()
      await userEvent.click(canvas.getByRole('button', { name: 'Закрыть уведомление' }))
    } finally {
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
      else Reflect.deleteProperty(navigator, 'clipboard')
    }
  },
})

export const CopiesWithoutRedirect = meta.story({
  render: () => <Demo />,
  play: async ({ canvas, userEvent }) => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    const originalOpen = window.open
    const writeSpy = fn(() => Promise.resolve())
    const openSpy = fn(() => null)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeSpy },
    })
    window.open = openSpy
    try {
      await userEvent.click(canvas.getByRole('button', { name: /Копировать/ }))
      await waitFor(() => expect(canvas.getByText('Скопировано')).toBeVisible())
      await waitFor(() => expect(canvas.getByText('Код скопирован')).toBeVisible())
      await expect(writeSpy).toHaveBeenCalledWith(offer.code)
      await expect(openSpy).not.toHaveBeenCalled()
      await userEvent.click(canvas.getByRole('button', { name: 'Закрыть уведомление' }))
    } finally {
      window.open = originalOpen
      if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
      else Reflect.deleteProperty(navigator, 'clipboard')
    }
  },
})
