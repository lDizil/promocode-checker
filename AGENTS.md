# Правила для агентов

## Источник истины

Источник задач и статусов — YouTrack, проект `BR`:

- проект: https://goddev.myjetbrains.com/youtrack/issues?q=project:%20BR
- доска: https://goddev.myjetbrains.com/youtrack/agiles/204-3/current
- код: https://github.com/lDizil/promocode-checker

Нативная VCS-интеграция YouTrack ↔ GitHub связывает commits, ветки и pull requests с задачами `BR-*`. GitHub Issues используются как рабочее зеркало, но не заменяют YouTrack.

## Работа с задачей

1. **Взять задачу.** Прочитать `BR-N` в YouTrack. Не брать `Obsolete`, `Epic` и `Царь-тикет` как задачи разработки.
2. **Проверить GitHub Issue.** Найти issue по `[BR-N]`. Если его нет, создать:
   - заголовок `[BR-N] <summary>`;
   - ссылка на `https://goddev.myjetbrains.com/youtrack/issue/BR-N`;
   - краткое описание и критерий «Готово» из YouTrack.
3. **Начать работу.** Перевести YouTrack-задачу в `In Progress`. Ветка — `BR-N-<kebab-slug>` от актуального `main`.
4. **Коммиты.** Начинать сообщение с `BR-N:`, например `BR-786: add frontend routing`. YouTrack автоматически прикрепит commit к задаче.
5. **Pull request.** Один PR на задачу:
   - заголовок `BR-N: <summary>`;
   - ссылка на YouTrack в описании;
   - `Closes #<github-issue>`;
   - кратко указать изменения и проверки.
6. **VCS-связи.** Не добавлять вручную комментарии с каждым commit или PR: после настройки нативной интеграции они появляются в activity задачи автоматически.
7. **Завершение.** После merge перевести задачу в `Fixed`. `Verified` ставит человек после проверки результата.

По умолчанию VCS-интеграция работает в безопасном режиме **Add commits, ignore commands**. Команды YouTrack из commit message не применяются.

Если задача противоречит макету или `docs/ARD.md`, перевести её в `To be discussed`, зафиксировать вопрос в YouTrack и остановиться.

## Секреты

Не хранить GitHub App private key, GitHub PAT, YouTrack token и webhook secret в репозитории, GitHub Issues, PR или документации. Ключ GitHub App загружается только в настройку VCS Integration в YouTrack.

## Материалы

- настройка интеграции: `docs/YOUTRACK_GITHUB_INTEGRATION.md`;
- дизайн: https://www.figma.com/design/r54xR3rQYtzAA3YfbcEfs6/Promocode-Checker?node-id=12-8;
- спецификация дизайна: `docs/DESIGN_SPEC.md`;
- требования: `docs/ARD.md`;
- исследования: `docs/research/`.
