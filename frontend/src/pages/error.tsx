import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'

import { Button } from '@/common/ui/Button/index.ts'
import { EmptyState, ErrorState } from '@/common/ui/EmptyState/index.ts'
import { OfflineDataUnavailableError, useConnectionStatus } from '@/modules/network/index.ts'

/** P-12 `500`. */
export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const online = useConnectionStatus()
  const retry = async () => {
    reset()
    await router.invalidate()
  }
  if (!online || error instanceof OfflineDataUnavailableError) {
    return (
      <main>
        <EmptyState
          illustration="plug"
          headingLevel={1}
          title="Нет соединения"
          description="Сохранённых данных пока нет"
          actions={
            <Button variant="secondary" onClick={retry}>
              Повторить
            </Button>
          }
        />
      </main>
    )
  }
  return (
    <main>
      <ErrorState headingLevel={1} description="У нас что-то сломалось. Уже чиним" onRetry={retry} />
    </main>
  )
}
