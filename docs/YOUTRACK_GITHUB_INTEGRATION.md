# Интеграция YouTrack и GitHub

Нативная VCS-интеграция связывает задачи `BR-*` с ветками, commits и pull requests репозитория `lDizil/promocode-checker`.

GitHub Issues не синхронизируются этой интеграцией автоматически. Они остаются рабочим зеркалом задач, а источником истины является YouTrack.

## Рекомендуемый способ: GitHub App

GitHub App безопаснее личного токена: доступ ограничивается выбранным репозиторием и не зависит от PAT конкретного участника.

### 1. Создать GitHub App

Открыть GitHub:

`Settings → Developer settings → GitHub Apps → New GitHub App`

Заполнить:

- **GitHub App name:** любое уникальное имя, например `goddev-youtrack-promocode-checker`;
- **Homepage URL:** `https://goddev.youtrack.cloud`;
- **Callback URL:** оставить пустым;
- **Webhook → Active:** выключить — webhook создаст YouTrack;
- **Where can this GitHub App be installed?:** Only on this account.

Repository permissions:

| Permission | Access |
|---|---|
| Actions | Read-only |
| Contents | Read-only |
| Metadata | Read-only, включается автоматически |
| Pull requests | Read-only |
| Webhooks | Read & write |

Остальные разрешения оставить `No access`.

### 2. Получить реквизиты App

После создания:

1. Скопировать **App ID**.
2. Нажать **Generate a private key**.
3. GitHub скачает файл `.pem`.
4. Установить App в аккаунт `lDizil`.
5. Выбрать **Only select repositories** → `promocode-checker`.

Private key нельзя коммитить, отправлять в Issues/PR или сохранять в GitHub Secrets. Если ключ оказался публичным, его нужно удалить в настройках App и сгенерировать заново.

### 3. Подключить репозиторий в YouTrack

Открыть YouTrack:

`Projects → Brotherhood of the Ring → Settings → Version Control → New VCS Integration`

Либо:

`Administration → Integrations → VCS Integration → New VCS Integration`

Параметры:

- **Main YouTrack project:** `BR — Brotherhood of the Ring`;
- **Server type:** GitHub;
- **Repository URL:** `https://github.com/lDizil/promocode-checker`;
- **Authentication type:** GitHub App;
- **App ID:** значение из GitHub;
- **Private key:** загрузить скачанный `.pem` напрямую в YouTrack.

После сохранения YouTrack найдёт installation GitHub App и автоматически создаст repository webhook.

### 4. Настройки интеграции

Рекомендуемые значения:

- **Processing scheme for VCS changes:** `Add commits, ignore commands`;
- **Monitored branches:** оставить пустым, чтобы отслеживать все ветки;
- **Check branch names for issue references:** включить;
- **Parse commits for issue comments:** выключить;
- **VCS changes visibility:** без дополнительных ограничений внутри проекта.

Так commits и PR связываются с задачами, но текст commit message не может случайно менять статусы YouTrack.

### 5. Проверить интеграцию

1. Убедиться, что в GitHub появился активный webhook:
   `Repository Settings → Webhooks`.
2. В YouTrack выполнить **Import commits and open pull requests**.
3. Для следующей реальной задачи создать ветку `BR-N-<slug>`.
4. Сделать commit `BR-N: <изменение>`.
5. Создать PR с `BR-N` в заголовке или описании.
6. Проверить activity задачи `BR-N`: должны появиться commit и PR.

Старые commits без номера `BR-*` автоматически к задачам не привяжутся.

## Альтернатива: Personal Access Token

Если GitHub App настроить не получается, можно выбрать в YouTrack authentication type **Personal access token**.

Для classic PAT JetBrains указывает scopes:

- `repo`;
- `read:org`;
- `admin:repo_hook`.

PAT вставляется только в поле **Personal access token** в YouTrack. Его нельзя добавлять в репозиторий или GitHub Secrets. Для постоянной командной интеграции GitHub App предпочтительнее.

## Ежедневный процесс

- YouTrack хранит статус и требования задачи.
- GitHub Issue хранит рабочее обсуждение реализации.
- Ветка, commits и PR содержат номер `BR-N`.
- Нативная интеграция автоматически показывает commits и PR в YouTrack.
- После merge исполнитель переводит задачу в `Fixed`, проверяющий — в `Verified`.
