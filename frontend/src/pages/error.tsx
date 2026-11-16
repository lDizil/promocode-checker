import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'

import { ErrorState } from '@/common/ui/EmptyState/index.ts'

/** P-12 `500`. */
export function ErrorPage({ reset }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <main>
      <ErrorState
        headingLevel={1}
        description="У нас что-то сломалось. Уже чиним"
        onRetry={async () => {
          reset()
          await router.invalidate()
        }}
      />
    </main>
  )
}
