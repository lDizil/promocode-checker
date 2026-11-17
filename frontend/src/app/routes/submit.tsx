import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { SubmitPage } from '@/pages/submit.tsx'

export const Route = createFileRoute('/submit')({
  // `/submit?m=samokat` pre-fills the merchant (DESIGN_SPEC 4.9).
  validateSearch: z.object({ m: z.string().optional().catch(undefined) }),
  component: SubmitPage,
})
