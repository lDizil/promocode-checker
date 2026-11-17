import { Button as Primitive } from '@ui-sdk/react/button'
import type { ComponentProps, ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import styles from './CategoryChip.module.css'

type PrimitiveProps = ComponentProps<typeof Primitive>

export interface CategoryChipProps {
  icon: IconGlyph
  children: ReactNode
  /** Router link element, e.g. `<Link to="/c/$slug" params={{ slug }} />`. Defaults to an anchor with `href`. */
  render?: PrimitiveProps['render']
  href?: string
  className?: string
}

/** DESIGN_SPEC 3.7: category link chip, 36 high, surface-1, 16 px icon and body-sm 600 label. */
export function CategoryChip({ icon, children, render, href, className }: CategoryChipProps) {
  return (
    <Primitive
      render={render ?? <a href={href ?? '#'} />}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <Icon icon={icon} size={16} />
      <span>{children}</span>
    </Primitive>
  )
}
