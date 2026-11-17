import type { MerchantDto } from '../api/merchant.dto.ts'

export interface Merchant {
  slug: string
  name: string
  logoUrl: string | null
  siteUrl: string
  category: string
  updatedAt: Date
  howToApply: string[]
  faq: { question: string; answer: string }[]
  lastWorkingCodeAt: Date | null
}

export function toMerchant(dto: MerchantDto): Merchant {
  return {
    slug: dto.slug,
    name: dto.name,
    logoUrl: dto.logo_url,
    siteUrl: dto.site_url,
    category: dto.category,
    updatedAt: new Date(dto.updated_at),
    howToApply: dto.how_to_apply,
    faq: dto.faq,
    lastWorkingCodeAt: dto.last_working_code_at === null ? null : new Date(dto.last_working_code_at),
  }
}
