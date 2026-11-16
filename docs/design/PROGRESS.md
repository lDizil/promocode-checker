# PROGRESS — макеты «Рабочий код» в Figma

Figma: https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6 · спецификация: `docs/DESIGN_SPEC.md`.
Работа идёт через Figma Desktop Bridge (MCP `figma-console`, `figma_execute`); удалённый Figma MCP упирается в лимит вызовов бесплатного тарифа.

## State
- 16.11.2026 — единая карточка и поиск (ARD ADR-07, ADR-08; spec 3.20, раздел 8):
  - `FreeOfferCard` удалён. Все 97 его экземпляров (Screens + Flows, light и dark) заменены на `OfferCard`: в каталоге P-07 стоит новый вариант `density=full, context=feed, verification=high`, на главной, в P-02 и в «Похожих» P-08 — `compact`. У `OfferCard` добавлены булевы `score` и `availability`: в строке доверия теперь `score-group` (ScoreBadge + ScoreBar) либо `AvailabilityBadge`.
  - Главная: секция «Магазины и сервисы», вместо плитки Ламоды — Yandex Cloud. P-03 переделан на запрос «яндекс»: Яндекс Еда и Yandex Cloud, карточки O7 и F1 в одной ленте, чип «Бесплатно».
  - Подписки, корзина и бот убраны из основных макетов. Их фреймы (P-10, P-13, P-04 Subscribe-sheet/Subscribed, P-09 Bot, сценарий 5.4, бывшая страница `06 Bot`) лежат на странице `99 Отложено: подписки, корзина, бот`. Из `Sidebar` убран пункт «Подписки», из `Topbar` — чип «2 подписки». На P-04 удалены «Следить» и «Подобрать под мою корзину», на P-09 — переключатель «Переслать пост боту», на P-11 — блок «Для владельцев каналов» (пункт `AnchorNav` скрыт). Сценарий «Бесплатный оффер» перенумерован в 5.4.
  - Перекраска под тёмную тему для новых экземпляров: перепривязка `color/X` → `color-dark/dark/X` у fills и strokes.
- 16.11.2026 — каталог (spec 4.6, ARD F-04, ADR-07):
  - Меню `Sidebar`: «Главная», «Каталог», «Как мы проверяем». Пункты «Категории» и «Бесплатно» заменены «Каталогом». На страницах каталога и P-08 активен «Каталог»; иконка в нём перепривязана на `on-accent`, иначе сливается с заливкой.
  - Главная: секции «Бесплатные кредиты и тарифы» больше нет. F1 идёт в ленте «Сегодня утром». На desktop «Магазины и сервисы» — сетка 6 × 2 (второй ряд `Row 2`: GitHub, Перекрёсток, Cloudflare, Купер, Мегамаркет, Timeweb Cloud), под ней «Категории» чипами.
  - P-06 Catalog = бывший P-07: mobile y=60000 (x=0 Default, 400 Free, 800+ Loading/Filtered-empty/Error/Show-unavailable), desktop y=62600 (шаг 1520), Dark +90000. Default — «Все»: рубрикатор, ряд «Магазины и сервисы», смешанная лента O1, F1, O6, F4. Free — ветка «Бесплатно». На mobile в Free два ряда табов: `Tabs top` и `Tabs sub`. Старые фреймы P-06 Category удалены.
  - P-08: крошки «Каталог › Бесплатно › …». Сценарий 5.4 начинается с плитки «03 Бесплатно».
