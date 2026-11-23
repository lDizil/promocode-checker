import { useForm, useStore } from '@tanstack/react-form'
import { Link } from '@tanstack/react-router'

import { Autocomplete, type AutocompleteGroupData } from '@/common/ui/Autocomplete/index.ts'
import { Button } from '@/common/ui/Button/index.ts'
import { Checkbox } from '@/common/ui/Checkbox/index.ts'
import { GotchaNote } from '@/common/ui/GotchaNote/index.ts'
import { Icon, icons } from '@/common/ui/Icon/index.ts'
import { RadioGroup } from '@/common/ui/Radio/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { StepList, type StepListItem } from '@/common/ui/StepList/index.ts'
import { TextField } from '@/common/ui/TextField/index.ts'
import { formatOffers, MerchantAvatar, useMerchants } from '@/modules/merchant/index.ts'
import {
  filterMerchantSuggestions,
  findMerchantSlug,
  INITIAL_SUBMISSION_VALUES,
  SELF_CHECK_OPTIONS,
  SUBMISSION_SOURCES,
  submissionFormSchema,
  submissionSourceDto,
  useDuplicateCheck,
  useMerchantPrefill,
  useSubmitOffer,
  type SubmissionFormValues,
} from '@/modules/submission/index.ts'

import styles from './submit.module.css'

export interface SubmitPageProps {
  prefillMerchantSlug?: string
}

const WHAT_HAPPENS_STEPS: StepListItem[] = [
  {
    title: 'Проверим код',
    description: 'Через партнёрскую сеть или вручную',
    state: 'done',
    icon: icons.ShieldCheck,
  },
  {
    title: 'Опубликуем',
    description: 'На странице магазина, с указанием источника',
    state: 'done',
    icon: icons.Ticket,
  },
  {
    title: 'Покажем результат',
    description: 'Сколько раз код сработал за 7 дней',
    state: 'current',
    icon: icons.Check,
  },
]

function fieldError(errors: readonly unknown[], show: boolean): string | undefined {
  if (!show || errors.length === 0) return undefined
  const first = errors[0]
  if (typeof first === 'string') return first
  if (first && typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
    return first.message
  }
  return undefined
}

