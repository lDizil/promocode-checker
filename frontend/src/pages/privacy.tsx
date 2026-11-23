import { Link } from '@tanstack/react-router'

import { KeyValueGrid, type KeyValueItem } from '@/common/ui/KeyValueGrid/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'

import styles from './privacy.module.css'

const PRIVACY_SUMMARY: KeyValueItem[] = [
  { label: 'Регистрация и профили', value: 'Не требуются — сервис работает без аккаунтов' },
  { label: 'Cookie', value: 'Только для темы оформления (theme)' },
  { label: 'Рекламные трекеры', value: 'Не используются' },
  { label: 'Вопросы по данным', value: 'privacy@rabochiy-kod.ru' },
]

/** Статическая страница футера `/privacy`. */
export function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1 className="text-h1">Политика конфиденциальности</h1>
        <p className={`${styles.subtitle} text-body`}>
          «Рабочий код» в текущей версии работает без регистрации, аккаунтов и персональных профилей.
        </p>
      </header>

      <div className={styles.sections}>
        <section aria-labelledby="privacy-account">
          <SectionHeader id="privacy-account" title="Работа без регистрации" />
          <p className={`${styles.paragraph} text-body`}>
            Чтобы искать промокоды, копировать их, оставлять отзывы «Сработал» или «Не сработал» и присылать новые коды,
            создавать аккаунт не нужно. Мы не запрашиваем имя, телефон, электронную почту или платёжные данные.
          </p>
        </section>

        <section aria-labelledby="privacy-cookies">
          <SectionHeader id="privacy-cookies" title="Cookie и настройки темы" />
          <p className={`${styles.paragraph} text-body`}>
            Мы используем техническую cookie только для сохранения выбранной вами темы оформления (
            <code className={styles.code}>theme</code> — системная, светлая или тёмная), чтобы сервер сразу отдавал
            страницу в нужном оформлении. Сторонние рекламные пиксели и трекеры слежения на сайте не подключаются.
          </p>
        </section>

        <section aria-labelledby="privacy-submissions">
          <SectionHeader id="privacy-submissions" title="Передача кодов и переходы в магазины" />
          <p className={`${styles.paragraph} text-body`}>
            При отправке промокода через страницу <Link to="/submit">Прислать код</Link> мы сохраняем только название
            магазина, текст кода, условия акции и указанную ссылку на источник. Пожалуйста, не присылайте персональные
            или одноразовые коды, а также личные данные. Часть внешних ссылок на магазины — партнёрские; подробнее о
            маркировке и сортировке читайте на странице{' '}
            <Link to="/about/verification" hash="advertising">
              Как мы проверяем коды
            </Link>
            .
          </p>
        </section>

        <section aria-labelledby="privacy-summary">
          <SectionHeader id="privacy-summary" title="Коротко" />
          <KeyValueGrid items={PRIVACY_SUMMARY} />
        </section>
      </div>
    </main>
  )
}
