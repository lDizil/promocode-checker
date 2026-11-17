import { Button as Primitive } from '@ui-sdk/react/button'
import type { ComponentProps, ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import { ArrowUpRight, LoaderCircle } from '../Icon/icons.ts'
import styles from './Button.module.css'

type PrimitiveProps = ComponentProps<typeof Primitive>

export type ButtonVariant = 'primary' | 'on-highlight' | 'secondary' | 'ghost' | 'danger-ghost'
export type ButtonSize = 'lg' | 'md' | 'sm'

export interface ButtonProps extends Pick<
  PrimitiveProps,
  'onClick' | 'disabled' | 'focusableWhenDisabled' | 'render' | 'pendingAnnouncement' | 'aria-describedby' | 'className'
> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Leading icon (`icon=leading` in Figma). */
  icon?: IconGlyph
  /** Trailing ↗ for transitions to another site (DESIGN_SPEC 3.11). */
  external?: boolean
  /** Full container width, e.g. «Перейти в магазин» on OfferCard. */
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  children: ReactNode
}

export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'external' | 'block' | 'children'> {
  icon: IconGlyph
  /** Icon-only buttons are named for screen readers (DESIGN_SPEC 1.8). */
  label: string
}

const ICON_SIZE = { lg: 20, md: 20, sm: 16 } as const

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  external = false,
  block = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <Primitive
      {...props}
      className={[styles.button, 'text-button', block && styles.block, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
    >
      <span className={styles.spinner} data-show="pending">
        <Icon icon={LoaderCircle} size={ICON_SIZE[size]} />
      </span>
      <span className={styles.content} data-show="idle">
        {icon && <Icon icon={icon} size={ICON_SIZE[size]} />}
        <span>{children}</span>
        {external && <Icon icon={ArrowUpRight} size={ICON_SIZE[size]} />}
      </span>
    </Primitive>
  )
}

export function IconButton({ variant = 'secondary', size = 'md', icon, label, className, ...props }: IconButtonProps) {
  return (
    <Primitive
      {...props}
      aria-label={label}
      className={[styles.button, 'text-button', styles.iconOnly, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
    >
      <Icon icon={icon} size={ICON_SIZE[size]} />
    </Primitive>
  )
}
