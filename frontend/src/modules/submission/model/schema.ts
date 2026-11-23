import { z } from 'zod'

import {
  submissionRequestDto,
  submissionSourceDto,
  type SubmissionRequest,
  type SubmissionSource,
} from '../api/submission.dto.ts'

export const CODE_PATTERN = /^[A-Z0-9_-]{3,32}$/

export const SUBMISSION_SOURCES: readonly { value: SubmissionSource; label: string }[] = [
  { value: 'telegram', label: 'Telegram-канал' },
  { value: 'email', label: 'Рассылка магазина' },
  { value: 'site', label: 'Сайт магазина' },
  { value: 'blogger', label: 'Блогер' },
  { value: 'other', label: 'Другое' },
]

export const SELF_CHECK_OPTIONS: readonly { value: 'yes' | 'no'; label: string }[] = [
  { value: 'yes', label: 'Да, сработал' },
  { value: 'no', label: 'Нет' },
]

function parsePositiveNumber(raw: string): number | null {
  const normalized = raw.trim().replaceAll(/\s+/g, '')
  if (!normalized) return null
  const num = Number(normalized)
  if (!Number.isFinite(num) || num <= 0) return null
  return num
}

export const submissionFormSchema = z
  .object({
    merchantName: z.string().trim().min(1, 'Укажите магазин'),
    merchantSlug: z.string().nullable(),
    code: z
      .string()
      .transform((raw) => raw.trim().toUpperCase())
      .pipe(z.string().regex(CODE_PATTERN, 'Код — от 3 до 32 символов, только буквы и цифры')),
    value: z.string().trim().min(1, 'Укажите выгоду, например −300 ₽'),
    firstOrderOnly: z.boolean(),
    hasMinOrder: z.boolean(),
    minOrder: z.string(),
    hasPartialProducts: z.boolean(),
    categoriesNote: z.string(),
    appOnly: z.boolean(),
    expiresAt: z.string(),
    unknownExpiry: z.boolean(),
    sourceKind: z
      .union([submissionSourceDto, z.null()])
      .refine((v): v is SubmissionSource => v !== null, { message: 'Укажите, где нашли код' }),
    sourceUrl: z.string(),
    selfChecked: z
      .union([z.enum(['yes', 'no']), z.null()])
      .refine((v): v is 'yes' | 'no' => v !== null, { message: 'Укажите, проверяли ли вы код' }),
    notPersonal: z
      .boolean()
      .refine((v) => v === true, { message: 'Подтвердите, что код не персональный и не одноразовый' }),
  })
  .superRefine((data, ctx) => {
    if (data.hasMinOrder && parsePositiveNumber(data.minOrder) === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['minOrder'],
        message: 'Укажите минимальную сумму заказа',
      })
    }
  })

export type SubmissionFormValues = z.input<typeof submissionFormSchema>

export const INITIAL_SUBMISSION_VALUES: SubmissionFormValues = {
  merchantName: '',
  merchantSlug: null,
  code: '',
  value: '',
  firstOrderOnly: false,
  hasMinOrder: false,
  minOrder: '',
  hasPartialProducts: false,
  categoriesNote: '',
  appOnly: false,
  expiresAt: '',
  unknownExpiry: false,
  sourceKind: null,
  sourceUrl: '',
  selfChecked: null,
  notPersonal: false,
}

export function findMerchantSlug(
  merchantName: string,
  merchants: readonly { slug: string; name: string }[],
): string | null {
  const needle = merchantName.trim().toLowerCase()
  if (!needle) return null
  const match = merchants.find((item) => item.name.toLowerCase() === needle || item.slug.toLowerCase() === needle)
  return match?.slug ?? null
}

export function filterMerchantSuggestions<T extends { slug: string; name: string }>(
  merchants: readonly T[],
  query: string,
): T[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [...merchants]
  return merchants.filter(
    (item) => item.name.toLowerCase().includes(needle) || item.slug.toLowerCase().includes(needle),
  )
}

export function toSubmissionRequest(values: SubmissionFormValues): SubmissionRequest {
  const parsed = submissionFormSchema.parse(values)
  const minOrder = parsed.hasMinOrder ? parsePositiveNumber(parsed.minOrder) : null
  const categoriesNote = parsed.hasPartialProducts ? parsed.categoriesNote.trim() || null : null
  const expiresAt = parsed.unknownExpiry ? null : parsed.expiresAt.trim() || null
  const sourceUrl = parsed.sourceKind === 'telegram' ? parsed.sourceUrl.trim() || null : null

  return submissionRequestDto.parse({
    merchant_name: parsed.merchantName,
    merchant_slug: parsed.merchantSlug,
    code: parsed.code,
    value: parsed.value,
    first_order_only: parsed.firstOrderOnly,
    min_order: minOrder,
    categories_note: categoriesNote,
    app_only: parsed.appOnly,
    expires_at: expiresAt,
    source_kind: parsed.sourceKind,
    source_url: sourceUrl,
    self_checked: parsed.selfChecked,
    not_personal: true,
  })
}
