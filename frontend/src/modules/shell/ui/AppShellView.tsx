import { useState, type ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'

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
  const [query, setQuery] = useState('')
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isHome = pathname === '/'

  return (
    <div className={styles.root}>
      <div className={styles.layout}>
        <Sidebar theme={theme} onThemeChange={onThemeChange} promo={promo} />
        <div className={styles.frame}>
          <Header query={query} onQueryChange={setQuery} onMenuOpen={() => setMenuOpen(true)} showSearch={!isHome} />
          <Topbar query={query} onQueryChange={setQuery} />
          <div className={styles.content}>{children}</div>
          <Footer />
        </div>
      </div>
      <MenuDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        theme={theme}
        onThemeChange={onThemeChange}
        promo={promo}
      />
    </div>
  )
}
