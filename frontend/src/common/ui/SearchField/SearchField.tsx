import { Input, InputClear, InputGroup } from '@ui-sdk/react/input'

import { Icon } from '../Icon/Icon.tsx'
import { Search, X } from '../Icon/icons.ts'
import styles from './SearchField.module.css'

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  /** Enter in the field; the form submission is cancelled after the callback. */
  onSubmit?: (value: string) => void
  placeholder?: string
  /** Accessible name of the input. */
  label?: string
  /** DESIGN_SPEC 3.3: 56 on the home hero, 44 in the header and topbar. */
  size?: 'lg' | 'md'
  /** `bare` is the borderless Topbar variant (DESIGN_SPEC 3.1). */
  variant?: 'boxed' | 'bare'
  className?: string
}

const DEFAULT_PLACEHOLDER = 'Магазин или сервис, например Самокат'
const DEFAULT_LABEL = 'Поиск по магазинам и сервисам'

export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = DEFAULT_PLACEHOLDER,
  label = DEFAULT_LABEL,
  size = 'md',
  variant = 'boxed',
  className,
}: SearchFieldProps) {
  return (
    <form
      className={[styles.field, className].filter(Boolean).join(' ')}
      role="search"
      aria-label={label}
      data-size={size}
      data-variant={variant}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit?.(value)
      }}
    >
      <InputGroup className={styles.group}>
        <Icon icon={Search} size={20} className={styles.searchIcon} />
        <Input
          className={styles.input}
          type="search"
          name="q"
          value={value}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          enterKeyHint="search"
          onValueChange={onChange}
        />
        <InputClear className={styles.clear} type="button" aria-label="Очистить">
          <Icon icon={X} size={16} />
        </InputClear>
      </InputGroup>
    </form>
  )
}
