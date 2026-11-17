import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '@/pages/home.tsx'

export const Route = createFileRoute('/')({
  component: HomePage,
})
