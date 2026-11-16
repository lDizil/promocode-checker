import type { CSSProperties } from 'react'

import styles from './Skeleton.module.css'

export interface SkeletonProps {
  width?: CSSProperties['inlineSize']
  height: CSSProperties['blockSize']
  radius?: 'sm' | 'md' | 'full'
}

/** DESIGN_SPEC 3.28: neutral-bg blocks with a 1.2 s shimmer. Wrap groups in an element with aria-busy. */
export function Skeleton({ width = '100%', height, radius = 'md' }: SkeletonProps) {
  return <span className={styles.skeleton} data-radius={radius} style={{ inlineSize: width, blockSize: height }} />
}
