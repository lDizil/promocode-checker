import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { PromoBlock } from '@/common/ui/PromoBlock/index.ts'
import type { ThemeValue } from '@/common/ui/ThemeToggle/index.ts'
import { useThemePreference } from '@/modules/theme/index.ts'

import { AppShellView } from './AppShellView.tsx'

export interface AppShellProps {
  children: ReactNode
  /** PromoBlock (DESIGN_SPEC 3.34) for the Sidebar and MenuDrawer. */
  promo?: ReactNode
}

export function AppShell({ children, promo }: AppShellProps) {
  const [theme, saveTheme] = useThemePreference()

  const changeTheme = (next: ThemeValue) => {
    void saveTheme(next)
  }

  const resolvedPromo = promo === undefined ? <PromoBlock actionRender={<Link to="/submit" />} /> : promo

  return (
    <AppShellView theme={theme} onThemeChange={changeTheme} promo={resolvedPromo}>
      {children}
    </AppShellView>
  )
}
