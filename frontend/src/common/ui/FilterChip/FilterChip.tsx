import { Button as Primitive } from '@ui-sdk/react/button'
import { Toggle } from '@ui-sdk/react/toggle'
import type { ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import { Check, ChevronDown } from '../Icon/icons.ts'
import styles from './FilterChip.module.css'

export interface FilterChipProps {
  children: ReactNode
  /** `toggle` keeps its selected state through ui-sdk Toggle; `dropdown` opens the filter sheet. */
  kind?: 'toggle' | 'dropdown'
  selected?: boolean
  /** Adds the active-filter counter: «Фильтры · 2» (DESIGN_SPEC 3.8). */
  count?: number
  icon?: IconGlyph
  disabled?: boolean
  onClick?: () => void
  /** Called with the next selected state for `kind="toggle"`. */
  onSelectedChange?: (selected: boolean) => void
  /** Expanded state of the sheet a dropdown chip opens. */
  'aria-expanded'?: boolean
  'aria-controls'?: string
  className?: string
}

/** DESIGN_SPEC 3.8: filter row chip, 36 high, horizontal scrolling row on mobile. */
export function FilterChip({
  children,
  kind = 'toggle',
  selected = false,
  count,
  icon,
  disabled = false,
  onClick,
  onSelectedChange,
  className,
  ...aria
}: FilterChipProps) {
  const rootClass = [styles.root, className].filter(Boolean).join(' ')
  const content = (
    <>
      {selected ? <Icon icon={Check} size={16} /> : icon && <Icon icon={icon} size={16} />}
      <span className={styles.label}>
        {children}
        {count !== undefined && count > 0 && (
          <span className={styles.count}>
            {' · '}
            {count}
          </span>
        )}
      </span>
      {kind === 'dropdown' && <Icon icon={ChevronDown} size={16} className={styles.chevron} />}
    </>
  )

  if (kind === 'dropdown') {
    return (
      <Primitive
        {...aria}
        className={rootClass}
        data-selected={selected ? 'true' : 'false'}
        disabled={disabled}
        onClick={onClick}
        aria-haspopup="dialog"
      >
        {content}
      </Primitive>
    )
  }

  return (
    <Toggle
      className={rootClass}
      pressed={selected}
      disabled={disabled}
      onClick={onClick}
      onPressedChange={(pressed) => onSelectedChange?.(pressed)}
    >
      {content}
    </Toggle>
  )
}
