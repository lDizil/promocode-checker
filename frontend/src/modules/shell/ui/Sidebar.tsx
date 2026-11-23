import type { ReactNode } from 'react'

import styles from './AppShell.module.css'
import { HomeLogo } from './HomeLogo.tsx'
import { ShellNav } from './ShellNav.tsx'

export interface SidebarProps {
  promo?: ReactNode
}

export function Sidebar({ promo }: SidebarProps) {
  return (
    <aside className={styles.sidebar} aria-label="Боковая панель">
      <div className={styles.sidebarLogo}>
        <HomeLogo />
      </div>
      <ShellNav size="md" className={styles.sidebarNav} />
      {promo && <div className={styles.sidebarPromo}>{promo}</div>}
    </aside>
  )
}
