# SSR на TanStack Start с первого дня

Страницы магазинов и офферов должны индексироваться (ARD 8.7: SEO по магазинам — P0). SPA на TanStack Router отдаёт поисковику пустой HTML, а переход со SPA на SSR позже потребовал бы переписать загрузку данных, роуты и моки. Поэтому фронтенд сразу собирается на TanStack Start 1.x с full-document SSR и `head()` на роутах; данные грузятся в `loader` через `queryClient.ensureQueryData` и читаются в странице через `useSuspenseQuery`.

## Consequences

- Нужен Node-сервер в рантайме (Docker), статический хостинг не подходит.
- MSW подключается дважды: `setupWorker` в браузере и `setupServer` в `src/server.ts`, иначе запросы из SSR-loader'ов не мокаются.
- Тема хранится в cookie, чтобы сервер ставил `data-theme` без мигания.
