# Frontend

Клиентское приложение сервиса «Рабочий код»: проверенные промокоды и бесплатные офферы.

Стек: TanStack Start (SSR) + Router + Query, React 19, zod, CSS Modules, ui-sdk, Storybook. Архитектура — FEOD. Правила и команды — в [`AGENTS.md`](./AGENTS.md), решения — в [`docs/adr/`](./docs/adr/).

```sh
pnpm install
pnpm dev          # http://localhost:3000, API отдаёт MSW
pnpm storybook    # http://localhost:6006
```

Production: `docker build -t promocode-frontend . && docker run -p 3000:3000 -e API_ORIGIN=https://api.example promocode-frontend`. `API_ORIGIN` — адрес бэкенда для SSR-запросов; браузер ходит на `/api` того же хоста.
