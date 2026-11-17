import type { ReactElement, ReactNode } from 'react'

import styles from './Logo.module.css'
import { LogoMark } from './LogoMark.tsx'

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
const [WORD, CODE] = LABEL.split(' ')

export function Logo({ href = '/', renderLink, className }: LogoProps) {
  const linkClassName = [styles.logo, className].filter(Boolean).join(' ')
  const content = (
    <>
      <LogoMark />
      <span className={styles.wordmark}>
        <span className="text-h2">{WORD}</span> <span className="text-logo">{CODE}</span>
      </span>
    </>
  )

  if (renderLink) {
    return renderLink({ className: linkClassName, children: content })
  }

  return (
    <a className={linkClassName} href={href}>
      {content}
    </a>
  )
}
