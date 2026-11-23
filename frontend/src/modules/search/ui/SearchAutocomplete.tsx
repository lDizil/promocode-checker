import { Link, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { plural, type PluralForms } from '@/common/plural.ts'
import { Autocomplete, type AutocompleteGroupData, type AutocompleteOption } from '@/common/ui/Autocomplete/index.ts'
import { IconButton } from '@/common/ui/Button/index.ts'
import { Icon, icons, type IconGlyph } from '@/common/ui/Icon/index.ts'
import { Skeleton } from '@/common/ui/Skeleton/index.ts'
import { MerchantAvatar } from '@/modules/merchant/index.ts'

import { useAutoFocus } from '../hooks/useAutoFocus.ts'
import { useRecentSearches } from '../hooks/useRecentSearches.ts'
import { useSearchSuggest } from '../hooks/useSearchSuggest.ts'
import { splitHighlight } from '../model/search.ts'
import styles from './SearchAutocomplete.module.css'

const VERIFIED_OFFER_FORMS: PluralForms = {
  one: 'проверенный оффер',
  few: 'проверенных оффера',
  many: 'проверенных офферов',
}

function categoryIcon(categorySlug: string | null): IconGlyph {
  if (!categorySlug) return icons.LayoutGrid
  if (categorySlug === 'food') return icons.Utensils
  if (categorySlug === 'marketplaces') return icons.Package
  if (categorySlug === 'clothing') return icons.Shirt
  if (categorySlug === 'subscriptions') return icons.Smartphone
  if (categorySlug === 'travel') return icons.Plane
  if (categorySlug === 'free/students') return icons.GraduationCap
  if (categorySlug === 'free/ai' || categorySlug === 'free') return icons.Gift
  if (categorySlug.startsWith('free')) return icons.Cloud
  return icons.LayoutGrid
}

function catalogHref(categorySlug: string | null): string {
  return categorySlug ? `/catalog/${categorySlug}` : '/catalog'
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const parts = splitHighlight(text, query)
  return (
    <>
      {parts.map((part, index) =>
        part.match ? (
          <strong key={index} className={styles.match}>
            {part.text}
          </strong>
        ) : (
          part.text
        ),
      )}
    </>
  )
}

interface SearchTarget {
  to: string
  params?: { slug: string }
  search?: { q: string }
  recentTerm: string
}

export interface SearchAutocompleteProps {
  variant?: 'boxed' | 'bare'
  size?: 'md' | 'lg'
  placeholder?: string
  ariaLabel?: string
  className?: string
  contentClassName?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  focusOnMount?: boolean
  onNavigate?: () => void
}

export function SearchAutocomplete({
  variant = 'boxed',
  size = 'md',
  placeholder = 'Магазин или сервис, например Самокат',
  ariaLabel = 'Поиск по магазинам и сервисам',
  className,
  contentClassName,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  focusOnMount = false,
  onNavigate,
}: SearchAutocompleteProps) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [internalQuery, setInternalQuery] = useState(defaultValue)
  const [open, setOpen] = useState(false)

  useAutoFocus(rootRef, focusOnMount)

  const query = controlledValue ?? internalQuery
  const setQuery = (next: string) => {
    if (controlledValue === undefined) setInternalQuery(next)
    onValueChange?.(next)
  }

  const trimmed = query.trim()
  const { recent, add: addRecent, remove: removeRecent } = useRecentSearches()
  const { data, isLoading, isError } = useSearchSuggest(query)

  const targets = new Map<string, SearchTarget>()
  const groups: AutocompleteGroupData[] = []

  if (trimmed !== '' && data && data.items.length > 0) {
    const merchantOptions: AutocompleteOption[] = []
    const categoryOptions: AutocompleteOption[] = []
    const queryOptions: AutocompleteOption[] = []

    for (const item of data.items) {
      if (item.kind === 'merchant' && item.slug) {
        const count = item.offerCount ?? 0
        targets.set(item.id, { to: '/m/$slug', params: { slug: item.slug }, recentTerm: item.title })
        merchantOptions.push({
          value: item.id,
          label: item.title,
          titleContent: <HighlightText text={item.title} query={trimmed} />,
          subtitle: `${count} ${plural(count, VERIFIED_OFFER_FORMS)}`,
          leading: <MerchantAvatar name={item.title} logoUrl={item.logoUrl} size={32} />,
          render: <Link to="/m/$slug" params={{ slug: item.slug }} />,
        })
      } else if (item.kind === 'category') {
        const path = catalogHref(item.categorySlug)
        targets.set(item.id, { to: path, recentTerm: item.title })
        categoryOptions.push({
          value: item.id,
          label: item.title,
          titleContent: <HighlightText text={item.title} query={trimmed} />,
          subtitle: item.subtitle ?? 'Категория',
          leading: (
            <span className={styles.iconBox}>
              <Icon icon={categoryIcon(item.categorySlug)} size={16} />
            </span>
          ),
          render: <Link to={path} />,
        })
      } else if (item.kind === 'query') {
        targets.set(item.id, { to: '/search', search: { q: trimmed }, recentTerm: trimmed })
        queryOptions.push({
          value: item.id,
          label: trimmed,
          titleContent: (
            <>
              Искать «<strong className={styles.match}>{trimmed}</strong>» во всех офферах
            </>
          ),
          leading: (
            <span className={styles.iconBox}>
              <Icon icon={icons.Search} size={16} />
            </span>
          ),
          trailingIcon: icons.ArrowRight,
          render: <Link to={'/search' as string} search={{ q: trimmed } as never} />,
        })
      }
    }

    if (merchantOptions.length > 0) {
      groups.push({ key: 'merchants', label: 'Магазины и сервисы', options: merchantOptions })
    }
    if (categoryOptions.length > 0) {
      groups.push({ key: 'categories', label: 'Категории', options: categoryOptions })
    }
    if (queryOptions.length > 0) {
      groups.push({ key: 'query', options: queryOptions })
    }
  }

  const closeAndNotify = () => {
    setOpen(false)
    onNavigate?.()
  }

  const handleOptionSelect = (option: AutocompleteOption) => {
    const target = targets.get(option.value)
    if (!target) return
    addRecent(target.recentTerm)
    closeAndNotify()
    if (target.params) {
      void navigate({ to: '/m/$slug', params: target.params })
    } else if (target.search) {
      void navigate({ to: '/search' as string, search: target.search as never })
    } else {
      void navigate({ to: target.to })
    }
  }

  const handleSubmit = (submitted: string, event?: Event) => {
    event?.preventDefault()
    const next = submitted.trim()
    if (!next) return
    addRecent(next)
    closeAndNotify()
    void navigate({ to: '/search' as string, search: { q: next } as never })
  }

  const hasDropdownContent = trimmed.length > 0 || recent.length > 0
  const didYouMean = data?.didYouMean ?? null

  const loadingContent = (
    <div className={styles.loadingList} aria-busy="true" aria-label="Загружаем подсказки">
      {[0, 1, 2].map((idx) => (
        <div key={idx} className={styles.loadingRow}>
          <Skeleton width={32} height={32} radius="md" />
          <div className={styles.loadingText}>
            <Skeleton width="55%" height={16} radius="sm" />
            <Skeleton width="35%" height={12} radius="sm" />
          </div>
        </div>
      ))}
    </div>
  )

  const emptyContent =
    trimmed.length > 0 ? (
      isError ? (
        <div className={styles.emptyState}>
          <p className="text-body-sm">Не удалось загрузить подсказки</p>
          <Link
            className={[styles.emptyLink, 'text-body-sm-strong'].join(' ')}
            to={'/search' as string}
            search={{ q: trimmed } as never}
            onClick={() => {
              addRecent(trimmed)
              closeAndNotify()
            }}
          >
            Искать «{trimmed}» во всех офферах →
          </Link>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className="text-title">Ничего не нашли</p>
          {didYouMean && (
            <p className={[styles.didYouMean, 'text-body-sm'].join(' ')}>
              Возможно, вы имели в виду:{' '}
              <Link
                className={styles.emptyLink}
                to="/m/$slug"
                params={{ slug: didYouMean.slug }}
                onClick={closeAndNotify}
              >
                {didYouMean.name}
              </Link>
            </p>
          )}
          <Link
            className={[styles.emptyLink, 'text-body-sm-strong'].join(' ')}
            to="/submit"
            search={{ m: trimmed }}
            onClick={closeAndNotify}
          >
            Прислать код для „{trimmed}“ →
          </Link>
        </div>
      )
    ) : undefined

  const recentContent =
    trimmed === '' && recent.length > 0 ? (
      <section className={styles.recentSection} aria-labelledby="search-recent-label">
        <p id="search-recent-label" className={[styles.recentLabel, 'text-caption'].join(' ')}>
          Вы искали
        </p>
        <ul className={styles.recentList}>
          {recent.map((term) => (
            <li key={term} className={styles.recentRow}>
              <Link
                className={styles.recentLink}
                to="/search"
                search={{ q: term } as never}
                onClick={() => {
                  addRecent(term)
                  closeAndNotify()
                }}
              >
                <span className={styles.iconBox} aria-hidden="true">
                  <Icon icon={icons.History} size={16} />
                </span>
                <span className={[styles.recentTerm, 'text-title'].join(' ')}>{term}</span>
              </Link>
              <IconButton
                variant="ghost"
                size="sm"
                icon={icons.X}
                label={`Удалить запрос ${term}`}
                onClick={() => removeRecent(term)}
              />
            </li>
          ))}
        </ul>
      </section>
    ) : undefined

  return (
    <div ref={rootRef} className={className}>
      <Autocomplete
        variant={variant}
        size={size}
        value={query}
        open={hasDropdownContent ? open : false}
        openOnFocus={hasDropdownContent}
        onOpenChange={(next) => setOpen(next)}
        onValueChange={(next) => setQuery(next)}
        onOptionSelect={handleOptionSelect}
        onSubmit={handleSubmit}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        contentClassName={[styles.dropdown, contentClassName].filter(Boolean).join(' ')}
        groups={groups}
        loading={isLoading}
        loadingContent={loadingContent}
        recentContent={recentContent}
        emptyContent={emptyContent}
        footer={<span className={styles.desktopFooter}>↑↓ — выбор · Enter — перейти · Esc — закрыть</span>}
      />
    </div>
  )
}
