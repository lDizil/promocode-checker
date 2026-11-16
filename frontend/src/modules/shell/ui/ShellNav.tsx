import { Link } from '@tanstack/react-router'

import { NavItem } from '@/common/ui/NavItem/index.ts'

import styles from './AppShell.module.css'
import { SHELL_NAV } from './nav.ts'

export interface ShellNavProps {
  size: 'md' | 'lg'
  onNavigate?: () => void
  className?: string
}

export function ShellNav({ size, onNavigate, className }: ShellNavProps) {
  return (
    <nav className={[styles.nav, className].filter(Boolean).join(' ')} aria-label="Главное меню">
      {SHELL_NAV.map((item) => (
        <NavItem
          key={item.to}
          icon={item.icon}
          href={item.to}
          size={size}
          renderLink={({ className: linkClassName, children }) => (
            <Link
              className={linkClassName}
              to={item.to}
              activeOptions={{ exact: item.to === '/' }}
              activeProps={{ 'data-active': '', 'aria-current': 'page' }}
              onClick={onNavigate}
            >
              {children}
            </Link>
          )}
        >
          {item.label}
        </NavItem>
      ))}
    </nav>
  )
}
