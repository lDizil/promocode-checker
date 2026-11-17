import type { ReactNode } from 'react'

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

  return (
    <AppShellView theme={theme} onThemeChange={changeTheme} promo={promo}>
      {children}
    </AppShellView>
  )
}
