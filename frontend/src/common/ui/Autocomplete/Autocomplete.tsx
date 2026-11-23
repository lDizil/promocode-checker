import {
  Autocomplete as Primitive,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIcon,
  AutocompleteLabel,
  AutocompleteList,
  AutocompleteStatus,
  type AutocompleteProps as PrimitiveProps,
} from '@ui-sdk/react/autocomplete'
import type { ComponentProps, ReactElement, ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import { ChevronRight, Search, X } from '../Icon/icons.ts'
import styles from './Autocomplete.module.css'

export interface AutocompleteOption {
  value: string
  label: string
  /** Optional formatted title node (e.g. with highlighted match); `label` remains plain text for input/ARIA. */
  titleContent?: ReactNode
  subtitle?: string
  leading?: ReactNode
  trailingIcon?: IconGlyph
  href?: string
  render?: ReactElement
  /** Optional raw action button rendered beside the item (outside the link). */
  action?: ReactNode
  /** Passed to `AutocompleteItem` so keyboard selection avoids duplicate submission. */
  keywords?: string[]
  disabled?: boolean
}

export interface AutocompleteGroupData {
  key: string
  label?: string
  options: readonly AutocompleteOption[]
}

export interface AutocompleteProps {
  value: string
  onValueChange: (value: string, reason: string) => void
  onSubmit?: (value: string, event?: Event) => void
  open?: boolean
  onOpenChange?: (open: boolean, reason: string) => void
  openOnFocus?: boolean
  autoHighlight?: boolean
  filter?: PrimitiveProps['filter']
  /** Options grouped into sections; pass `[]` when empty. */
  groups?: readonly AutocompleteGroupData[]
  loading?: boolean
  loadingContent?: ReactNode
  /** Rendered inside popup outside `role="listbox"` when `groups` is empty (e.g. recent searches with remove buttons). */
  recentContent?: ReactNode
  emptyContent?: ReactNode
  footer?: ReactNode
  label?: string
  /** Visually hidden accessible label when `label` is omitted. */
  ariaLabel?: string
  placeholder?: string
  helper?: string
  error?: string
  required?: boolean
  disabled?: boolean
  name?: string
  /** `boxed` (home hero 56px), `bare` (topbar 44px), `field` (form input 52px with visible label). */
  variant?: 'boxed' | 'bare' | 'field'
  size?: 'md' | 'lg'
  showSearchIcon?: boolean
  className?: string
  contentClassName?: string
  onOptionSelect?: (option: AutocompleteOption) => void
}

/** DESIGN_SPEC 3.3 / 3.4: ui-sdk Autocomplete wrapper confined to common/ui (ADR 0002). */
export function Autocomplete({
  value,
  onValueChange,
  onSubmit,
  open,
  onOpenChange,
  openOnFocus = true,
  autoHighlight = false,
  filter = false,
  groups = [],
  loading = false,
  loadingContent,
  recentContent,
  emptyContent,
  footer,
  label,
  ariaLabel = 'Поиск по магазинам и сервисам',
  placeholder = 'Магазин или сервис, например Самокат',
  helper,
  error,
  required = false,
  disabled = false,
  name,
  variant = 'boxed',
  size = 'md',
  showSearchIcon = variant !== 'field',
  className,
  contentClassName,
  onOptionSelect,
}: AutocompleteProps) {
  const invalid = error !== undefined && error !== ''
  const optionMap = new Map<string, AutocompleteOption>()
  for (const group of groups) {
    for (const option of group.options) {
      optionMap.set(option.value, option)
    }
  }
  const hasOptions = optionMap.size > 0

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} data-variant={variant}>
      <Primitive
        value={value}
        open={open}
        openOnFocus={openOnFocus}
        autoHighlight={autoHighlight}
        filter={filter}
        disabled={disabled}
        required={required}
        name={name}
        modal={false}
        onValueChange={(next, details) => {
          onValueChange(next, details.reason)
          if (details.reason === 'item-press') {
            const matched = [...optionMap.values()].find(
              (opt) => (opt.label ?? opt.value) === next || opt.value === next,
            )
            if (matched) onOptionSelect?.(matched)
          }
        }}
        onOpenChange={(next, details) => {
          onOpenChange?.(next, details.reason)
        }}
        onSubmit={(submitted, details) => {
          onSubmit?.(submitted, details.event)
        }}
      >
        {label ? (
          <AutocompleteLabel className={styles.fieldLabel}>{label}</AutocompleteLabel>
        ) : (
          <span className="visually-hidden">
            <AutocompleteLabel>{ariaLabel}</AutocompleteLabel>
          </span>
        )}
        <div
          className={styles.control}
          data-variant={variant}
          data-size={size}
          data-has-icon={showSearchIcon ? '' : undefined}
          data-has-clear={value.length > 0 ? '' : undefined}
          data-invalid={invalid || undefined}
        >
          {showSearchIcon && <Icon icon={Search} size={20} className={styles.searchIcon} />}
          <AutocompleteInput
            className={styles.input}
            type={variant === 'field' ? 'text' : 'search'}
            placeholder={placeholder}
            aria-label={label ? undefined : ariaLabel}
            aria-invalid={invalid || undefined}
            autoComplete="off"
            enterKeyHint="search"
          />
          {value.length > 0 && (
            <AutocompleteClear className={styles.clear} type="button" aria-label="Очистить">
              <Icon icon={X} size={16} />
            </AutocompleteClear>
          )}
        </div>

        {invalid ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : (
          helper && <p className={styles.helper}>{helper}</p>
        )}

        <AutocompleteContent
          className={[styles.content, contentClassName].filter(Boolean).join(' ')}
          sideOffset={8}
          align="start"
          collisionPadding={16}
        >
          <AutocompleteStatus className="visually-hidden">
            {loading
              ? 'Загружаем подсказки'
              : hasOptions
                ? `Найдено вариантов: ${optionMap.size}`
                : 'Ничего не найдено'}
          </AutocompleteStatus>

          {loading ? (
            <div className={styles.loading}>{loadingContent}</div>
          ) : !hasOptions && recentContent ? (
            recentContent
          ) : null}

          <AutocompleteList className={styles.list} hidden={loading || !hasOptions}>
            {!loading &&
              groups.map((group) =>
                group.options.length > 0 ? (
                  <AutocompleteGroup key={group.key} className={styles.group}>
                    {group.label && (
                      <AutocompleteGroupLabel className={[styles.groupLabel, 'text-caption'].join(' ')}>
                        {group.label}
                      </AutocompleteGroupLabel>
                    )}
                    {group.options.map((option) => (
                      <ItemRow key={option.value} option={option} />
                    ))}
                  </AutocompleteGroup>
                ) : null,
              )}
          </AutocompleteList>

          {!loading && !hasOptions && !recentContent && emptyContent && (
            <AutocompleteEmpty className={styles.empty}>{emptyContent}</AutocompleteEmpty>
          )}

          {footer && <div className={styles.footer}>{footer}</div>}
        </AutocompleteContent>
      </Primitive>
    </div>
  )
}

