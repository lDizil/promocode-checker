import type { ReactElement, ReactNode } from 'react'

import { Icon, type IconGlyph } from '../Icon/Icon.tsx'
import styles from './NavItem.module.css'

export interface NavItemLinkRenderProps {
  className: string
  children: ReactNode
  'data-active'?: '' | undefined
}

export type NavItemRenderLink = (props: NavItemLinkRenderProps) => ReactElement

export interface NavItemProps {
  icon: IconGlyph
  children: ReactNode
  /** Destination for the default anchor; `renderLink` overrides it. */
  href: string
  /** DESIGN_SPEC 3.1: 40 in the desktop Sidebar, 52 in the mobile MenuDrawer. */
  size?: 'md' | 'lg'
  active?: boolean
  renderLink?: NavItemRenderLink
  onClick?: () => void
  className?: string
}

export function NavItem({
  icon,
  children,
  href,
  size = 'md',
  active = false,
  renderLink,
  onClick,
  className,
}: NavItemProps) {
  const linkClassName = [styles.link, size === 'lg' && styles.lg, className].filter(Boolean).join(' ')
  const content = (
    <>
      <span className={styles.icon}>
        <Icon icon={icon} size={20} />
      </span>
      <span className={styles.label}>{children}</span>
    </>
  )
  const activeProps = active ? ({ 'data-active': '', 'aria-current': 'page' } as const) : {}

  if (renderLink) {
    return renderLink({ className: linkClassName, children: content, ...activeProps })
  }

  return (
    <a className={linkClassName} href={href} onClick={onClick} {...activeProps}>
      {content}
    </a>
  )
}
