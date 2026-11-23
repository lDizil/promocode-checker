import { Link } from '@tanstack/react-router'

import { Button } from '@/common/ui/Button/index.ts'
import { EmptyState } from '@/common/ui/EmptyState/index.ts'
import { SearchAutocomplete } from '@/modules/search/index.ts'

import styles from './not-found.module.css'

/** P-12 `404` (DESIGN_SPEC 4.13). */
export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <EmptyState
        headingLevel={1}
        illustration="plug"
        title="Такой страницы нет"
        description="Возможно, магазин переименовали"
        actions={
          <div className={styles.actions}>
            <SearchAutocomplete className={styles.search} />
            <Button render={<Link to="/" />}>На главную</Button>
          </div>
        }
      />
    </main>
  )
}
