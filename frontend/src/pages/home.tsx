import { Link } from '@tanstack/react-router'

/** P-01. Sections arrive with BR-805; for now the page links the finished vertical slice. */
export function HomePage() {
  return (
    <main>
      <h1 className="text-display">Рабочие промокоды</h1>
      <p>
        <Link to="/m/$slug" params={{ slug: 'samokat' }}>
          Промокоды Самоката
        </Link>
      </p>
    </main>
  )
}
