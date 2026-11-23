# PROGRESS — фронтенд (BR-805)

YouTrack: BR-805 «Реализовать базовые страницы на моковых данных (P0 + P1)» (`In Progress` / `В обработке`), ветка `BR-805-base-pages` (от `main` `111508a`).

## State

- Завершена основа BR-786 (в `main`), добавлен verification gate `BR-813` (`.githooks`, `verify:ui`, `lint:tokens`), локальные хуки установлены (`verify.mode=enforce`).
- Выгружены 8 логотипов брендов из Figma (`02 Components` → `public/brands/*.svg`: Samokat, Яндекс Еда, Ozon, Wildberries, Литрес, Lamoda, Yandex Cloud, GitHub).
- Расширены `common/ui`: `Icon` (новые иконки), `TextField` (`number`/`date`/`url`), `CategoryTile` (`light`/`yellow`/`purple`), `TopbarChip`, `ThemeToggle` (`variant="pill"`), `AnchorNav` + `use-active-anchor`, `TabStrip`, `Autocomplete` (`boxed`/`bare`/`field` поверх `@ui-sdk/react/autocomplete` с постоянно смонтированным `AutocompleteList` для корректной ARIA `role="presentation"` и без переполнения в Flex/Grid); инпуты (`Autocomplete`, `TextField`, `SearchField`) растянуты на 100% кликабельной области рамки; добавлены token-only `:hover`/`:active` эффекты на кнопки, чипы, плитки, карточки и поля формы с поддержкой `prefers-reduced-motion`.
- Реализованы и подключены к MSW все базовые страницы P0 + P1 на моках (17 сервисов и единый список офферов):
  - AppShell: 3 пункта навигации (`Главная`, `Каталог`, `Как мы проверяем`), `PromoBlock` в `Sidebar`/`MenuDrawer`, `TopbarChip` + `ThemeToggle` pill в `Topbar`, мобильный поиск в `Header`, 5-ссылочный `Footer`, логотип и навигация в `Sidebar` выровнены с `Topbar`/Hero.
  - P-01 `/` (`home.tsx`), P-02/P-03 `SearchAutocomplete` и `/search?q=...`, P-04 `/m/$slug` (сохранён без регрессий + SVG-логотип Самоката), контейнерно-адаптивные сетки магазинов (`.merchantsGrid`) на `/`, `/catalog` и `/search`, чтобы на промежуточных ширинах (`1024–1199px`) карточки не сжимали названия.
  - P-05 `/m/$slug/o/$offerId` (промокод; копирование в `useCopyCode` больше не открывает автоматически сайт партнёра — рядом явная ссылка «Перейти в магазин»), P-08 `/m/$slug/o/$offerId` (бесплатный оффер с шагами и отзывом «Получилось?»).
  - P-06 единый каталог `/catalog`, `/catalog/$category`, `/catalog/free`, `/catalog/free/$slug` (единый `OfferCard`, раскрытие недоступных из РФ, `FreeFilterSheet`).
  - P-09 `/submit` и `/submit?m=<slug>` (поиск магазина, проверка дубля, условные поля, mock `ERROR500`/`LIMIT429`, экран успеха).
  - P-11 `/about/verification` (и якорь `#advertising`), `/privacy`, `/contacts`, P-12 `404` с поиском (`not-found.tsx`).
- Проверки перед передачей пользователю пройдены: `oxfmt --check` (370 файлов), `tsc --noEmit` (0), `oxlint` (0 ошибок/предупреждений, 286 файлов), `token-lint.ts` (221 файл), `vitest run --project=unit` (6 файлов, 48 тестов), `vitest run --project=storybook` (57 файлов, 291 тест, включая `CopiesWithoutRedirect`), `vite build` SSR+client, живая проверка в Chromium (инпуты, hover, копирование без редиректа, `1091px` сетка магазинов), `verify:ui` (`PASS: 0 требуют решения`, `.verify/stamp.json` актуален: `8efddf8a2b0ee675`, 876 принятых изменений).

## Next step

- Открыть PR `BR-805-base-pages` → `main` (`Closes #1`, задача `BR-805`).
- После merge перевести `BR-805` в `Fixed` (`Verified` ставит человек).

## Known issues

- `@custom-media` не используется: Lightning CSS компилирует каждый CSS Module отдельно, общий `@custom-media` не виден. Брейкпоинт — литерал `(width >= 1024px)`.
- Логгер в `src/common/logger.ts`, а не в `app/integrations`: его вызывает `common/http.ts`, а `common` не может импортировать `app`. Транспорт подменяется `setLogTransport` из `app`.
- Прод: браузер ходит на `/api` своего хоста. Нужен reverse proxy `/api → backend` (или server route-прокси в Start) — решить вместе с BR-787.
- `Illustration/qr` (160×160) не выгружена: пока не используется ни одной страницей.
- Отступ Toast от сайдбара — `--layout-sidebar-width` в `global.css`, дублирует 240 px из `AppShell.module.css`.
- `oxfmt` 0.x и `jsPlugins` oxlint в alpha — версии зафиксированы точно.

## Rejected

- SPA на TanStack Router без SSR: SEO страниц магазинов — P0 (ADR 0001).
- `modules/ui-kit` по канону FEOD: команда выбрала `common/ui` (ADR 0002).
- Отдельный слой `shared` с ключами всех запросов: ключи живут в модулях, в `common` только соглашение.
- Открытие детали оффера P-05/P-08 модальным окном/шторкой: выбран прямой маршрут `/m/$slug/o/$offerId` и `/catalog/free/$slug` (решение по BR-805).
