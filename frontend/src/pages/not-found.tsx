import { Link } from '@tanstack/react-router'

import { Button } from '@/common/ui/Button/index.ts'
import { EmptyState } from '@/common/ui/EmptyState/index.ts'

/** P-12 `404`. The SearchField slot arrives with the search module. */
export function NotFoundPage() {
  return (
    <main>
      <EmptyState
        headingLevel={1}
        illustration="plug"
        title="Такой страницы нет"
        description="Возможно, магазин переименовали"
        actions={<Button render={<Link to="/" />}>На главную</Button>}
      />
    </main>
  )
}
