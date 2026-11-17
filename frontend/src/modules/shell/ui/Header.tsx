import { useState } from 'react'

import { Button, IconButton } from '@/common/ui/Button/index.ts'
import { icons } from '@/common/ui/Icon/index.ts'
import { SearchField } from '@/common/ui/SearchField/index.ts'

import styles from './AppShell.module.css'
import { HomeLogo } from './HomeLogo.tsx'

export interface HeaderProps {
  query: string
  onQueryChange: (value: string) => void
  onSearchSubmit?: (value: string) => void
  onMenuOpen: () => void
  /** Hidden on the home page: its hero already contains a search field (DESIGN_SPEC 3.1). */
  showSearch?: boolean
}

export function Header({ query, onQueryChange, onSearchSubmit, onMenuOpen, showSearch = true }: HeaderProps) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <header className={styles.header}>
        <div className={styles.searchRow}>
          <SearchField
            className={styles.headerSearch}
            value={query}
            onChange={onQueryChange}
            onSubmit={(value) => {
              onSearchSubmit?.(value)
              setExpanded(false)
            }}
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
