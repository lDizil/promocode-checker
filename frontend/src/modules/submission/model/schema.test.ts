import { describe, expect, it } from 'vitest'

import {
  filterMerchantSuggestions,
  findMerchantSlug,
  INITIAL_SUBMISSION_VALUES,
  submissionFormSchema,
  toSubmissionRequest,
  type SubmissionFormValues,
} from './schema.ts'

function validValues(patch: Partial<SubmissionFormValues> = {}): SubmissionFormValues {
  return {
    ...INITIAL_SUBMISSION_VALUES,
    merchantName: 'Самокат',
    merchantSlug: 'samokat',
    code: 'samokat300',
    value: '−300 ₽',
    sourceKind: 'telegram',
    sourceUrl: 't.me/skidki_msk/1234',
    selfChecked: 'yes',
    notPersonal: true,
    ...patch,
  }
}

function issueMessages(values: SubmissionFormValues): Record<string, string> {
  const result = submissionFormSchema.safeParse(values)
  if (result.success) return {}
  const map: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.')
    if (key && !(key in map)) map[key] = issue.message
  }
  return map
}

describe('submissionFormSchema', () => {
  it('normalizes promo code to uppercase and validates allowed characters and length', () => {
    const parsed = submissionFormSchema.parse(validValues({ code: '  promo-2026_1  ' }))
    expect(parsed.code).toBe('PROMO-2026_1')

    expect(issueMessages(validValues({ code: 's1' }))['code']).toBe('Код — от 3 до 32 символов, только буквы и цифры')
    expect(issueMessages(validValues({ code: 'A'.repeat(33) }))['code']).toBe(
      'Код — от 3 до 32 символов, только буквы и цифры',
    )
    expect(issueMessages(validValues({ code: 'КОД123' }))['code']).toBe(
      'Код — от 3 до 32 символов, только буквы и цифры',
    )
    expect(issueMessages(validValues({ code: 'SAM 300' }))['code']).toBe(
      'Код — от 3 до 32 символов, только буквы и цифры',
    )
  })

  it('requires merchant, value, sourceKind, selfChecked and notPersonal', () => {
    const errors = issueMessages(INITIAL_SUBMISSION_VALUES)
    expect(errors['merchantName']).toBe('Укажите магазин')
    expect(errors['code']).toBe('Код — от 3 до 32 символов, только буквы и цифры')
    expect(errors['value']).toBe('Укажите выгоду, например −300 ₽')
    expect(errors['sourceKind']).toBe('Укажите, где нашли код')
    expect(errors['selfChecked']).toBe('Укажите, проверяли ли вы код')
    expect(errors['notPersonal']).toBe('Подтвердите, что код не персональный и не одноразовый')
  })

  it('requires positive minOrder only when hasMinOrder is enabled', () => {
    expect(submissionFormSchema.safeParse(validValues({ hasMinOrder: false, minOrder: '' })).success).toBe(true)
    expect(issueMessages(validValues({ hasMinOrder: true, minOrder: '' }))['minOrder']).toBe(
      'Укажите минимальную сумму заказа',
    )
    expect(issueMessages(validValues({ hasMinOrder: true, minOrder: '0' }))['minOrder']).toBe(
      'Укажите минимальную сумму заказа',
    )
    expect(submissionFormSchema.safeParse(validValues({ hasMinOrder: true, minOrder: '1 500' })).success).toBe(true)
  })
})

describe('toSubmissionRequest', () => {
  it('maps validated form values into SubmissionRequest DTO', () => {
    const request = toSubmissionRequest(
      validValues({
        firstOrderOnly: true,
        hasMinOrder: true,
        minOrder: '1500',
        hasPartialProducts: true,
        categoriesNote: 'Готовая еда',
        appOnly: true,
        expiresAt: '2026-11-30',
        unknownExpiry: false,
      }),
    )

    expect(request).toEqual({
      merchant_name: 'Самокат',
      merchant_slug: 'samokat',
      code: 'SAMOKAT300',
      value: '−300 ₽',
      first_order_only: true,
      min_order: 1500,
      categories_note: 'Готовая еда',
      app_only: true,
      expires_at: '2026-11-30',
      source_kind: 'telegram',
      source_url: 't.me/skidki_msk/1234',
      self_checked: 'yes',
      not_personal: true,
    })
  })

  it('drops conditional fields when toggles are unchecked or source is not telegram', () => {
    const request = toSubmissionRequest(
      validValues({
        hasMinOrder: false,
        minOrder: '1500',
        hasPartialProducts: false,
        categoriesNote: 'Одежда',
        expiresAt: '2026-11-30',
        unknownExpiry: true,
        sourceKind: 'site',
        sourceUrl: 't.me/skidki_msk/1234',
        selfChecked: 'no',
      }),
    )

    expect(request.min_order).toBeNull()
    expect(request.categories_note).toBeNull()
    expect(request.expires_at).toBeNull()
    expect(request.source_url).toBeNull()
    expect(request.self_checked).toBe('no')
  })
})

describe('merchant suggestion helpers', () => {
  const merchants = [
    { slug: 'samokat', name: 'Самокат' },
    { slug: 'yandex-eda', name: 'Яндекс Еда' },
  ]

  it('finds slug by case-insensitive name or slug', () => {
    expect(findMerchantSlug('самокат', merchants)).toBe('samokat')
    expect(findMerchantSlug('yandex-eda', merchants)).toBe('yandex-eda')
    expect(findMerchantSlug('Неизвестный магазин', merchants)).toBeNull()
  })

  it('filters suggestions by name or slug', () => {
    expect(filterMerchantSuggestions(merchants, '')).toHaveLength(2)
    expect(filterMerchantSuggestions(merchants, 'янд').map((m) => m.slug)).toEqual(['yandex-eda'])
    expect(filterMerchantSuggestions(merchants, 'samo').map((m) => m.slug)).toEqual(['samokat'])
  })
})
