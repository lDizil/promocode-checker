import { Button } from '@/common/ui/Button/index.ts'
import { Checkbox } from '@/common/ui/Checkbox/index.ts'
import { FilterChip } from '@/common/ui/FilterChip/index.ts'
import { RadioGroup } from '@/common/ui/Radio/index.ts'
import { Sheet } from '@/common/ui/Sheet/index.ts'
import { TextField } from '@/common/ui/TextField/index.ts'
import { formatOffers } from '@/modules/merchant/index.ts'

import { viewOffers, type OfferFilters } from '../model/filters.ts'
import type { Offer } from '../model/offer.ts'
import styles from './FilterSheet.module.css'

const KINDS = [
  { value: 'code', label: 'Промокоды' },
  { value: 'sale', label: 'Акции' },
  { value: 'cashback', label: 'Кешбэк' },
] as const

const CUSTOMERS = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Только новым клиентам' },
  { value: 'existing', label: 'Подходит постоянным' },
]

export interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: OfferFilters
  onChange: (filters: OfferFilters) => void
  onApply: () => void
  offers: readonly Offer[]
}

export function FilterSheet({ open, onOpenChange, filters, onChange, onApply, offers }: FilterSheetProps) {
  const patch = (change: Partial<OfferFilters>) => onChange({ ...filters, ...change })
  const visible = viewOffers(offers, filters).active.length
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Фильтры" presentation="sheet" className={styles.sheet}>
      <form
        className={styles.form}
        aria-label="Фильтры офферов"
        onSubmit={(event) => {
          event.preventDefault()
          onApply()
        }}
      >
        <fieldset className={styles.section}>
          <legend className="text-title">Тип</legend>
          <div className={styles.kinds}>
            {KINDS.map(({ value, label }) => (
              <FilterChip
                key={value}
                selected={filters.kinds?.includes(value) ?? false}
                onSelectedChange={(selected) => {
                  const kinds = filters.kinds ?? []
                  patch({ kinds: selected ? [...kinds, value] : kinds.filter((kind) => kind !== value) })
                }}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </fieldset>
        <fieldset className={styles.section}>
          <legend className="text-title">Для кого</legend>
          <RadioGroup
            options={CUSTOMERS}
            name="customer"
            label="Для кого"
            value={filters.customer ?? 'all'}
            onValueChange={(value) => patch({ customer: value === 'all' ? undefined : (value as 'new' | 'existing') })}
          />
        </fieldset>
        <fieldset className={styles.section}>
          <legend className="text-title">Сумма заказа</legend>
          <TextField
            label="Моя сумма, ₽"
            name="amount"
            type="number"
            inputMode="decimal"
            min={0}
            value={filters.amount === undefined ? '' : String(filters.amount)}
            onValueChange={(value) => patch({ amount: value === '' ? undefined : Number(value) })}
            helper="Покажем только офферы, которые применятся к этой сумме"
          />
        </fieldset>
        <fieldset className={styles.section}>
          <legend className="text-title">Надёжность</legend>
          <Checkbox
            label="Скрыть офферы под вопросом"
            name="reliableOnly"
            checked={filters.reliableOnly ?? false}
            onCheckedChange={(checked) => patch({ reliableOnly: checked === true ? true : undefined })}
          />
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
