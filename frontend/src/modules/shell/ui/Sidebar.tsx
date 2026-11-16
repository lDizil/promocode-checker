import type { ReactNode } from 'react'

import { ThemeToggle, type ThemeValue } from '@/common/ui/ThemeToggle/index.ts'

import styles from './AppShell.module.css'
import { HomeLogo } from './HomeLogo.tsx'
import { ShellNav } from './ShellNav.tsx'

export interface SidebarProps {
  theme: ThemeValue
  onThemeChange: (value: ThemeValue) => void
  promo?: ReactNode
}

export function Sidebar({ theme, onThemeChange, promo }: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Боковая панель">
      <div className={styles.sidebarLogo}>
        <HomeLogo />
      </div>
      <ShellNav size="md" className={styles.sidebarNav} />
      {promo && <div className={styles.sidebarPromo}>{promo}</div>}
      <div className={styles.sidebarTheme}>
        <ThemeToggle value={theme} onChange={onThemeChange} />
      </div>
    </aside>
  )
}
