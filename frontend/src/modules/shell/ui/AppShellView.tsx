import { Link, useRouterState } from '@tanstack/react-router'
import { useState, type ReactNode } from 'react'

import { PromoBlock } from '@/common/ui/PromoBlock/index.ts'
import type { ThemeValue } from '@/common/ui/ThemeToggle/index.ts'

import styles from './AppShell.module.css'
import { Footer } from './Footer.tsx'
import { Header } from './Header.tsx'
import { MenuDrawer } from './MenuDrawer.tsx'
import { Sidebar } from './Sidebar.tsx'
import { Topbar } from './Topbar.tsx'

export interface AppShellViewProps {
  children: ReactNode
  /** PromoBlock (DESIGN_SPEC 3.34) for the Sidebar and MenuDrawer. */
  promo?: ReactNode
  theme: ThemeValue
  onThemeChange: (value: ThemeValue) => void
}

export function AppShellView({ children, promo, theme, onThemeChange }: AppShellViewProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isHome = pathname === '/'
  const resolvedPromo = promo === undefined ? <PromoBlock actionRender={<Link to="/submit" />} /> : promo

  return (
    <div className={styles.root}>
      <div className={styles.layout}>
        <Sidebar promo={resolvedPromo} />
        <div className={styles.frame}>
          <Header onMenuOpen={() => setMenuOpen(true)} showSearch={!isHome} />
          <Topbar theme={theme} onThemeChange={onThemeChange} />
          <div className={styles.content}>{children}</div>
          <Footer />
        </div>
      </div>
      <MenuDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        theme={theme}
        onThemeChange={onThemeChange}
        promo={resolvedPromo}
      />
    </div>
  )
}
