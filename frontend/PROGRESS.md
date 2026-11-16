# PROGRESS — фронтенд (BR-786)

YouTrack: BR-786 «Сделать основу frontend» (In Progress), GitHub issue #2, ветка `BR-786-frontend-foundation`.

## State

- Архитектура согласована (грилинг 16.11.2026): ADR 0001–0003, `GLOSSARY.md`, правила — `frontend/AGENTS.md`.
- Скелет: TanStack Start SSR (роуты в `src/app/routes`, entry `src/app/{router.tsx,server.ts,client.tsx}`), Query SSR-интеграция, MSW в браузере и на SSR-сервере, тема в cookie, Google Fonts.
- Токены: `tokens/*.json` (DTCG) → `pnpm tokens` → `src/app/styles/tokens.css`. Значения выгружены из Figma Variables (`color`, `color-dark`, `size`) и текстовых стилей 16.11.2026. В Figma display/h1/h2 — Inter, не Inter Tight, как в spec 1.4; взято из Figma.
- Модули `offer` (DTO, model, queries, mocks, фильтры, feedback), `merchant`, `theme`, `shell` (`AppShell`). UI kit — `src/common/ui` (в т.ч. `Illustration` из Figma `Illustration/*`, цвета через токены).
- Страница P-04 `/m/$slug` собрана: SSR, 404, фильтры, копирование кода + Toast, отзыв «Сработал?», светлая/тёмная тема. Корень — `shellComponent` с `AppShell` и `Toaster`.
- Проверки зелёные: build, typecheck, lint, format:check, test (9), test:stories (268). P-04 проверена в браузере на 1440 и 390, тёмная тема, копирование.

## Next step

- Закоммитить, запушить, открыть PR «BR-786: Сделать основу frontend» (Closes #2).
- После merge: BR-786 → Fixed. Дальше — остальные страницы (P-01 главная и т.д.) отдельными задачами.

## Known issues

- `@custom-media` не используется: Lightning CSS компилирует каждый CSS Module отдельно, общий `@custom-media` не виден. Брейкпоинт — литерал `(width >= 1024px)`.
- Логгер в `src/common/logger.ts`, а не в `app/integrations`: его вызывает `common/http.ts`, а `common` не может импортировать `app`. Транспорт подменяется `setLogTransport` из `app`.
- Прод: браузер ходит на `/api` своего хоста. Нужен reverse proxy `/api → backend` (или server route-прокси в Start) — решить вместе с BR-787.
- Расхождения shell со spec 3.1/3.2: в Topbar нет TopbarChip и ThemeToggle (тема — внизу сайдбара), в навигации нет «Прислать код»; маршрутов `/privacy`, `/contacts`, `/catalog`, `/about/verification` пока нет.
- `Illustration/qr` (160×160) не выгружена: пока не используется ни одной страницей.
- Отступ Toast от сайдбара — `--layout-sidebar-width` в `global.css`, дублирует 240 px из `AppShell.module.css`.
- `oxfmt` 0.x и `jsPlugins` oxlint в alpha — версии зафиксированы точно.

## Rejected

- SPA на TanStack Router без SSR: SEO страниц магазинов — P0 (ADR 0001).
- `modules/ui-kit` по канону FEOD: команда выбрала `common/ui` (ADR 0002).
- Отдельный слой `shared` с ключами всех запросов: ключи живут в модулях, в `common` только соглашение.
