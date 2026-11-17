import { Link } from '@tanstack/react-router'

import styles from './AppShell.module.css'

interface FooterLink {
  label: string
  to: string
  hash?: string
}

const LINKS: readonly FooterLink[] = [
  { label: 'Как мы проверяем', to: '/about/verification' },
  { label: 'Реклама и партнёры', to: '/about/verification', hash: 'advertising' },
  { label: 'Прислать код', to: '/submit' },
  { label: 'Политика конфиденциальности', to: '/privacy' },
  { label: 'Контакты', to: '/contacts' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.footerLinks} aria-label="Ссылки в подвале">
        {LINKS.map((link) => (
          <Link key={link.label} className={styles.footerLink} to={link.to} hash={link.hash}>
            {link.label}
          </Link>
        ))}
      </nav>
      <p className={styles.copyright}>
        © 2026 Рабочий код. Мы получаем комиссию по части ссылок — они помечены „Реклама“.
      </p>
    </footer>
  )
}
