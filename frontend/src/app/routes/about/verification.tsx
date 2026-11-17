import { createFileRoute } from '@tanstack/react-router'

import { VerificationPage } from '@/pages/verification.tsx'

export const Route = createFileRoute('/about/verification')({
  component: VerificationPage,
})
