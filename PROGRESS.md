# PROGRESS — макеты «Рабочий код» в Figma

Figma: https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6 · спецификация: `docs/DESIGN_SPEC.md`.
Работа идёт через Figma Desktop Bridge (MCP `figma-console`, `figma_execute`); удалённый Figma MCP упирается в лимит вызовов бесплатного тарифа.

## State
- Foundations: переменные `color` (Light), `color-dark` (`dark/*`), `size` (space/radius); 17 текстовых стилей.
- Компоненты (`02 Components`, доска `Components`): всё для P0-страниц — Logo, Button (variant × size × state; у primary lg есть disabled/loading), SearchField, MerchantAvatar + Brand/*, Tag, чипы, CategoryTile, MerchantTile, OfferCard (compact; full × high/medium/low/ended), FreeOfferCard, ScoreBadge, ScoreBar (progress + segmented по спецификации 3.13), CodeBox, ConditionItem, AdLabel, FeedbackBar, FilterChip, SortControl, FAQItem, StatStrip (`cell4`), Toast, EmptyState, ErrorState, OfflineBanner, GotchaNote (tone=warning|neutral), KeyValueItem, AnchorNavItem + AnchorNav, BackLink, Skeleton/OfferCard, StepItem (done|current), TextField (kind × state), Checkbox, Radio, SegmentedControl, AutocompleteItem (merchant|category|query|recent), ThemeToggle (theme=light|dark), PromoBlock, Header, Sidebar, Topbar, Footer. Иконки wifi-off, calendar, loader; иллюстрации plug, qr.
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
- P-06 Category готов: mobile Default/Loading/Filtered-empty/Error (x=0,400,800,1200, y=52000), desktop Default/Loading/Filtered-empty/Error (x=0,1520,3040,4560, y=53800). В ленте только 2 оффера Самоката (в данных нет других food-офферов). Если кадры внезапно пропали — их мог откатить undo в Figma: пересобрать клонированием.
- P-03 Search готов (клоны P-06): mobile Default/Loading/Empty/Error (x=0,400,800,1200, y=56000), desktop (x=0,1520,3040,4560, y=57800). Тёмных версий P-06/P-03 нет.
- P-07 Free готов: mobile Default/Loading/Filtered-empty/Error/Show-unavailable (x=0,400,800,1200,1600; y=60000), desktop те же 5 (x=0,1520,3040,4560,6080; y=62600). FreeOfferCard F2/F3 — клоны F1 с подменой текстов, логотип остался Yandex Cloud (нет Brand для Cloudflare/AWS). Тёмных версий нет.
- P-08 Free готов: desktop Default/Unavailable/Ended/Changed/Loading (x=0,1520,3040,4560,6080; y=66000), mobile те же 5 (x=0,400,800,1200,1600; y=69000). Собран клонированием P-05 (AnchorNav, KeyValueGrid, StepList, FeedbackBar). Unavailable (AWS) — буква «A» вместо логотипа; secondary Button есть только size=md/sm (lg нет). Недостаёт: тёмных версий.
- P-10 Alerts готов: mobile Default/Empty/No-channel/Push-blocked (x=0,400,800,1200; y=72000), desktop те же (x=0,1520,3040,4560; y=75000). Новый компонент `Switch` (state=off|on) на `02 Components`, x=1400,y=624.
- P-13 Cart готов: mobile Input (sheet)/Result/Result-none (x=0,800,1200; y=78000), desktop Input (popover под кнопкой)/Result/Result-none (x=0,1520,3040; y=81000). В Result «Не подойдут (3)» свёрнуто, без карточек с причинами.
- Бот B-01 на странице `06 Bot`: компонент `BotMessage` (buttons=0|2|3), чаты Light и Dark — «Старт и поиск», «Пересланный пост» (распознан / уже есть / кода нет), «Уведомления» (подписка + отзыв). Кнопки идут столбиком, а не рядом.
- Тёмные версии P-03/P-06/P-07/P-08/P-10/P-13 готовы (50 фреймов `… / Dark`, y = светлый y + 90000, x тот же; перепривязка `dark/*` только для fills/strokes). Проверены скриншотами P-07 mobile и P-13 desktop. Дубль P-06 Desktop Default удалён.
- Добавлено: `FailReasonSheet` (Component Set, 02 Components y=5300, state=none|selected); экраны P-04 Mobile `After-fail`, `Subscribe-sheet`, `Subscribed`, `Fail-sheet`, P-04 Desktop `Fail-popover` (x=0..1600,y=85000) и их Dark (y=175000). `SubscribeSheet` нарисован только как состояние экрана, не как компонент.
- `05 Flows` собрана: сценарии 5.1, 5.2, 5.3 (дубль и новый), 5.4, 5.5 — клоны экранов (mobile, обрезка 800) со стрелками и подписями триггеров. Прототипных связей Figma нет, только визуальная раскладка.
- Чек-лист раздела 7 (аудит): контраст пересчитан по формуле WCAG — все пары 1.9 совпадают со спекой. Сырые цвета остались только в векторах иконок/иллюстраций и `scrim`. Текстовые стили назначены всем текстам, кроме стрелок на `05 Flows`. Референсы filko и nestvested + таблицы 1.10/1.12 лежат на `01 Foundations` (y=2000 и y=3000). Деньги в тексте переведены на неразрывные пробелы (322 замены).
- `state=focus` / `focus=true` добавлены к Button, CodeBox, SearchField, FilterChip, Checkbox, Radio, SegmentedControl, NavItem, FAQItem, AnchorNavItem, AutocompleteItem, CategoryTile, Switch: обводка 2 px `border-strong` снаружи, без отступа 2 px.
- Открыто: (1) focus нет у FeedbackBar, TextField уже имел; (2) визуальная высота Button sm/FilterChip/FeedbackBar 36–38, Switch 24 — до 44 это только хит-зона, в Figma она не нарисована; (3) тёмная тема сделана клонами с перепривязкой на коллекцию `color-dark`, а не режимом Variables, поэтому «переключение режима» из чек-листа не работает; (4) нет прототипных связей для 5.1–5.3; (5) AdLabel/AdPopover на каждой ad-карточке и «жёлтый не для предупреждений» не проверялись.

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
