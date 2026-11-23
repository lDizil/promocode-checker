import { createFileRoute } from '@tanstack/react-router'

import { PrivacyPage } from '@/pages/privacy.tsx'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Политика конфиденциальности | Рабочий код' },
      {
        name: 'description',
        content: 'Как «Рабочий код» работает без регистрации и зачем использует техническую cookie темы оформления.',
      },
    ],
  }),
  component: PrivacyPage,
})
