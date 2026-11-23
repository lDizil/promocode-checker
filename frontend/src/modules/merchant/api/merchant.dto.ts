import { z } from 'zod'

export const logoUrlDto = z.union([z.url(), z.string().regex(/^\/[a-zA-Z0-9/._-]+$/)]).nullable()

export const merchantDto = z.object({
  slug: z.string(),
  name: z.string(),
  logo_url: logoUrlDto,
  site_url: z.url(),
  category: z.string(),
  category_slug: z.string().default('other'),
  updated_at: z.iso.datetime({ offset: true }),
  /** Editorial «Как применить код» steps (DESIGN_SPEC 4.4 item 7). */
  how_to_apply: z.array(z.string()),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  /** Shown in the empty state: «Последний рабочий код был …». */
  last_working_code_at: z.iso.datetime({ offset: true }).nullable(),
})

export const merchantSummaryDto = z.object({
  slug: z.string(),
  name: z.string(),
  logo_url: logoUrlDto,
  category: z.string(),
  category_slug: z.string(),
  offer_count: z.number().int().nonnegative(),
  featured: z.boolean(),
})

export const merchantListDto = z.object({
  items: z.array(merchantSummaryDto),
  total: z.number().int().nonnegative(),
})

export type MerchantDto = z.infer<typeof merchantDto>
export type MerchantSummaryDto = z.infer<typeof merchantSummaryDto>
export type MerchantListDto = z.infer<typeof merchantListDto>
