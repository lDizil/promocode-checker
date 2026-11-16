import type { ReactNode } from 'react'

import { IconButton } from '@/common/ui/Button/index.ts'
import { Drawer } from '@/common/ui/Drawer/index.ts'
import { icons } from '@/common/ui/Icon/index.ts'
import { ThemeToggle, type ThemeValue } from '@/common/ui/ThemeToggle/index.ts'

import styles from './AppShell.module.css'
import { HomeLogo } from './HomeLogo.tsx'
import { ShellNav } from './ShellNav.tsx'

export interface MenuDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: ThemeValue
  onThemeChange: (value: ThemeValue) => void
  promo?: ReactNode
}

export function MenuDrawer({ open, onOpenChange, theme, onThemeChange, promo }: MenuDrawerProps) {
  const close = () => onOpenChange(false)

  return (
    <Drawer open={open} onOpenChange={onOpenChange} side="end" label="Меню">
      <div className={styles.drawerTop}>
        <HomeLogo className={styles.drawerLogo} onClick={close} />
        <IconButton variant="ghost" icon={icons.X} label="Закрыть меню" onClick={close} />
      </div>
      <ShellNav size="lg" className={styles.drawerNav} onNavigate={close} />
      {promo && <div className={styles.drawerPromo}>{promo}</div>}
      <div className={styles.drawerTheme}>
        <p className={styles.themeLabel}>Тема</p>
        <ThemeToggle variant="segmented" value={theme} onChange={onThemeChange} />
      </div>
    </Drawer>
  )
}
