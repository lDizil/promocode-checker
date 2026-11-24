# Backend

Сейчас есть локальная конфигурация PostgreSQL и проект архитектуры. HTTP API, регистрация, worker, миграции и деплой ещё не реализованы; язык backend не выбран.

## Поднять БД локально

Нужны Docker Engine и Docker Compose. Команды выполняем из корня репозитория. Параметры ниже вымышленные и предназначены только для локальной разработки:

```sh
export POSTGRES_DB=promocode_checker
export POSTGRES_USER=promocode
export POSTGRES_PASSWORD=local_dev_only_change_me
export POSTGRES_PORT=5433
docker compose config --quiet
docker compose up -d --wait postgres
docker compose ps
```

Вместо `export` можно вручную создать `.env` в корне с этими переменными в формате `KEY=value`. Compose читает его автоматически; переменные оболочки имеют приоритет. Реальные `.env` исключены из Git. Не используем локальные параметры в test/prod.

Контейнер использует `postgres:18-alpine`: major-версия закреплена, minor-обновления доступны в этой ветке при обновлении образа. Точный образ для серверных сред будем фиксировать отдельно.

## Подключение

С компьютера или DBeaver:

| Параметр | Значение |
|---|---|
| Host | `127.0.0.1` |
| Port | `POSTGRES_PORT`, по умолчанию `5433` |
| Database | `POSTGRES_DB` |
| User | `POSTGRES_USER` |
| Password | `POSTGRES_PASSWORD` |

Порт открыт только на loopback. Из будущего контейнера backend в той же Compose-сети подключаемся к `postgres:5432`, а не к `localhost:5433`. Пока такого контейнера нет.

Проверить SQL-подключение, не устанавливая клиент на компьютер:

```sh
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT current_database(), current_user;"'
```

Для локального контейнера `POSTGRES_USER` создаётся с расширенными правами. Это не пример production-прав: перед серверным запуском нужны отдельные роли приложения и миграций.

## Остановить и посмотреть логи

```sh
docker compose logs --tail=100 postgres
docker compose down
```

`down` без `-v` сохраняет том. Не используем `down -v`, если хотим сохранить данные.

У PostgreSQL 18 данные монтируются в `/var/lib/postgresql`, как требует [официальный образ](https://hub.docker.com/_/postgres). Инициализационные переменные создают БД только при пустом томе: изменение пароля в окружении не меняет пароль уже созданного пользователя.

Доменных таблиц и init-скриптов пока нет. После согласования ER добавим отдельные версионированные SQL-миграции, а не будем рассчитывать на повторный запуск инициализации контейнера.

## Проектирование

- [Сервис, механизмы и план test/prod](../docs/backend/ARCHITECTURE.md)
- [ER-модель и границы первой миграции](../docs/backend/DATABASE.md)
- [BR-809: локальная инфраструктура](https://goddev.myjetbrains.com/youtrack/issue/BR-809)

`test` и `prod` пока не развёрнуты. Автодеплой, GitHub Environments, серверные секреты и Dockerfile приложения добавим только после согласования соответствующих решений.
