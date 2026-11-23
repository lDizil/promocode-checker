import { createFileRoute } from '@tanstack/react-router'

import { ContactsPage } from '@/pages/contacts.tsx'

export const Route = createFileRoute('/contacts')({
  head: () => ({
    meta: [
      { title: 'Контакты | Рабочий код' },
      {
        name: 'description',
        content: 'Обратная связь, отправка промокодов и контакты по вопросам партнёрств и рекламы.',
      },
    ],
  }),
  component: ContactsPage,
})
