import { Button as Primitive } from '@ui-sdk/react/button'
import type { ComponentProps, MouseEventHandler, ReactNode } from 'react'

import { Icon } from '../Icon/Icon.tsx'
import { ArrowLeft } from '../Icon/icons.ts'
import styles from './BackLink.module.css'

type PrimitiveProps = ComponentProps<typeof Primitive>

export interface BackLinkProps {
  children: ReactNode
  /** Router link element, e.g. `<Link to="/m/$slug" params={{ slug }} />`. Defaults to an anchor with `href`. */
  render?: PrimitiveProps['render']
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
}

/** DESIGN_SPEC 3.41: «← Все коды Самоката», underline on hover only. */
export function BackLink({ children, render, href, onClick, className }: BackLinkProps) {
  return (
    <Primitive
      render={render ?? <a href={href ?? '#'} />}
      onClick={onClick}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <Icon icon={ArrowLeft} size={16} />
      <span>{children}</span>
    </Primitive>
  )
}
