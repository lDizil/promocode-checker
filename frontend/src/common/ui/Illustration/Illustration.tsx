import type { ReactNode } from 'react'

import styles from './Illustration.module.css'

export type IllustrationName = 'grocery-bag' | 'parcel' | 'cloud-coin' | 'empty-cart' | 'plug'

export interface IllustrationProps {
  name: IllustrationName
  className?: string
}

/**
 * DESIGN_SPEC 3.35, paths exported from Figma `Illustration/*` (02 Components).
 * Colours map to tokens, so the dark theme follows (rule 1.11.8). Decorative: hidden from AT.
 */
export function Illustration({ name, className }: IllustrationProps) {
  const [viewBox, art] = ART[name]
  const [, , width, height] = viewBox.split(' ')
  return (
    <svg
      viewBox={viewBox}
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={[styles.root, className].filter(Boolean).join(' ')}
    >
      {art}
    </svg>
  )
}

const ART: Record<IllustrationName, [viewBox: string, art: ReactNode]> = {
  'grocery-bag': [
    '0 0 120 110',
    <>
      <path d="M66 40L90 6C92 3 98 4 98 9L74 46L66 40Z" className={`${styles.yellow} ${styles.ink}`} />
      <path d="M36 40C28 24 36 12 44 8C48 20 46 32 38 40H36Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M46 40C46 28 56 20 64 20C62 30 56 38 48 40H46Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M22 40H98L92 108H28L22 40Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M22 40L28 32H92L98 40" className={styles.ink} />
      <path
        d="M60 87C67.1797 87 73 81.1797 73 74C73 66.8203 67.1797 61 60 61C52.8203 61 47 66.8203 47 74C47 81.1797 52.8203 87 60 87Z"
        className={`${styles.yellow} ${styles.ink}`}
      />
      <path d="M55 79L65 69M55.5 69.5H56M64.5 78.5H65" className={styles.ink} />
    </>,
  ],
  parcel: [
    '0 0 120 110',
    <>
      <path d="M20 50L8 36L48 20L60 34L20 50Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M100 50L112 36L72 20L60 34L100 50Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M20 50L60 34L100 50L60 66L20 50Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M20 50L60 66V112L20 96V50Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M60 66L100 50V96L60 112V66Z" className={`${styles.paper} ${styles.ink}`} />
      <path d="M74 60.4L82 57.2V76L74 79.2V60.4Z" className={`${styles.purple} ${styles.ink}`} />
      <path d="M28 86L44 92.4" className={styles.ink} />
    </>,
  ],
  'cloud-coin': [
    '0 0 120 110',
    <>
      <path
        d="M30 80C14 80 12 58 28 56C28 38 48 32 56 44C62 26 90 28 90 50C106 50 108 80 92 80H30Z"
        className={`${styles.paper} ${styles.ink}`}
      />
      <path
        d="M46 108C52.6274 108 58 102.627 58 96C58 89.3726 52.6274 84 46 84C39.3726 84 34 89.3726 34 96C34 102.627 39.3726 108 46 108Z"
        className={`${styles.yellow} ${styles.ink}`}
      />
      <path
        d="M70 108C78.8366 108 86 100.837 86 92C86 83.1634 78.8366 76 70 76C61.1634 76 54 83.1634 54 92C54 100.837 61.1634 108 70 108Z"
        className={`${styles.yellow} ${styles.ink}`}
      />
      <path
        d="M79 92C79 96.9706 74.9706 101 70 101C65.0294 101 61 96.9706 61 92C61 87.0294 65.0294 83 70 83C74.9706 83 79 87.0294 79 92Z"
        className={styles.ink}
      />
      <path d="M100 18V24M100 24V30M100 24H94M100 24H106" className={styles.ink} />
    </>,
  ],
  'empty-cart': [
    '0 0 160 120',
    <>
      <path d="M22 22H40L54 78H120L134 36H46" className={styles.ink} />
      <path d="M46 36H134L120 78H54L46 36Z" className={`${styles.paper} ${styles.ink}`} />
      <path
        d="M62 105C66.9706 105 71 100.971 71 96C71 91.0294 66.9706 87 62 87C57.0294 87 53 91.0294 53 96C53 100.971 57.0294 105 62 105Z"
        className={`${styles.yellow} ${styles.ink}`}
      />
      <path
        d="M112 105C116.971 105 121 100.971 121 96C121 91.0294 116.971 87 112 87C107.029 87 103 91.0294 103 96C103 100.971 107.029 105 112 105Z"
        className={`${styles.yellow} ${styles.ink}`}
      />
      <path
        d="M78 8H106C106.796 8 107.559 8.31607 108.121 8.87868C108.684 9.44129 109 10.2044 109 11V15C107.939 15 106.922 15.4214 106.172 16.1716C105.421 16.9217 105 17.9391 105 19C105 20.0609 105.421 21.0783 106.172 21.8284C106.922 22.5786 107.939 23 109 23V27C109 27.7956 108.684 28.5587 108.121 29.1213C107.559 29.6839 106.796 30 106 30H78C77.2044 30 76.4413 29.6839 75.8787 29.1213C75.3161 28.5587 75 27.7956 75 27V23C76.0609 23 77.0783 22.5786 77.8284 21.8284C78.5786 21.0783 79 20.0609 79 19C79 17.9391 78.5786 16.9217 77.8284 16.1716C77.0783 15.4214 76.0609 15 75 15V11C75 10.2044 75.3161 9.44129 75.8787 8.87868C76.4413 8.31607 77.2044 8 78 8Z"
        className={`${styles.purple} ${styles.ink}`}
      />
      <path d="M86 19H87.2M98 19H96.8M90.8 19H93.2" className={styles.inkOnAccent} />
    </>,
  ],
  plug: [
    '0 0 160 120',
    <>
      <path
        d="M112 44C119.732 44 126 37.732 126 30C126 22.268 119.732 16 112 16C104.268 16 98 22.268 98 30C98 37.732 104.268 44 112 44Z"
        className={styles.yellow}
      />
      <path d="M8 100H152" className={styles.ink} />
      <path
        d="M134 36H100C96.6863 36 94 38.6863 94 42V88C94 91.3137 96.6863 94 100 94H134C137.314 94 140 91.3137 140 88V42C140 38.6863 137.314 36 134 36Z"
        className={`${styles.paper} ${styles.ink}`}
      />
      <path
        d="M113 56.5C113 55.1193 111.881 54 110.5 54C109.119 54 108 55.1193 108 56.5V65.5C108 66.8807 109.119 68 110.5 68C111.881 68 113 66.8807 113 65.5V56.5Z"
        className={`${styles.neutral} ${styles.ink}`}
      />
      <path
        d="M126 56.5C126 55.1193 124.881 54 123.5 54C122.119 54 121 55.1193 121 56.5V65.5C121 66.8807 122.119 68 123.5 68C124.881 68 126 66.8807 126 65.5V56.5Z"
        className={`${styles.neutral} ${styles.ink}`}
      />
      <path d="M40 64C22 64 30 96 10 96" className={styles.ink} />
      <path
        d="M65 46H45C42.2386 46 40 48.2386 40 51V77C40 79.7614 42.2386 82 45 82H65C67.7614 82 70 79.7614 70 77V51C70 48.2386 67.7614 46 65 46Z"
        className={`${styles.purple} ${styles.ink}`}
      />
      <path d="M70 56H80M70 72H80" className={styles.ink} />
      <path d="M86 48L89 52M88 64H92M86 80L89 76" className={styles.ink} />
      <path d="M49 58H61" className={styles.inkOnAccent} />
    </>,
  ],
}