/** P-09 «Прислать код» (DESIGN_SPEC 4.9). */
export function SubmitPage({ prefillMerchantSlug }: SubmitPageProps) {
  const merchants = useMerchants()
  const submitOffer = useSubmitOffer()

  const prefillMerchant = prefillMerchantSlug
    ? (merchants.find((item) => item.slug === prefillMerchantSlug) ?? null)
    : null

  const initialValues: SubmissionFormValues = {
    ...INITIAL_SUBMISSION_VALUES,
    merchantName: prefillMerchant?.name ?? '',
    merchantSlug: prefillMerchant?.slug ?? null,
  }

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: submissionFormSchema,
      onSubmit: submissionFormSchema,
    },
    onSubmit: ({ value }) => {
      submitOffer.submit(value)
    },
  })

  useMerchantPrefill(prefillMerchantSlug, merchants, (matched) => {
    form.setFieldValue('merchantName', matched?.name ?? '', { dontUpdateMeta: true })
    form.setFieldValue('merchantSlug', matched?.slug ?? null, { dontUpdateMeta: true })
  })

  const submissionAttempts = useStore(form.store, (s) => s.submissionAttempts)
  const duplicateTarget = useStore(form.store, (s) => ({
    merchant: s.values.merchantSlug || s.values.merchantName,
    code: s.values.code,
  }))
  const duplicate = useDuplicateCheck(duplicateTarget.merchant, duplicateTarget.code)

  const handleReset = () => {
    submitOffer.reset()
    form.reset(initialValues)
  }

  const submitted = submitOffer.submittedResult

  return (
    <main className={styles.page}>
      <div className={styles.main}>
        {submitted ? (
          <section className={styles.success} aria-live="polite">
            <span className={styles.successIcon} aria-hidden="true">
              <Icon icon={icons.Check} size={20} className={styles.successGlyph} />
            </span>
            <h1 className="text-h1">Спасибо! Код на проверке</h1>
            <p className={`${styles.successText} text-body`}>
              Обычно проверяем за несколько часов. Если код сработает, он появится на странице магазина{' '}
              {submitted.merchantName}
            </p>
            <div className={styles.successActions}>
              <Button type="button" variant="primary" size="md" onClick={handleReset}>
                Прислать ещё
              </Button>
              {submitted.merchantSlug ? (
                <Button
                  variant="secondary"
                  size="md"
                  external
                  render={<Link to="/m/$slug" params={{ slug: submitted.merchantSlug }} />}
                >
                  На страницу {submitted.merchantName}
                </Button>
              ) : (
                <Button variant="secondary" size="md" render={<Link to="/" />}>
                  На главную
                </Button>
              )}
            </div>
          </section>
        ) : (
          <>
            <header className={styles.intro}>
              <h1 className="text-h1">Прислать код</h1>
              <p className={`${styles.subtitle} text-body-sm`}>
                Проверим и опубликуем. Персональные и одноразовые коды не публикуем — они сгорят у владельца
              </p>
            </header>

            <form
              className={styles.form}
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void form.handleSubmit()
              }}
            >
              <form.Field name="merchantName">
                {(field) => {
                  const filtered = filterMerchantSuggestions(merchants, field.state.value)
                  const groups: AutocompleteGroupData[] = [
                    {
                      key: 'merchants',
                      options: filtered.map((merchant) => ({
                        value: merchant.slug,
                        label: merchant.name,
                        leading: <MerchantAvatar name={merchant.name} logoUrl={merchant.logoUrl} size={32} />,
                        subtitle: formatOffers(merchant.offerCount),
                        keywords: [merchant.slug],
                      })),
                    },
                  ]

                  return (
                    <Autocomplete
                      variant="field"
                      label="Магазин или сервис"
                      name={field.name}
                      placeholder="Например, Самокат"
                      required
                      value={field.state.value}
                      groups={groups}
                      error={fieldError(field.state.meta.errors, field.state.meta.isTouched || submissionAttempts > 0)}
                      onValueChange={(next, reason) => {
                        if (reason === 'item-press') {
                          const matched = merchants.find((m) => m.name === next || m.slug === next)
                          field.handleChange(matched?.name ?? next)
                          form.setFieldValue('merchantSlug', matched?.slug ?? null)
                          return
                        }
                        field.handleChange(next)
                        form.setFieldValue('merchantSlug', findMerchantSlug(next, merchants))
                      }}
                      onOptionSelect={(option) => {
                        field.handleChange(option.label)
                        form.setFieldValue('merchantSlug', option.value)
                      }}
                    />
                  )
                }}
              </form.Field>

              <div className={styles.fieldGroup}>
                <form.Field name="code">
                  {(field) => (
                    <TextField
                      label="Промокод"
                      name={field.name}
                      kind="code"
                      placeholder="SAMOKAT300"
                      maxLength={32}
                      required
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      error={fieldError(field.state.meta.errors, field.state.meta.isTouched || submissionAttempts > 0)}
                    />
                  )}
                </form.Field>
                {duplicate && (
                  <GotchaNote tone="warning" showTitle={false}>
                    Такой код уже есть: шанс {duplicate.score ?? '—'}
                    {duplicate.checkedAgo ? `, проверен ${duplicate.checkedAgo}` : ''}.{' '}
                    <Link to="/m/$slug/o/$offerId" params={{ slug: duplicate.merchantSlug, offerId: duplicate.id }}>
                      Открыть
                    </Link>
                  </GotchaNote>
                )}
              </div>

              <form.Field name="value">
                {(field) => (
                  <TextField
                    label="Что даёт"
                    name={field.name}
                    placeholder="−300 ₽ или −15%"
                    required
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    error={fieldError(field.state.meta.errors, field.state.meta.isTouched || submissionAttempts > 0)}
                  />
                )}
              </form.Field>

              <fieldset className={styles.fieldset}>
                <legend className={`${styles.legend} text-body-sm-strong`}>Условия</legend>
                <div className={styles.stack}>
                  <form.Field name="firstOrderOnly">
                    {(field) => (
                      <Checkbox
                        name={field.name}
                        label="Только первый заказ"
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked === true)}
                      />
                    )}
                  </form.Field>

                  <form.Field name="hasMinOrder">
                    {(hasMinField) => (
                      <>
                        <Checkbox
                          name={hasMinField.name}
                          label="Есть минимальная сумма"
                          checked={hasMinField.state.value}
                          onCheckedChange={(checked) => hasMinField.handleChange(checked === true)}
                        />
                        {hasMinField.state.value && (
                          <div className={styles.nested}>
                            <form.Field name="minOrder">
                              {(minField) => (
                                <TextField
                                  label="Сумма, ₽"
                                  name={minField.name}
                                  type="number"
                                  inputMode="numeric"
                                  min={1}
                                  placeholder="1500"
                                  value={minField.state.value}
                                  onValueChange={minField.handleChange}
                                  error={fieldError(
                                    minField.state.meta.errors,
                                    minField.state.meta.isTouched || submissionAttempts > 0,
                                  )}
                                />
                              )}
                            </form.Field>
                          </div>
                        )}
                      </>
                    )}
                  </form.Field>

                  <form.Field name="hasPartialProducts">
                    {(hasPartialField) => (
                      <>
                        <Checkbox
                          name={hasPartialField.name}
                          label="Только часть товаров"
                          checked={hasPartialField.state.value}
                          onCheckedChange={(checked) => hasPartialField.handleChange(checked === true)}
                        />
                        {hasPartialField.state.value && (
                          <div className={styles.nested}>
                            <form.Field name="categoriesNote">
                              {(noteField) => (
                                <TextField
                                  label="Каких"
                                  name={noteField.name}
                                  placeholder="Например, готовая еда"
                                  value={noteField.state.value}
                                  onValueChange={noteField.handleChange}
                                />
                              )}
                            </form.Field>
                          </div>
                        )}
                      </>
                    )}
                  </form.Field>

                  <form.Field name="appOnly">
                    {(field) => (
                      <Checkbox
                        name={field.name}
                        label="Только в приложении"
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked === true)}
                      />
                    )}
                  </form.Field>
                </div>
              </fieldset>

              <div className={styles.fieldGroup}>
                <form.Field name="unknownExpiry">
                  {(unknownField) => (
                    <>
                      <div className={styles.dateField}>
                        <form.Field name="expiresAt">
                          {(dateField) => (
                            <TextField
                              label="Действует до"
                              name={dateField.name}
                              type="date"
                              trailingIcon={icons.Calendar}
                              disabled={unknownField.state.value}
                              value={dateField.state.value}
                              onValueChange={dateField.handleChange}
                            />
                          )}
                        </form.Field>
                      </div>
                      <Checkbox
                        name={unknownField.name}
                        label="Не знаю"
                        checked={unknownField.state.value}
                        onCheckedChange={(checked) => unknownField.handleChange(checked === true)}
                      />
                    </>
                  )}
                </form.Field>
              </div>

              <fieldset className={styles.fieldset}>
                <legend className={`${styles.legend} text-body-sm-strong`}>Где нашли</legend>
                <form.Field name="sourceKind">
                  {(sourceField) => {
                    const err = fieldError(
                      sourceField.state.meta.errors,
                      sourceField.state.meta.isTouched || submissionAttempts > 0,
                    )
                    return (
                      <>
                        <RadioGroup
                          name={sourceField.name}
                          label="Где нашли"
                          options={SUBMISSION_SOURCES}
                          value={sourceField.state.value}
                          onValueChange={(next) => sourceField.handleChange(submissionSourceDto.parse(next))}
                        />
                        {sourceField.state.value === 'telegram' && (
                          <div className={styles.nested}>
                            <form.Field name="sourceUrl">
                              {(urlField) => (
                                <TextField
                                  label="Ссылка на пост"
                                  name={urlField.name}
                                  type="url"
                                  helper="Необязательно"
                                  placeholder="t.me/channel/1234"
                                  value={urlField.state.value}
                                  onValueChange={urlField.handleChange}
                                />
                              )}
                            </form.Field>
                          </div>
                        )}
                        {err && (
                          <p className={`${styles.error} text-caption`} role="alert">
                            {err}
                          </p>
                        )}
                      </>
                    )
                  }}
                </form.Field>
              </fieldset>

              <fieldset className={styles.fieldset}>
                <legend className={`${styles.legend} text-body-sm-strong`}>Проверили сами?</legend>
                <form.Field name="selfChecked">
                  {(field) => {
                    const err = fieldError(
                      field.state.meta.errors,
                      field.state.meta.isTouched || submissionAttempts > 0,
                    )
                    return (
                      <>
                        <RadioGroup
                          name={field.name}
                          label="Проверили сами?"
                          className={styles.inlineRadio}
                          options={SELF_CHECK_OPTIONS}
                          value={field.state.value}
                          onValueChange={(next) => field.handleChange(next === 'yes' ? 'yes' : 'no')}
                        />
                        {err && (
                          <p className={`${styles.error} text-caption`} role="alert">
                            {err}
                          </p>
                        )}
                      </>
                    )
                  }}
                </form.Field>
              </fieldset>

              <form.Field name="notPersonal">
                {(field) => {
                  const err = fieldError(field.state.meta.errors, field.state.meta.isTouched || submissionAttempts > 0)
                  return (
                    <div className={styles.fieldGroup}>
                      <Checkbox
                        name={field.name}
                        label="Код не персональный и не одноразовый"
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked === true)}
                      />
                      {err && (
                        <p className={`${styles.error} text-caption`} role="alert">
                          {err}
                        </p>
                      )}
                    </div>
                  )
                }}
              </form.Field>

              {submitOffer.rateLimited && (
                <GotchaNote tone="warning" showTitle={false}>
                  Слишком много отправок за час. Попробуйте позже
                </GotchaNote>
              )}

              <div className={styles.submitWrap}>
                <form.Subscribe selector={(s) => submissionFormSchema.safeParse(s.values).success}>
                  {(canSubmit) => (
                    <Button type="submit" variant="primary" size="lg" disabled={!canSubmit || submitOffer.pending}>
                      {submitOffer.pending ? 'Отправляем…' : 'Отправить на проверку'}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </>
        )}
      </div>

      <aside className={styles.aside} aria-label="Что будет с кодом">
        <SectionHeader title="Что будет с кодом" className={styles.asideHeader} />
        <StepList label="Что будет с кодом" steps={WHAT_HAPPENS_STEPS} />
      </aside>
    </main>
  )
}
