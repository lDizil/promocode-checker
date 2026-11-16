# Интеграция YouTrack и GitHub

Проект `BR` подключён к репозиторию `lDizil/promocode-checker` через нативную VCS-интеграцию YouTrack.

Интеграция автоматически добавляет commits и pull requests в activity задачи, если номер `BR-*` указан в ветке, commit message, заголовке или описании PR.

GitHub Issues не синхронизируются автоматически. Они используются как рабочее зеркало, а источником требований и статусов остаётся YouTrack.

## Текущая настройка

- YouTrack project: `BR — Brotherhood of the Ring`;
- repository: `https://github.com/lDizil/promocode-checker`;
- server type: GitHub;
- authentication: Personal access token;
- webhook events: `push`, `pull_request`, `workflow_job`.

Webhook создаёт и обслуживает YouTrack. Вручную создавать второй webhook не нужно.

## Настройка через Personal Access Token

В GitHub открыть:

`Settings → Developer settings → Personal access tokens → Tokens (classic)`

Создать отдельный token для YouTrack. JetBrains указывает scopes:

- `repo`;
- `read:org`;
- `admin:repo_hook`.

В YouTrack открыть:

`Projects → Brotherhood of the Ring → Settings → Version Control → New VCS Integration`

Заполнить:

- **Server type:** GitHub;
- **Repository URL:** `https://github.com/lDizil/promocode-checker`;
- **Authentication type:** Personal access token;
- **Personal access token:** созданный token;
- **Main YouTrack project:** `BR`.

Token вставляется только в YouTrack. Его нельзя коммитить, публиковать в Issues/PR или добавлять в документацию.

## Рекомендуемые параметры

- **Processing scheme for VCS changes:** `Add commits, ignore commands`;
- **Monitored branches:** оставить пустым, чтобы отслеживать все ветки;
- **Check branch names for issue references:** включить;
- **Parse commits for issue comments:** выключить;
- **VCS changes visibility:** без дополнительных ограничений внутри проекта.

Режим `Add commits, ignore commands` связывает изменения с задачами, но не позволяет тексту commit message случайно менять состояние YouTrack.

## Сопоставление участников

YouTrack должен сопоставить автора GitHub с конкретным пользователем проекта. Настройка выполняется отдельно в профиле каждого участника — нельзя добавлять имена всей команды в профиль одного человека.

Каждому участнику нужно:

1. В GitHub открыть `Settings → Public profile` и проверить поле **Name**.
2. Если поле **Name** пустое, заполнить его и сохранить профиль.
3. В YouTrack открыть аватар → **Profile** → **General**.
4. В поле **VCS Usernames** добавить точное значение поля GitHub **Name**.
5. Сохранить профиль.
6. Принять приглашение в репозиторий, если оно ещё ожидает подтверждения.

Текущие значения команды:

| Участник | YouTrack | GitHub | VCS Username |
|---|---|---|---|
| Денис | `dizi` | `lDizil` | `Denis` |
| Илья | `ilya.tyunin.2457` | `Tomato1337` | `Ilya` |
| Влад | `vladislavkunetsky` | `prorok210` | `Vladislav` |
| Виктория | `vkkropivka05` | `ViktoriaKropivka` | заполнить GitHub **Name** и добавить это же значение |

После изменения `VCS Usernames` повторно выполнить **Import commits and open pull requests** в настройках интеграции. В дальнейшем новые commits и pull requests обрабатываются webhook автоматически.

## Проверка подключения

1. В GitHub открыть `Repository Settings → Webhooks`.
2. Проверить, что webhook активен и слушает `push`, `pull_request`, `workflow_job`.
3. В YouTrack выполнить **Import commits and open pull requests**.
4. Создать ветку `BR-N-<slug>` для реальной задачи.
5. Сделать commit `BR-N: <изменение>`.
6. Создать PR с `BR-N` в заголовке или описании.
7. Проверить activity задачи `BR-N`: там должны появиться commit и PR.

Старые commits без номера `BR-*` к задачам автоматически не привязываются.

## Рабочий процесс

1. Берём задачу `BR-N` и переводим её в `In Progress`.
2. При необходимости создаём GitHub Issue `[BR-N] <summary>`.
3. Создаём ветку `BR-N-<slug>`.
4. Начинаем commit messages с `BR-N:`.
5. Указываем `BR-N` в заголовке или описании PR.
6. YouTrack автоматически показывает commits и PR в activity задачи.
7. После merge переводим задачу в `Fixed`; `Verified` ставит проверяющий.

## GitHub App как альтернатива

Вместо PAT можно использовать GitHub App с минимальными разрешениями:

| Permission | Access |
|---|---|
| Actions | Read-only |
| Contents | Read-only |
| Metadata | Read-only |
| Pull requests | Read-only |
| Webhooks | Read & write |

Для текущего учебного проекта PAT уже настроен, поэтому переход на GitHub App не требуется.
