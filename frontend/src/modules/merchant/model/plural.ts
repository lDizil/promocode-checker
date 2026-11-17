import { plural, type PluralForms } from '@/common/plural.ts'

const OFFER_FORMS: PluralForms = { one: 'оффер', few: 'оффера', many: 'офферов' }

const ACTIVE_OFFER_FORMS: PluralForms = {
  one: 'активный оффер',
  few: 'активных оффера',
  many: 'активных офферов',
}

/** «4 оффера» for MerchantTile (DESIGN_SPEC 3.6). */
export function formatOffers(count: number): string {
  return `${count} ${plural(count, OFFER_FORMS)}`
}

/** «4 активных оффера» for the P-04 merchant header (DESIGN_SPEC 4.4 item 2). */
export function formatActiveOffers(count: number): string {
  return `${count} ${plural(count, ACTIVE_OFFER_FORMS)}`
}
