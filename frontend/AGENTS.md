# Frontend: правила для агентов

Общие правила репозитория — в корневом `AGENTS.md`. Термины — в `GLOSSARY.md`, решения — в `frontend/docs/adr/`, прогресс — в `frontend/PROGRESS.md`.

## Стек

TanStack Start (SSR) + Router + Query, React 19, zod 4, TanStack Form, CSS Modules (Lightning CSS), ui-sdk (`@ui-sdk/react`, beta, точная версия), lucide, MSW, Storybook 10 (CSF Next) + Vitest browser mode, oxlint + плагин FEOD, oxfmt. Node 24 (`.nvmrc`), pnpm.

## Команды

| Что                          | Команда                                                |
| ---------------------------- | ------------------------------------------------------ |
| dev-сервер с моками          | `pnpm dev` (`VITE_API_MOCKS=on` из `.env.development`) |
| сборка / запуск              | `pnpm build` / `pnpm start`                            |
| типы                         | `pnpm typecheck`                                       |
| линт / формат                | `pnpm lint` / `pnpm format:check`                      |
| unit-тесты `model/`          | `pnpm test`                                            |
| тесты сторис (браузер, a11y) | `pnpm test:stories`                                    |
| Storybook                    | `pnpm storybook`                                       |
| токены из `tokens/*.json`    | `pnpm tokens`                                          |
| UI до/после                  | `pnpm verify:ui` — отчёт `.verify/report.md`           |
| проверка цветовых токенов     | `pnpm lint:tokens`                                    |
| тесты самого верификатора     | `pnpm test:verify`                                    |
| установка commit gate        | `pnpm verify:install`                                 |

## Архитектура (FEOD)

- Слои: `src/app` → `src/pages` → `src/modules` → `src/common`; импорт только вниз. Проверяет `oxlint` (`feod.config.json`).
- `app/`: роуты (`app/routes`, тонкие: `validateSearch`, `loader`, `head`, рендер страницы), роутер, server/client entry, интеграции (моки).
- `pages/`: одна страница — один файл (`pages/merchant.tsx`); приватные части — в `pages/_<name>/`. Страница собирает модули и не содержит бизнес-логики.
- `modules/<name>/`: `api/` (zod DTO, `queryOptions`, `*.mocks.ts`), `model/` (чистые функции домена, unit-тесты), `hooks/` (единственное место для эффектов), `ui/` (презентационные композиты). Публичный API — `index.ts`, моки — `mocks.ts`.
- `common/`: обезличенные однофайловые утилиты (`http.ts`, `logger.ts`, `query-keys.ts`) и `common/ui` — UI kit (ADR 0002).
- `useEffect`/`useLayoutEffect` запрещены в `common/ui`, `modules/*/ui`, `pages`.
- `@ui-sdk/*` и `lucide-react` импортируются только в `common/ui`; иконки берутся из `@/common/ui/Icon/index.ts`.
- Ключи запросов: каждый модуль строит их через `createQueryKeys('<scope>')` и экспортирует фабрику `queryOptions`.
- Ответы API парсятся zod строго (`apiGet`/`apiSend`), расхождение контракта = ошибка (ADR 0003).

## UI kit

- Перед работой с компонентами прочитать skill ui-sdk: `node_modules/@ui-sdk/core/skills/ui-sdk/SKILL.md` и `node_modules/@ui-sdk/react/docs/llms.txt`.
- Пропсы повторяют свойства вариантов Figma; hover/focus/disabled — CSS-состояния.
- Только токены (`--color-*`, `--space-*`, ...) и классы `.text-*`; цвета не хардкодить. Тёмная тема — через токены.
- Сторис на каждый вариант и граничные данные; фейковые данные детерминированы (`faker.seed`, `STORY_NOW`). a11y-нарушение валит тест.
- Токены: источник — Figma Variables, выгрузка в `tokens/*.json` (DTCG), `pnpm tokens` собирает `src/app/styles/tokens.css`. Руками `tokens.css` не править.

## Обратная связь перед UI-коммитом

- Обязательно прочитать `.agents/skills/verify/SKILL.md` (от корня repo) и [`docs/VERIFY.md`](docs/VERIFY.md). Один успешный клик или «посмотрел скриншот» — не доказательство качества UI.
- Сравнить `HEAD` и текущую версию при одинаковых viewport/теме/данных: `pnpm verify:ui`. Отчёт перечисляет пропавшие иконки/контролы, размеры, смещения, стили и пиксельные отличия. Проверить соседние элементы, не только добавленную иконку.
- Новые нарушения геометрии исправлять, непредусмотренные задачей изменения откатывать. Намеренные отличия подтверждать по одному ID с причиной из задачи; массовая приёмка запрещена. Штамп привязан к проверенному коду и инструментам проверки.
- Для нового экрана/состояния дополнить `scripts/verify/scenarios.ts`. Storybook проверяет компоненты, runner — страницы; изменённое поведение дополнительно пройти реальным вводом через `ui-testing`.
- Сравнение с базой ловит регрессии, но не подтверждает соответствие Figma. Проверять макет и токены отдельно. Не менять проверки/эталон ради зелёного результата. После трёх неудачных исправлений эскалировать с before/after/diff и измерениями.


## Browser support

Baseline Widely available без полифилов. Фичи Newly available — только с feature-detect и рабочей деградацией. Цели Lightning CSS заданы в `vite.config.ts`.
