import { Link } from '@tanstack/react-router'

import { Button } from '@/common/ui/Button/index.ts'
import { KeyValueGrid, type KeyValueItem } from '@/common/ui/KeyValueGrid/index.ts'
import { SectionHeader } from '@/common/ui/SectionHeader/index.ts'

import styles from './contacts.module.css'

const CONTACT_CHANNELS: KeyValueItem[] = [
  {
    label: 'Обратная связь и ошибки',
    value: <a href="mailto:hello@rabochiy-kod.ru">hello@rabochiy-kod.ru</a>,
  },
  {
    label: 'Партнёрства и реклама',
    value: <a href="mailto:ads@rabochiy-kod.ru">ads@rabochiy-kod.ru</a>,
  },
  {
    label: 'Оператор сайта',
    value: 'ООО «Рабочий код», ИНН 0000000000',
  },
  {
    label: 'Ответ на обращения',
    value: 'Обычно в течение 1–2 рабочих дней',
  },
]

/** Статическая страница футера `/contacts`. */
export function ContactsPage() {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1 className="text-h1">Контакты</h1>
        <p className={`${styles.subtitle} text-body`}>
          Вопросы по работе сервиса, исправление условий промокодов, партнёрство и реклама.
        </p>
      </header>

      <div className={styles.sections}>
        <section aria-labelledby="contacts-channels">
          <SectionHeader id="contacts-channels" title="Связь с командой" />
          <KeyValueGrid items={CONTACT_CHANNELS} />
        </section>

        <section aria-labelledby="contacts-codes">
          <SectionHeader id="contacts-codes" title="Прислать код или сообщить об ошибке" />
          <p className={`${styles.paragraph} text-body`}>
            Если у вас есть рабочий промокод для любого магазина или сервиса, его можно отправить через форму модерации.
            Чтобы сообщить о неверных условиях или истёкшем предложении, нажмите «Нет» в карточке оффера или напишите
            нам на почту.
          </p>
          <div className={styles.actions}>
            <Button variant="primary" size="md" render={<Link to="/submit" />}>
              Прислать код
            </Button>
            <Button variant="secondary" size="md" render={<Link to="/about/verification" />}>
              Как мы проверяем коды
            </Button>
          </div>
        </section>

        <section aria-labelledby="contacts-ads">
          <SectionHeader id="contacts-ads" title="Реклама и партнёрские программы" />
          <p className={`${styles.paragraph} text-body`}>
            По вопросам подключения партнёрских сетей и размещения рекламных предложений пишите на{' '}
            <a href="mailto:ads@rabochiy-kod.ru">ads@rabochiy-kod.ru</a>. Подробно о правилах маркировки, erid и о том,
            почему комиссия не влияет на сортировку кодов, мы рассказываем в разделе{' '}
            <Link to="/about/verification" hash="advertising">
              Реклама и партнёры
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
