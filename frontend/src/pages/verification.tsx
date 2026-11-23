import { AnchorNav, type AnchorNavItem } from '@/common/ui/AnchorNav/index.ts'
import { Icon, icons } from '@/common/ui/Icon/index.ts'
import { KeyValueGrid, type KeyValueItem } from '@/common/ui/KeyValueGrid/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'
import { StepList, type StepListItem } from '@/common/ui/StepList/index.ts'
import { useActiveAnchor } from '@/common/use-active-anchor.ts'
import { ScoreBadge, type ScoreLevel } from '@/modules/offer/index.ts'

import styles from './verification.module.css'

const ANCHOR_ITEMS: readonly AnchorNavItem[] = [
  { id: 'how', label: 'Как проверяем' },
  { id: 'score', label: 'Шанс сработать' },
  { id: 'dont', label: 'Чего не делаем' },
  { id: 'advertising', label: 'Реклама и партнёры' },
]

const ANCHOR_IDS = ANCHOR_ITEMS.map((item) => item.id)

const HOW_STEPS: StepListItem[] = [
  {
    title: 'Берём коды',
    description: 'У партнёрских сетей, с сайтов магазинов и от пользователей',
    state: 'done',
    icon: icons.Plus,
  },
  {
    title: 'Проверяем',
    description: 'Статус у партнёра, отзывы за 7 дней, дату окончания',
    state: 'done',
    icon: icons.ShieldCheck,
  },
  {
    title: 'Считаем шанс',
    description: 'Показываем шанс сработать и все условия рядом с кодом',
    state: 'current',
    icon: icons.Check,
  },
]

const SCORE_LEVELS: readonly {
  level: ScoreLevel
  score?: number
  range: string
  description: string
}[] = [
  {
    level: 'high',
    score: 86,
    range: '70–100',
    description: 'Сработал у большинства за 7 дней. Обычно можно просто копировать',
  },
  {
    level: 'medium',
    score: 58,
    range: '40–69',
    description: 'Срабатывает через раз — прочитайте условия',
  },
  {
    level: 'low',
    range: '0–39',
    description: 'Много жалоб. Пробуйте на свой риск',
  },
  {
    level: 'unknown',
    range: 'Нет данных',
    description: 'Код новый, отзывов ещё нет',
  },
]

const DONT_ITEMS: readonly string[] = [
  'Не публикуем персональные и одноразовые коды',
  'Не читаем закрытые каналы без согласия владельца',
  'Не прячем коды за кнопками и не размываем их',
  'Не пишем «100% рабочий»',
]

const ADVERTISING_ITEMS: KeyValueItem[] = [
  { label: 'Оператор сайта', value: 'ООО «Рабочий код», ИНН 0000000000' },
  { label: 'Метка', value: '«Реклама» и erid у каждого партнёрского оффера' },
  { label: 'Сортировка', value: 'Не зависит от комиссии — только от шанса сработать' },
  { label: 'Контакты', value: 'ads@rabochiy-kod.ru' },
]

/** P-11 «Как мы проверяем коды» (DESIGN_SPEC 4.12). */
export function VerificationPage() {
  const activeAnchor = useActiveAnchor(ANCHOR_IDS)

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1 className="text-h1">Как мы проверяем коды</h1>
        <p className={`${styles.subtitle} text-body`}>
          Показываем, откуда код, когда его проверили и сколько раз он сработал. Без «100% рабочих» обещаний.
        </p>
      </header>

      <div className={styles.columns}>
        <AnchorNav items={ANCHOR_ITEMS} activeId={activeAnchor} className={styles.anchorNav} />

        <div className={styles.body}>
          <section id="how" aria-labelledby="how-title" className={styles.section}>
            <SectionHeader id="how-title" title="Откуда коды и как проверяем" />
            <StepList label="Откуда коды и как проверяем" steps={HOW_STEPS} />
          </section>

          <section id="score" aria-labelledby="score-title" className={styles.section}>
            <SectionHeader id="score-title" title="Что значит шанс сработать" />
            <ul className={styles.scoreList}>
              {SCORE_LEVELS.map((item) => (
                <li key={item.level} className={styles.scoreRow}>
                  <div className={styles.scoreBadgeWrap}>
                    <ScoreBadge level={item.level} score={item.score ?? null} />
                  </div>
                  <div className={styles.scoreText}>
                    <span className="text-body-sm-strong">{item.range}</span>
                    <p className={`${styles.muted} text-body-sm`}>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section id="dont" aria-labelledby="dont-title" className={styles.section}>
            <SectionHeader id="dont-title" title="Чего мы не делаем" />
            <ul className={styles.dontList}>
              {DONT_ITEMS.map((item) => (
                <li key={item} className={styles.dontItem}>
                  <Icon icon={icons.CircleX} size={20} className={styles.dontIcon} />
                  <span className="text-body">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="advertising" aria-labelledby="advertising-title" className={styles.section}>
            <SectionHeader id="advertising-title" title="Реклама и партнёры" />
            <p className={`${styles.advText} text-body`}>
              Часть ссылок — партнёрские: если вы купите по ним, магазин платит нам комиссию. Такие офферы помечены
              «Реклама», у каждого указаны рекламодатель и erid. Комиссия не влияет на порядок офферов: сначала всегда
              идут коды с высоким шансом.
            </p>
            <KeyValueGrid items={ADVERTISING_ITEMS} />
          </section>
        </div>
      </div>
    </main>
  )
}
