# Бесплатные кредиты, free tier и signup-бонусы как категория агрегатора

## Короткий ответ

- Это отдельная категория с другой механикой: **кода нет**, есть *право на оффер* — набор условий (страна, карта, новый аккаунт, студенческий статус, юрлицо/финансирование) и ценность (кредит, квота, срок).
- Для аудитории из РФ большинство зарубежных офферов **недоступны по двум независимым причинам**: гео-блок регистрации у провайдера и неработающие за рубежом карты РФ ([Visa](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.18871.html), [Mastercard](https://www.mastercard.com/global/en/news-and-trends/press/2022/march/mastercard-statement-on-suspension-of-russian-operations.html)). Поэтому ядро категории для RU-продукта — локальные облака и глобальные сервисы без карты, а импортные офферы — справочник «если есть зарубежная карта/резидентство».
- Свежесть — главная проблема категории: условия меняются тихо (Hetzner закрыл рефералку, VK Cloud завершил бонус, но обзоры 2026 года его до сих пор рекламируют).

## Офферы: условия, подводные камни, доступность из РФ

| Оффер | Условия (ноябрь 2026) | Подводные камни | РФ | Источник |
|---|---|---|---|---|
| **AWS Free Tier** | Новым аккаунтам $100 сразу + до $100 за освоение сервисов; до $200 на 6 мес.; аккаунт сам закрывается через 6 мес. или при исчерпании кредитов; списаний нет, пока не перейдёшь на Paid | Free plan — только избранные сервисы, промо-кредиты недоступны; масштабироваться нельзя | **Нет**: новые регистрации из РФ/РБ заблокированы с 03.2022 | [aws.amazon.com/free](https://aws.amazon.com/free/), [aboutamazon](https://www.aboutamazon.com/news/aws/updates-to-amazons-retail-entertainment-and-aws-businesses-in-russia-and-belarus) |
| **Oracle Cloud Free Tier** | $300 на 30 дней + Always Free: 2×AMD micro (1/8 OCPU, 1 ГБ), **2 OCPU/12 ГБ Ampere A1 суммарно** (1500 OCPU-часов и 9000 ГБ-часов/мес), 200 ГБ block, 2 АБД по 20 ГБ | Idle-reclaim: если за 7 дней 95-й перцентиль CPU <20%, сеть <20%, память <20% — VM могут забрать; карта обязательна, prepaid/virtual нельзя; **1 аккаунт на человека** | **Нет**: Oracle приостановила операции в РФ/РБ | [oracle.com/cloud/free](https://www.oracle.com/cloud/free/), [docs: Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm), [Oracle Russia](https://www.oracle.com/corporate/conflict-in-ukraine/russia/) |
| **Google Cloud** | $300 Welcome credit на 90 дней; карта + проверка личности; hold $0–1 | Нельзя GPU, Marketplace, повышение квот, Windows Server; кредит **нельзя** тратить на Gemini API в AI Studio; после 90 дней — 30-дневный grace и удаление ресурсов | **Нет**: продажи приостановлены, карты РФ не проходят | [docs.cloud.google.com](https://docs.cloud.google.com/free/docs/free-cloud-features) |
| **Azure free account** | $200 на 30 дней + 12 мес. бесплатных объёмов 20+ сервисов + 65+ always-free | Карта non-prepaid + телефон; 1 аккаунт на клиента; кредит не годится для Marketplace и Spot | **Нет**: России нет в списке стран оффера, а «если страны нет в списке — оффер недоступен» | [azure.microsoft.com/…/azure-account](https://azure.microsoft.com/en-us/pricing/purchase-options/azure-account) |
| **Cloudflare Free** | DNS/CDN/WAF/SSL бесплатно; Workers: 100 000 запросов/день, 10 мс CPU, 100 воркеров | Free Workers режет всё, что тяжелее проксирования | **Технически да, но**: с 09.06.2025 российские ISP режут трафик к сайтам за Cloudflare до ~16 КБ | [plans/free](https://www.cloudflare.com/plans/free/), [Workers limits](https://developers.cloudflare.com/workers/platform/limits/), [Cloudflare blog](https://blog.cloudflare.com/russian-internet-users-are-unable-to-access-the-open-internet/) |
| **Vercel Hobby** | $0: 1 млн invocations, 100 ГБ трафика, 4 ч active CPU | **Только некоммерческое личное использование**; реклама/оплата/партнёрские ссылки → нужен Pro $20 | Регистрация без карты — [INFERENCE]; оплата Pro из РФ невозможна | [vercel.com/pricing](https://vercel.com/pricing), [fair use](https://vercel.com/docs/limits/fair-use-guidelines) |
| **Netlify Free** | $0, но **300 кредитов/мес.**: деплой 15, трафик 20/ГБ, запросы 2/10 тыс. | Кредитная модель: «бесплатно» кончается на статике с трафиком | Без карты — [INFERENCE] | [netlify.com/pricing](https://www.netlify.com/pricing/) |
| **DigitalOcean / Hetzner referral** | DO: реферер получает $25 после $25 трат приглашённого; публичного «$200/60 дней» на странице программы уже нет. Hetzner: **рефералка прекращена**, старые ссылки не работают | Классический источник протухших «$200 credit» статей | Нужна зарубежная карта | [DO referral](https://www.digitalocean.com/referral-program), [Hetzner FAQ](https://docs.hetzner.com/cloud/general/faq/) |
| **Gemini API / AI Studio free tier** | Бесплатные токены с RPM/TPM/RPD-лимитами; данные free tier используются для улучшения продуктов | Часть моделей (Gemini 4 Carbon) на free недоступна; free tier ≠ продукт | **Нет**: России нет в списке доступных регионов | [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [Pricing](https://ai.google.dev/gemini-api/docs/pricing), [Available regions](https://ai.google.dev/gemini-api/docs/available-regions) |
| **OpenAI API** | Публичного signup-кредита нет; предоплата, минимум $5, купленные кредиты живут 1 год | Free-кредиты бывают только точечно; при исчерпании — `credit_balance_exhausted` | **Нет**: России нет в supported countries | [Prepaid billing](https://help.openai.com/en/articles/8264644-setting-up-and-managing-prepaid-api-billing), [Supported countries](https://platform.openai.com/docs/supported-countries) |
| **Anthropic API** | Есть разовый trial ~$5 на 14 дней после SMS-верификации — **только вторичные источники, [UNVERIFIED]** | Мульти-аккаунты запрещены; постоянного free tier нет | **Нет**: России нет в Supported Regions | [Supported regions](https://www.anthropic.com/legal/supported-regions) |
| **GitHub Student Developer Pack** | 80+ офферов по верификации студента (статус 2 года): Copilot Student бесплатно, Codespaces 180 core-hours/мес | Партнёрские офферы имеют свои условия и не стекнутся | GitHub доступен; часть партнёров гео-ограничена — [UNVERIFIED] | [pack](https://education.github.com/pack), [docs](https://docs.github.com/en/education/about-github-education/github-education-for-students/about-github-education-for-students), [ToS](https://docs.github.com/en/education/about-github-education/github-education-for-students/github-terms-and-conditions-for-the-student-developer-pack) |
| **Стартап-программы** | AWS Activate — до $200 000; Google for Startups — $2 000 (Start) и до $200 000–$350 000 (Scale/AI); Microsoft for Startups — до $150 000 | Нужны юрлицо, стадия, часто финансирование; заявка и модерация | **Нет** (все три закрыты для РФ) | [AWS Activate](https://aws.amazon.com/startups/), [Google](https://cloud.google.com/startup/benefits), [Microsoft](https://www.microsoft.com/en-us/startups) |
| **Yandex Cloud стартовый грант** | ≥4 000 ₽ резидентам РФ на 60 дней; карта должна быть привязана **при создании** платёжного аккаунта; бизнес: 4 000 ₽ (карта) / 10 000 ₽ (банк. перевод) | Пробный период — только для юрлиц с банковским переводом; физлицо с картой сразу на платном потреблении; не для GPU, поддержки, Marketplace | **Да** | [usage-grant](https://yandex.cloud/ru/docs/getting-started/usage-grant), [trial](https://yandex.cloud/ru/docs/getting-started/free-trial/concepts/quickstart) |
| **VK Cloud бонус** | 5 000 ₽ физлицам / 12 000 ₽ юрлицам на 60 дней; корпоративный домен + IP РФ; 2 000 ₽ на VM, 3 000 ₽ на остальное | На официальной странице — **«Акция завершена»**, при этом обзоры 2026 года всё ещё пишут «Бонус 5 000 ₽ на 60 дней» | **Да** (когда активна) | [cloud.vk.ru/bonus](https://cloud.vk.ru/bonus/), [пример протухшего обзора](https://toolfox.ru/services/s/vk-cloud) |

## Существующие агрегаторы и их пробелы

| Агрегатор | Как работает | Пробел |
|---|---|---|
| **free-for.dev** ([ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev)) | 142 556★, последний push 11.11.2026, 1600+ контрибьюторов, PR-модель; правило: только free tier (не trial), минимум на год | Нет страны/eligibility, нет срока и «gotchas», нет истории изменений; списки не проверяются машинно |
| **Awesome-списки** | [Awesome-Web-Hosting-2026](https://github.com/iSoumyaDey/Awesome-Web-Hosting-2026) (345★, push 30.12.2025), [awesome-free-llm-api](https://github.com/peter123023/awesome-free-llm-api) (221★), [awesome-free-llm-apis](https://github.com/amardeeplakshkar/awesome-free-llm-apis) (218★), [awesome-free-ai-coding](https://github.com/mvalentsev/awesome-free-ai-coding) (143★, probe-verified), [awesome-oracle-cloud-free-tier](https://github.com/neitsab/awesome-oracle-cloud-free-tier) (59★) | Один автор → быстро гниют; нет юридических условий |
| **hotukdeals / Pepper** | Секция Freebies: только 100% бесплатное, голосование «температурой», комиссия с переходов | UK-консьюмер, не dev-кредиты; нет данных об условиях аккаунта | 
| **AppSumo** | Lifetime-сделки, 2 млн клиентов, возврат 60 дней | Это платные сделки, не «бесплатно» |
| **Secret / JoinSecret** | 1 080 SaaS-сделок, $149/год, счётчики активаций; внутри GCP $2k/$350k, Azure $5k/$150k, AWS $100k | B2B-only, платный доступ, нет проверки региона |
| **Telegram (RU)** | Каталоги каналов «Халява/скидки/акции» ([Telemetr](https://telemetr.me/catalog/free)) | Нет структурированных условий, высокий churn, много рекламы |
| **Product Hunt Deals** | — | Не проверил: 403/Cloudflare — [UNVERIFIED] |

Общий пробел: **никто не моделирует eligibility (регион/карта/новый аккаунт) и не отслеживает завершение оффера**.

## Источники для парсинга, частота изменений, риски

- **Первичные**: официальные страницы free tier/pricing и FAQ ([AWS](https://aws.amazon.com/free/), [Oracle](https://www.oracle.com/cloud/free/), [GCP](https://docs.cloud.google.com/free/docs/free-cloud-features), [Azure](https://azure.microsoft.com/en-us/pricing/free-services)), ToS программ, списки supported countries/regions, доки с датой обновления (Cloudflare — 29.10.2026, Vercel — 14.09.2026).
- **Вторичные (сигнал, не истина)**: GitHub-коммиты (free-for-dev обновляется ежедневно), Habr/vc.ru, Telegram, Reddit.
- **Частота**: цены/лимиты облаков — 1–2 раза в квартал; промо-кампании — недели; региональные списки — редко, но критично; рефералки умирают внезапно (Hetzner).
- **Риски**: тихое изменение условий (Hetzner, VK Cloud); гео-локи; правила против мульти-аккаунтов (Oracle — 1 на человека, Anthropic банит за мульти-аккаунты); affiliate-смещение; для РФ — ещё и троттлинг Cloudflare.

## Отличия от промокодов и рекомендуемые поля

Кода нет; вместо строки — объект оффера с предикатами и «часами пользователя».

Рекомендуемые поля: `provider`, `offer_type` (credit / free_tier / trial / referral / student / startup), `value_amount` + `currency` + `value_kind` (разовый кредит / ежемесячная квота / скидка), `duration_days`, `clock_start` (регистрация vs активация), `eligibility` (страна allow/deny, тип лица, возраст, студент, стадия финансирования, new_account_only), `requirements` (карта, тип карты, телефон, KYC, корпоративный домен), `gotchas[]` (авто-апгрейд, закрытие аккаунта, idle-reclaim, обучение на данных, non-commercial), `region_availability` + причина, `redemption_url`, `terms_url`, `last_verified_at`, `change_hash`, `lifecycle` (active / changed / ended / unverified), `confidence`.

UX: бейдж «доступно из РФ» с причиной отказа, «что будет после окончания», «проверено {дата}», отдельный статус «оффер завершён» и фильтр по типу.

## Пробелы и оговорки

- Дата изменения квоты Oracle A1 (ранее 4 OCPU/24 ГБ) не установлена — [UNVERIFIED].
- Anthropic $5/14 дней — только вторичные источники.
- Product Hunt Deals не открылся (403).
- Доступность Vercel/Netlify из РФ без карты — [INFERENCE], не проверено регистрацией.
- Cloudflare: бесплатный план формально доступен, но доступность сайта для российских пользователей ограничена на уровне ISP.

## Дополнение 11.11.2026: vldtech.si/offers

[vldtech.si/offers](https://vldtech.si/offers/) — каталог «халявы» на ИИ-модели, VPS, Cloud VM, прокси, поиск для агентов, SMS-номера и виртуальные карты; 53 оффера (ai 29, vps 7, cloud-vm 5, search 5, proxy 3, sms 3, cards 1 — по `data-count` в HTML). Статический сайт на Astro, один куратор, воронка в Telegram [@neurovestnik](https://t.me/neurovestnik), донаты. На карточке: статус (Активно / Частично / Истекло), дата проверки (`data-verified`), сумма и срок, чипы «Нужно», флаг «Есть момент», промокод-бонус. Пробелы: нет доступности из РФ для AWS/Oracle/GCP/Azure, нет условий после окончания, истории и обратной связи; разделы карт и SMS-номеров служат обходу KYC и гео-ограничений.