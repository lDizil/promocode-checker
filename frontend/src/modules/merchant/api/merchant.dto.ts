import { z } from 'zod'

export const merchantDto = z.object({
  slug: z.string(),
  name: z.string(),
  logo_url: z.url().nullable(),
  site_url: z.url(),
  category: z.string(),
  updated_at: z.iso.datetime({ offset: true }),
  /** Editorial «Как применить код» steps (DESIGN_SPEC 4.4 item 7). */
  how_to_apply: z.array(z.string()),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  /** Shown in the empty state: «Последний рабочий код был …». */
  last_working_code_at: z.iso.datetime({ offset: true }).nullable(),
})

export type MerchantDto = z.infer<typeof merchantDto>
