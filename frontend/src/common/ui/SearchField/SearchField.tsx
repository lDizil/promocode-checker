import { useRef } from 'react'

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
  const inputRef = useRef<HTMLInputElement>(null)
  const hasValue = value !== ''

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
      <Icon icon={Search} size={20} className={styles.searchIcon} />
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        enterKeyHint="search"
        onChange={(event) => onChange(event.target.value)}
      />
      {hasValue && (
        <button
          className={styles.clear}
          type="button"
          aria-label="Очистить"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
        >
          <Icon icon={X} size={16} />
        </button>
      )}
    </form>
  )
}
