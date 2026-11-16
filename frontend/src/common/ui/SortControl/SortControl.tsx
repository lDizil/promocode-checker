import { Menu, MenuContent, MenuItemIndicator, MenuRadioGroup, MenuRadioItem, MenuTrigger } from '@ui-sdk/react/menu'

import { Icon } from '../Icon/Icon.tsx'
import { ArrowUpDown, Check } from '../Icon/icons.ts'
import styles from './SortControl.module.css'

export interface SortOption<Value extends string = string> {
  value: Value
  label: string
}

export interface SortControlProps<Value extends string = string> {
  value: Value
  options: SortOption<Value>[]
  onChange: (value: Value) => void
  /** Accessible name; the visible trigger text is the current sort (DESIGN_SPEC 3.10). */
  label?: string
  className?: string
}

/** DESIGN_SPEC 3.10: text button «⇅ Сначала надёжные» that opens the sort menu. */
export function SortControl<Value extends string>({
  value,
  options,
  onChange,
  label = 'Сортировка',
  className,
}: SortControlProps<Value>) {
  const current = options.find((option) => option.value === value)?.label ?? options[0]?.label ?? ''
  const select = (next: string | null) => {
    const option = options.find((candidate) => candidate.value === next)
    if (option) onChange(option.value)
  }

  return (
    <Menu>
      <MenuTrigger
        className={[styles.trigger, className].filter(Boolean).join(' ')}
        aria-label={`${label}: ${current}`}
      >
        <Icon icon={ArrowUpDown} size={16} />
        <span>{current}</span>
      </MenuTrigger>
      <MenuContent side="bottom" align="end" sideOffset={4} className={styles.content}>
        <MenuRadioGroup value={value} onValueChange={select} aria-label={label}>
          {options.map((option) => (
            <MenuRadioItem key={option.value} value={option.value} closeOnSelect className={styles.item}>
              <MenuItemIndicator keepMounted className={styles.indicator}>
                <Icon icon={Check} size={16} />
              </MenuItemIndicator>
              {option.label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}
