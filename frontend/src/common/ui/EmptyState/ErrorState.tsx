import { Button } from '../Button/Button.tsx'
import { EmptyState } from './EmptyState.tsx'

export interface ErrorStateProps {
  title?: string
  description?: string
  onRetry: () => unknown
  headingLevel?: 1 | 2
}

/** DESIGN_SPEC 3.27. */
export function ErrorState({
  title = 'Не удалось загрузить',
  description = 'Проверьте интернет и попробуйте ещё раз',
  onRetry,
  headingLevel,
}: ErrorStateProps) {
  return (
    <EmptyState
      illustration="plug"
      title={title}
      description={description}
      headingLevel={headingLevel ?? 2}
      actions={
        <Button variant="secondary" onClick={onRetry}>
          Повторить
        </Button>
      }
    />
  )
}
