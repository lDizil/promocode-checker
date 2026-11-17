import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

import { Button } from '@/common/ui/Button/index.ts'
import { RadioGroup } from '@/common/ui/Radio/index.ts'
import { Sheet } from '@/common/ui/Sheet/index.ts'
import { TextField } from '@/common/ui/TextField/index.ts'

import type { FailReason } from '../api/feedback.dto.ts'
import { failReasonDto } from '../api/feedback.dto.ts'
import { failReasonOptions, type FailReasonInput } from '../model/reasons.ts'
import styles from './FailReasonSheet.module.css'

const formSchema = z.object({
  reason: failReasonDto,
  comment: z.string().max(200, 'Не больше 200 символов'),
})

export interface FailReasonSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: FailReasonInput) => void
  /** A vote is on its way: the list and «Отправить» become inert. */
  pending?: boolean
  error?: string | null
}

/**
 * DESIGN_SPEC 3.19: sheet with a single-choice reason list, the optional comment under «Другое»,
 * and «Отправить» disabled until a reason is chosen.
 */
export function FailReasonSheet({ open, onOpenChange, onSubmit, pending = false, error = null }: FailReasonSheetProps) {
  const form = useForm({
    defaultValues: { reason: null as FailReason | null, comment: '' },
    validators: {
      onSubmit: ({ value }) => {
        if (value.reason === null) return 'Выберите причину'
        return formSchema.safeParse(value).success ? undefined : 'Проверьте форму'
      },
    },
    onSubmit: ({ value }) => {
      if (value.reason === null) return
      const parsed = formSchema.safeParse(value)
      if (!parsed.success) return
      const comment = parsed.data.reason === 'other' ? parsed.data.comment.trim() : ''
      onSubmit({ reason: parsed.data.reason, ...(comment ? { comment } : {}) })
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} title="Что пошло не так?">
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field name="reason">
          {(field) => (
            <RadioGroup
              label="Причина"
              options={failReasonOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as FailReason)}
              disabled={pending}
            />
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.values.reason}>
          {(reason) =>
            reason === 'other' ? (
              <form.Field name="comment">
                {(field) => (
                  <TextField
                    label="Коротко опишите"
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    multiline
                    maxLength={200}
                    placeholder="Например: скидка не применилась к заказу"
                    helper={
                      field.state.value.length > 0
                        ? `${field.state.value.length} / 200`
                        : 'Необязательно, до 200 символов'
                    }
                    disabled={pending}
                  />
                )}
              </form.Field>
            ) : null
          }
        </form.Subscribe>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <form.Subscribe selector={(state) => [state.values.reason, state.isSubmitting] as const}>
          {([reason, isSubmitting]) => (
            <Button type="submit" block disabled={reason === null || pending || isSubmitting}>
              Отправить
            </Button>
          )}
        </form.Subscribe>
      </form>
    </Sheet>
  )
}