- Foundations: переменные `color` (Light), `color-dark` (`dark/*`), `size` (space/radius); 17 текстовых стилей.
- Компоненты (`02 Components`, доска `Components`): всё для P0-страниц — Logo, Button (variant × size × state; у primary lg есть disabled/loading), SearchField, MerchantAvatar + Brand/*, Tag, чипы, CategoryTile, MerchantTile, OfferCard (compact; full merchant × high/medium/low/ended; full feed high — единая карточка, FreeOfferCard удалён), ScoreBadge, ScoreBar (progress + segmented по спецификации 3.13), CodeBox, ConditionItem, AdLabel, FeedbackBar, FilterChip, SortControl, FAQItem, StatStrip (`cell4`), Toast, EmptyState, ErrorState, OfflineBanner, GotchaNote (tone=warning|neutral), KeyValueItem, AnchorNavItem + AnchorNav, BackLink, Skeleton/OfferCard, StepItem (done|current), TextField (kind × state), Checkbox, Radio, SegmentedControl, AutocompleteItem (merchant|category|query|recent), ThemeToggle (theme=light|dark), PromoBlock, Header, Sidebar, Topbar, Footer. Иконки wifi-off, calendar, loader; иллюстрации plug, qr.
- Экраны (`03 Screens`), светлая тема — все P0 со всеми состояниями:
  - P-01 (y=0): mobile/desktop Default; mobile Loading, Error, Offline, Search-focus (x=2040–3600); desktop Loading, Error, Offline (x=3640+). Desktop search-focus = P-02 Desktop.
  - P-04 (y=2800 mobile + desktop Default; y=6100 desktop-состояния).
  - P-05 (y=7500): mobile/desktop Default, mobile Copied/Feedback-sent/Low/Ended/Loading, Mobile Sheet и Desktop Modal поверх P-04 (x=4040/4440); desktop-состояния — y=10200.
  - P-09 (y=11500 mobile: Empty, Filled, Field-error, Duplicate, Submitting, Error, Rate-limited, Success, Bot; y=13700 desktop Filled, Bot, Success).
  - P-11 (y=15600 mobile/desktop), P-12 (y=18200: 404, 500, Offline, Merchant-removed × mobile/desktop), P-02 (y=19400: mobile Recent/Loading/Results/Empty, desktop Results/Empty).
  - Тёмная тема (y=21000): P-01, P-04, P-05 Default mobile+desktop. Сделаны клоном с перепривязкой каждой заливки/обводки `X` → `dark/X`, тени заменены обводкой `border-strong` 24%, дуги 60%.
- Сетка KeyValueGrid собирается в экранах auto-layout фреймом `KeyValueGrid` (desktop: wrap, ячейки 348, gap 24; mobile: вертикально).

## Next step
- Тёмная тема сделана для всех P0-экранов и всех их состояний (`… / Dark`, Screens, y=21000–~48500).
- ThemeToggle переделан: вместо switch — пилюля 60×28 с иконками солнце/луна и бегунком под активной (theme=light|dark); все экземпляры обновлены, в `… / Dark` — theme=dark.
- Правило 1.11 п. 7: плитки hero на desktop сужены до 3×152 (жёлтая+фиолетовая = 26.8% ширины hero) во всех P-01 desktop; раньше выступали за край hero. П. 11: аватары магазинов 48 с логотипом 40 (отступ 4) уже по правилу.
- P-03 Search готов: mobile Default/Loading/Empty/Error (x=0,400,800,1200, y=56000), desktop (x=0,1520,3040,4560, y=57800).
- P-06 Catalog (бывший P-07): см. State. У Cloudflare и AWS буква вместо логотипа (нет Brand).
- P-08 Free готов: desktop Default/Unavailable/Ended/Changed/Loading (x=0,1520,3040,4560,6080; y=66000), mobile те же 5 (x=0,400,800,1200,1600; y=69000). Собран клонированием P-05 (AnchorNav, KeyValueGrid, StepList, FeedbackBar). Unavailable (AWS) — буква «A» вместо логотипа; secondary Button есть только size=md/sm (lg нет). Недостаёт: тёмных версий.
- P-10 Alerts, P-13 Cart, бот B-01 (`BotMessage`, чаты Light/Dark) нарисованы, но с 16.11 отложены: лежат на странице `99 Отложено…`. Компонент `Switch` (state=off|on) остался на `02 Components`, x=1400,y=624.
- Тёмные версии P-03/P-06/P-07/P-08/P-10/P-13 готовы (50 фреймов `… / Dark`, y = светлый y + 90000, x тот же; перепривязка `dark/*` только для fills/strokes). Проверены скриншотами P-07 mobile и P-13 desktop. Дубль P-06 Desktop Default удалён.
- Добавлено: `FailReasonSheet` (Component Set, 02 Components y=5300, state=none|selected); экраны P-04 Mobile `After-fail`, `Subscribe-sheet`, `Subscribed`, `Fail-sheet`, P-04 Desktop `Fail-popover` (x=0..1600,y=85000) и их Dark (y=175000). `SubscribeSheet` нарисован только как состояние экрана, не как компонент.
- `05 Flows` собрана: сценарии 5.1, 5.2, 5.3 (дубль и новый), 5.4, 5.5 — клоны экранов (mobile, обрезка 800) со стрелками и подписями триггеров. Прототипных связей Figma нет, только визуальная раскладка.
- Чек-лист раздела 7 (аудит): контраст пересчитан по формуле WCAG — все пары 1.9 совпадают со спекой. Сырые цвета остались только в векторах иконок/иллюстраций и `scrim`. Текстовые стили назначены всем текстам, кроме стрелок на `05 Flows`. Референсы filko и nestvested + таблицы 1.10/1.12 лежат на `01 Foundations` (y=2000 и y=3000). Деньги в тексте переведены на неразрывные пробелы (322 замены).
- `state=focus` / `focus=true` добавлены к Button, CodeBox, SearchField, FilterChip, Checkbox, Radio, SegmentedControl, NavItem, FAQItem, AnchorNavItem, AutocompleteItem, CategoryTile, Switch: обводка 2 px `border-strong` снаружи, без отступа 2 px.
- Открыто: (1) focus нет у FeedbackBar, TextField уже имел; (2) визуальная высота Button sm/FilterChip/FeedbackBar 36–38, Switch 24 — до 44 это только хит-зона, в Figma она не нарисована; (3) тёмная тема сделана клонами с перепривязкой на коллекцию `color-dark`, а не режимом Variables, поэтому «переключение режима» из чек-листа не работает; (4) нет прототипных связей для 5.1–5.3; (5) AdLabel/AdPopover на каждой ad-карточке и «жёлтый не для предупреждений» не проверялись; (6) P-02 автодополнение пока без строки сервиса (Yandex Cloud); (7) полные feed-варианты `OfferCard` есть только для `verification=high`; ветки каталога кроме «Все» и «Бесплатно» (например, «Еда и продукты») отдельными фреймами не нарисованы; (8) `SegmentedControl` больше нигде не используется, у мастера осталась подпись «Переслать пост боту».

## Known issues
- Inter Tight недоступен в Figma — заголовки на Inter.
- Цвет иконок, подставленных через INSTANCE_SWAP, сбрасывается к цвету мастера: после замены перекрашивать вектора (`recolor`).
- Привязанные к переменным заливки надо создавать с реальным цветом, иначе экспорт рисует чёрным.
- Условия на desktop-карточке в одну колонку (в спецификации — две).
- Скопированные варианты внутри набора (StepItem state=current) теряли привязки к свойствам — после `clone()` варианта перепривязывать `componentPropertyReferences`.
- В экземплярах обычный пробел в суммах рвёт строку («1 / 500 ₽»): в новых текстах ставить U+00A0; старые карточки P-01/P-04 ещё с обычными пробелами.
- Смена варианта у экземпляра сбрасывает перекраску под тёмную тему внутри него — перекрашивать после `setProperties`.
- Положение слоёв внутри экземпляра (x/y) не переопределяется — для визуально разных состояний нужен вариант компонента (так сделан ThemeToggle).
- Экспорт скриншота изредка рисует сдвинутый кадр (Button state=loading), хотя координаты верные — проверять `absoluteBoundingBox`.

## Rejected
- Блок «Как мы проверяем» на главной — пользователь: главная должна цеплять офферами.
- Непрерывная заливка ScoreBar — ширину слоя в экземпляре менять нельзя; сделаны 10 сегментов.
