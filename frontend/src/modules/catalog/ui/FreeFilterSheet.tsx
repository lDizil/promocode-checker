import { Button } from '@/common/ui/Button/index.ts'
import { Checkbox } from '@/common/ui/Checkbox/index.ts'
import { FilterChip } from '@/common/ui/FilterChip/index.ts'
import { RadioGroup } from '@/common/ui/Radio/index.ts'
import { Sheet } from '@/common/ui/Sheet/index.ts'
import { formatOffers } from '@/modules/merchant/index.ts'
import { viewOffers, type Offer, type OfferAudience, type OfferFilters, type OfferType } from '@/modules/offer/index.ts'

import styles from './FreeFilterSheet.module.css'

const AVAILABILITY_OPTIONS = [
  { value: 'ru', label: 'Доступно из РФ' },
  { value: 'all', label: 'Все' },
] as const

const AUDIENCES: { value: OfferAudience; label: string }[] = [
  { value: 'individual', label: 'Физлицо' },
  { value: 'student', label: 'Студент' },
  { value: 'business', label: 'Юрлицо' },
]

type FreeFilterType = Extract<OfferType, 'free_credit' | 'free_tier' | 'trial' | 'student'>

const FREE_TYPES: { value: FreeFilterType; label: string }[] = [
  { value: 'free_credit', label: 'Кредит' },
  { value: 'free_tier', label: 'Free tier' },
  { value: 'trial', label: 'Trial' },
  { value: 'student', label: 'Студентам' },
]

export interface FreeFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: OfferFilters
  onChange: (filters: OfferFilters) => void
  onApply: () => void
  offers: readonly Offer[]
}

/** DESIGN_SPEC 4.6: filter sheet tailored to the «Бесплатно» catalog branch. */
export function FreeFilterSheet({ open, onOpenChange, filters, onChange, onApply, offers }: FreeFilterSheetProps) {
  const patch = (change: Partial<OfferFilters>) => onChange({ ...filters, ...change })
  const effectiveFilters: OfferFilters = { ...filters, availableInRu: filters.availableInRu ?? true }
  const visible = viewOffers(offers, effectiveFilters).active.length

  const toggleAudience = (value: OfferAudience, checked: boolean) => {
    const current = filters.audience ?? []
    const next = checked ? [...new Set([...current, value])] : current.filter((item) => item !== value)
    patch({ audience: next.length > 0 ? next : undefined })
  }

  const toggleFreeType = (value: FreeFilterType, selected: boolean) => {
    const current = filters.freeTypes ?? []
    const next = selected ? [...new Set([...current, value])] : current.filter((item) => item !== value)
    patch({ freeTypes: next.length > 0 ? next : undefined })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Фильтры" presentation="sheet" className={styles.sheet}>
      <form
        className={styles.form}
        aria-label="Фильтры бесплатных офферов"
        onSubmit={(event) => {
          event.preventDefault()
          onApply()
        }}
      >
        <fieldset className={styles.section}>
          <legend className="text-title">Доступность</legend>
          <RadioGroup
            options={AVAILABILITY_OPTIONS}
            name="availableInRu"
            label="Доступность"
            value={filters.availableInRu === false ? 'all' : 'ru'}
            onValueChange={(value) => patch({ availableInRu: value === 'all' ? false : undefined })}
          />
        </fieldset>

        <fieldset className={styles.section}>
          <legend className="text-title">Что нужно</legend>
          <div className={styles.checks}>
            <Checkbox
              label="Без карты"
              name="noCard"
              checked={filters.noCard ?? false}
              onCheckedChange={(checked) => patch({ noCard: checked === true ? true : undefined })}
            />
            <Checkbox
              label="Карта РФ подходит"
              name="ruCardOk"
              checked={filters.ruCardOk ?? false}
              onCheckedChange={(checked) => patch({ ruCardOk: checked === true ? true : undefined })}
            />
            <Checkbox
              label="Без подтверждения личности"
              name="noKyc"
              checked={filters.noKyc ?? false}
              onCheckedChange={(checked) => patch({ noKyc: checked === true ? true : undefined })}
            />
            <Checkbox
              label="Без телефона"
              name="noPhone"
              checked={filters.noPhone ?? false}
              onCheckedChange={(checked) => patch({ noPhone: checked === true ? true : undefined })}
            />
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className="text-title">Кто может получить</legend>
          <div className={styles.checks}>
            {AUDIENCES.map(({ value, label }) => (
              <Checkbox
                key={value}
                label={label}
                name={`audience-${value}`}
                checked={filters.audience?.includes(value) ?? false}
                onCheckedChange={(checked) => toggleAudience(value, checked === true)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend className="text-title">Тип</legend>
          <div className={styles.chips}>
            {FREE_TYPES.map(({ value, label }) => (
              <FilterChip
                key={value}
                selected={filters.freeTypes?.includes(value) ?? false}
                onSelectedChange={(selected) => toggleFreeType(value, selected)}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </fieldset>

        <footer className={styles.footer}>
          <Button type="button" variant="ghost" onClick={() => onChange({ sort: filters.sort })}>
            Сбросить
          </Button>
          <Button type="submit">Показать {formatOffers(visible)}</Button>
        </footer>
      </form>
    </Sheet>
  )
}
