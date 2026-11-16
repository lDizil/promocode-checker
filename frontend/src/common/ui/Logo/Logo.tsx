import type { ReactElement, ReactNode } from 'react'

import styles from './Logo.module.css'

export interface LogoLinkRenderProps {
  className: string
  children: ReactNode
}

export type LogoRenderLink = (props: LogoLinkRenderProps) => ReactElement

export interface LogoProps {
  /** Rendered as a plain anchor when `renderLink` is absent. */
  href?: string
  /** Router-aware link (TanStack `Link`) supplied by the shell. */
  renderLink?: LogoRenderLink
  className?: string
}

const LABEL = 'Рабочий код'

export function Logo({ href = '/', renderLink, className }: LogoProps) {
  const linkClassName = [styles.logo, 'text-logo', className].filter(Boolean).join(' ')

  if (renderLink) {
    return renderLink({ className: linkClassName, children: LABEL })
  }

  return (
    <a className={linkClassName} href={href}>
      {LABEL}
    </a>
  )
}
