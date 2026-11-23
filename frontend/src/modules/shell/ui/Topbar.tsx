import { useQuery } from '@tanstack/react-query'

import { icons } from '@/common/ui/Icon/index.ts'
import { ThemeToggle, type ThemeValue } from '@/common/ui/ThemeToggle/index.ts'
import { TopbarChip } from '@/common/ui/TopbarChip/index.ts'
import { offerQueries } from '@/modules/offer/index.ts'
import { SearchAutocomplete } from '@/modules/search/index.ts'

import styles from './AppShell.module.css'

const VERIFIED_COUNT_FORMAT = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 })
const FALLBACK_VERIFIED_TODAY = 1240

export interface TopbarProps {
  theme: ThemeValue
  onThemeChange: (value: ThemeValue) => void
}

export function Topbar({ theme, onThemeChange }: TopbarProps) {
  const { data } = useQuery(offerQueries.recent())
  const verifiedToday = data?.stats.verifiedToday ?? FALLBACK_VERIFIED_TODAY
  const verifiedTodayFormatted = VERIFIED_COUNT_FORMAT.format(verifiedToday)

  return (
    <div className={styles.topbar}>
      <SearchAutocomplete variant="bare" size="md" className={styles.topbarSearch} />
      <div className={styles.topbarActions}>
        <TopbarChip icon={icons.ShieldCheck}>{verifiedTodayFormatted} проверено сегодня</TopbarChip>
        <ThemeToggle variant="pill" value={theme} onChange={onThemeChange} />
      </div>
    </div>
  )
}
