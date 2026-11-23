import { Button as Primitive } from '@ui-sdk/react/button'
import type { ComponentProps, ReactNode } from 'react'

import { Illustration, type IllustrationName } from '../Illustration/Illustration.tsx'
import styles from './CategoryTile.module.css'

type PrimitiveProps = ComponentProps<typeof Primitive>

export type CategoryTileTone = 'light' | 'yellow' | 'purple'

export interface CategoryTileProps {
  number: string
  title: ReactNode
  tone: CategoryTileTone
  illustration: Extract<IllustrationName, 'grocery-bag' | 'parcel' | 'cloud-coin'>
  /** Router link element, e.g. `<Link to="/catalog/$category" params={{ category: 'food' }} />`. */
  render?: PrimitiveProps['render']
  href?: string
  className?: string
}

/** DESIGN_SPEC 3.7a: hero category tile with index, title and overflowing line illustration. */
export function CategoryTile({ number, title, tone, illustration, render, href, className }: CategoryTileProps) {
  return (
    <Primitive
      render={render ?? <a href={href ?? '#'} />}
      data-tone={tone}
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      <span className={[styles.number, 'text-caption'].join(' ')}>{number}</span>
      <span className={[styles.title, 'text-tile'].join(' ')}>{title}</span>
      <span className={styles.art} aria-hidden="true">
        <Illustration name={illustration} />
      </span>
    </Primitive>
  )
}
