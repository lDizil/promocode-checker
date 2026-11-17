export interface PluralForms {
  one: string
  few: string
  many: string
}

/**
 * Russian noun form after a count: 1 оффер, 2 оффера, 5 офферов.
 * DESIGN_SPEC 3.6; counts are integers, fractions fall back to `many`.
 */
export function plural(count: number, forms: PluralForms): string {
  const n = Math.abs(Math.trunc(count))
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms.one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few
  return forms.many
}
