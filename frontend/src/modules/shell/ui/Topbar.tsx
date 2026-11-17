import { SearchField } from '@/common/ui/SearchField/index.ts'

import styles from './AppShell.module.css'

export interface TopbarProps {
  query: string
  onQueryChange: (value: string) => void
  onSearchSubmit?: (value: string) => void
}

export function Topbar({ query, onQueryChange, onSearchSubmit }: TopbarProps) {
  return (
    <div className={styles.topbar}>
      <SearchField
        className={styles.topbarSearch}
        variant="bare"
        size="md"
        value={query}
        onChange={onQueryChange}
        onSubmit={onSearchSubmit}
      />
    </div>
  )
}