function ItemRow({ option }: { option: AutocompleteOption }) {
  const itemRender = option.render ?? (option.href ? <a href={option.href} /> : undefined)
  const content = (
    <>
      {option.leading && <AutocompleteItemIcon className={styles.leading}>{option.leading}</AutocompleteItemIcon>}
      <span className={styles.itemBody}>
        <span className={[styles.itemTitle, 'text-title'].join(' ')}>{option.titleContent ?? option.label}</span>
        {option.subtitle && <span className={[styles.itemSubtitle, 'text-caption'].join(' ')}>{option.subtitle}</span>}
      </span>
      <span className={styles.trailing}>
        {option.trailingIcon !== undefined ? (
          <Icon icon={option.trailingIcon} size={16} />
        ) : (
          <Icon icon={ChevronRight} size={16} />
        )}
      </span>
    </>
  )

  const itemProps: ComponentProps<typeof AutocompleteItem> = {
    value: option.value,
    label: option.label,
    keywords: option.keywords,
    disabled: option.disabled,
    className: styles.item,
    render: itemRender,
  }

  if (option.action) {
    return (
      <div className={styles.itemRowWrap}>
        <AutocompleteItem {...itemProps}>{content}</AutocompleteItem>
        <div className={styles.itemAction}>{option.action}</div>
      </div>
    )
  }

  return <AutocompleteItem {...itemProps}>{content}</AutocompleteItem>
}
