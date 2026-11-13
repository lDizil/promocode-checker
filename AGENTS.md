# Правила для агентов

## Задачи: YouTrack ↔ GitHub

Источник истины — YouTrack, проект `BR` (https://goddev.youtrack.cloud, доска «Brotherhood of the Ring — Development»). Агенты работают с ним через MCP-сервер `youtrack`.

Каждой задаче YouTrack, которую берут в работу, соответствуют один GitHub issue и один PR в `lDizil/promocode-checker`.

1. **Взять задачу.** `get_issue BR-N` — описание и критерий «Готово». Найти GitHub issue: `gh issue list --search "[BR-N]"`. Если его нет, создать:
   - заголовок `[BR-N] <summary>`;
   - в теле ссылка `https://goddev.youtrack.cloud/issue/BR-N` и описание из YouTrack;
   - в YouTrack оставить комментарий `GitHub issue: <url>`.
2. **Начать.** Перевести `State` в `In Progress` (`update_issue`). Ветка — `BR-N-<kebab-slug>` от актуального `main`.
3. **Коммиты.** `BR-N: <что сделано>`.
4. **PR.** Один PR на задачу:
   - заголовок `BR-N: <summary>`;
   - в описании `Closes #<github-issue>`, ссылка на YouTrack и что проверено;
   - в YouTrack оставить комментарий `PR: <url>`.
5. **Готово.** После мёрджа PR перевести `State` в `Fixed` и оставить комментарий с итогом. `Verified` ставит человек.

Значения `State`: Submitted, Open, In Progress, To be discussed, Reopened, Can't Reproduce, Duplicate, Fixed, Won't fix, Incomplete, Obsolete, Verified.

Задачи в статусе `Obsolete` и эпики (Type `Epic`, `Царь-тикет`) не берутся в работу и не зеркалируются в GitHub.

Если задача неясна или противоречит макету или `docs/ARD.md`, перевести её в `To be discussed`, оставить комментарий с вопросом и остановиться.

## Материалы

- Дизайн: Figma https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8, спецификация — `docs/DESIGN_SPEC.md`.
- Требования: `docs/ARD.md`, исследования — `docs/research/`.
