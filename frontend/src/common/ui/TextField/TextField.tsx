import { Field, FieldDescription, FieldError, FieldLabel } from '@ui-sdk/react/field'
import { Input } from '@ui-sdk/react/input'
import { Textarea } from '@ui-sdk/react/textarea'
import type { ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import styles from './TextField.module.css'

export type TextFieldKind = 'text' | 'code'

export interface TextFieldProps {
  label: string
  value: string
  onValueChange: (value: string) => void
  /** `code` renders JetBrains Mono and upper-cases the value (DESIGN_SPEC 3.42). */
  kind?: TextFieldKind
  type?: 'text' | 'number' | 'date' | 'url'
  inputMode?: 'decimal' | 'numeric'
  min?: number
  placeholder?: string
  /** Подсказка под полем (`caption`, `text-muted`). */
  helper?: string
  showHelper?: boolean
  /** Error text; overrides the helper and paints the field `danger`. */
  error?: string
  /** Multi-line mode for short comments; `kind` still applies to the font. */
  multiline?: boolean
  rows?: number
  maxLength?: number
  name?: string
  disabled?: boolean
  required?: boolean
  /** Adornment inside the field, e.g. a unit; `trailingIcon` sits after it. */
  trailing?: ReactNode
  trailingIcon?: IconGlyph
  className?: string
}

/** DESIGN_SPEC 3.42: label → 52 px field (`surface-2`, 1 px `border`) → helper. */
export function TextField({
  label,
  value,
  onValueChange,
  kind = 'text',
  type = 'text',
  inputMode,
  min,
  placeholder,
  helper,
  showHelper = true,
  error,
  multiline = false,
  rows = 3,
  maxLength,
  name,
  disabled = false,
  required = false,
  trailing,
  trailingIcon,
  className,
}: TextFieldProps) {
  const invalid = error !== undefined && error !== ''

  const change = (next: string) => {
    onValueChange(kind === 'code' ? next.toUpperCase() : next)
  }

  return (
    <Field
      name={name}
      disabled={disabled}
      invalid={invalid || undefined}
      className={[styles.field, className].filter(Boolean).join(' ')}
    >
      <FieldLabel className={styles.label}>{label}</FieldLabel>
      <div
        className={styles.control}
        data-kind={kind}
        data-multiline={multiline ? '' : undefined}
        data-invalid={invalid ? '' : undefined}
      >
        {multiline ? (
          <Textarea
            className={styles.input}
            value={value}
            onValueChange={change}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            spellCheck={false}
          />
        ) : (
          <Input
            className={styles.input}
            type={type}
            inputMode={inputMode}
            min={min}
            value={value}
            onValueChange={change}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            spellCheck={false}
            autoCapitalize={kind === 'code' ? 'characters' : undefined}
          />
        )}
        {(trailing !== undefined || trailingIcon !== undefined) && (
          <span className={styles.trailing}>
            {trailing}
            {trailingIcon && <Icon icon={trailingIcon} size={16} />}
          </span>
        )}
      </div>
      {invalid ? (
        <FieldError match className={styles.error}>
          {error}
        </FieldError>
      ) : (
        showHelper && helper && <FieldDescription className={styles.helper}>{helper}</FieldDescription>
      )}
    </Field>
  )
}
