import { useState } from 'react'

import { Button, IconButton } from '@/common/ui/Button/index.ts'
import { icons } from '@/common/ui/Icon/index.ts'
import { SearchAutocomplete } from '@/modules/search/index.ts'

import styles from './AppShell.module.css'
import { HomeLogo } from './HomeLogo.tsx'

export interface HeaderProps {
  onMenuOpen: () => void
  /** Hidden on the home page: its hero already contains a search field (DESIGN_SPEC 3.1). */
  showSearch?: boolean
}

export function Header({ onMenuOpen, showSearch = true }: HeaderProps) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <header className={styles.header}>
        <div className={styles.searchRow}>
          <SearchAutocomplete
            variant="boxed"
            size="md"
            className={styles.headerSearch}
            focusOnMount
            onNavigate={() => setExpanded(false)}
          />
          <Button variant="ghost" size="sm" type="button" onClick={() => setExpanded(false)}>
            Отмена
          </Button>
        </div>
      </header>
    )
  }

  return (
    <header className={styles.header}>
      <HomeLogo className={styles.headerLogo} />
      <div className={styles.headerActions}>
        {showSearch && (
          <IconButton variant="ghost" icon={icons.Search} label="Поиск" onClick={() => setExpanded(true)} />
        )}
        <IconButton variant="ghost" icon={icons.Menu} label="Меню" onClick={onMenuOpen} />
      </div>
    </header>
  )
}
