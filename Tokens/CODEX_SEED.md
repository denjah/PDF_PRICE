# CODEX_SEED — Weekend Billiard Presentation System

> Язык общения с человеком: **RU**. Ключи в коде/JSON: **EN**.

---

## 1. Что строим (идея одной фразой)

Система, в которой **дизайнер готовит визуал и папку товара**, а **оператор/менеджер** в консоли собирает презентацию из шаблонов и данных, получает **чистую HTML-ссылку для клиента** и **PDF**.  
Не «ещё один ручной лендинг», а **конструктор колод** под бренд **Weekend Billiard** (дистрибьютор RASSON и др.).

Повторяемость: новая модель стола ≈ новая папка материалов + `deck.json`, без перевёрстки с нуля.

---

## 2. Роли

| Роль | Делает |
|---|---|
| **Клиент** | Открывает ссылку из почты/мессенджера после звонка. Видит только чистую презентацию. Может скачать PDF. |
| **Оператор (менеджер)** | Зашёл → выбрал презентацию → вкл/выкл разделы и поля → создал ссылку → готово. |
| **Дизайнер** | Тщательно готовит фото и визуал **до** сборки. Новые товары в систему добавляет дизайнер, не «сырой dump». |
| **Codex / dev** | Код системы, токены, рендерер, console, PDF pipeline, schema. |

---

## 3. Зафиксированные продуктовые решения (из интервью)

### 3.1 Категория и масштаб
- v1: **только бильярдные столы** (~до **10** моделей в горизонте).
- Не кии/аксессуары в v1.
- Язык: **русский**.
- Хостинг: **GitHub + Vercel**.

### 3.2 Эталонный товар
- **RASSON Victory II Plus White** (American Pool, 8 / 9 ft).
- Артикул White (из брифа): `55.300.08.1`.
- Слоган (бриф): «Высший класс в мире бильярда. Совершенство в каждом элементе.»
- Визуальный образ: футуристичный **V-образный** силуэт опор, матовый белый корпус, чёрные борта, сукно Tournament Blue.

**Материалы эталона **
- Бриф / copy: `D:\!PROJECTS\RASSON\Victory 2_PLUS_9F_BLACK\Victory 2Ф_JPG_presentation\Victory_2F_Presentation_Texts.md`
- Фото: D:\!PROJECTS\RASSON\Victory 2_white\IMAGE_CATALOG.md D:\!PROJECTS\RASSON\Victory 2_white\MARKETING\Visual_Asset_Catalog.md
- Research: D:\!PROJECTS\RASSON\Victory 2_white\MARKETING\Product_Analysis_Rasson_Victory_2.md
- Логотипы Weekend / RASSON: D:\!PROJECTS\PDF PRICE\LOGO\Logo_Asset_Catalog.md
- Шрифты Diaria Pro + Inter: D:\!PROJECTS\PDF PRICE\PRESENTATION SYSTEM\fonts
- Дизайн-система: D:\!PROJECTS\PDF PRICE\PRESENTATION SYSTEM\Tokens\DS_SYSTEM_PRESENTATION.md
Ошибки старой презентации : D:\!PROJECTS\RASSON\Victory 2_PLUS_9F_BLACK\Victory 2Ф_JPG_presentation\PRESENTATION_ANTI_PATTERNS.md
- Контакты дистрибуции (бриф): Weekend Billiard, `+7 (499) 703-43-93`, `opt@w-billiard.ru`, weekend-billiard.ru
Тут собраны примеры верстки, из прошлых презентаций. токенизировано. Можно делать дизайны с похожей компоновкой, но с современными шрифтами, отступами и тд. D:\!PROJECTS\PDF PRICE\PRESENTATION SYSTEM\SVG_шаблон\PDF\LAYOUT_TEMPLATES_CATALOG.md

### 3.3 Сценарий клиента
- Смотрит **с почты или мессенджера** после звонка.
- Целевые действия (все допустимы): позвонить, написать на opt@, заявка, выбор 8 vs 9 ft, замер/монтаж, вау-премиум.
- Объём колоды: **10–14** слайдов.
- Старую презентацию не копировать 1:1: была **грубо свёрстана из некачественного материала**. Нужно **современно**, **сохраняя структуру подачи**.

### 3.4 Бренд-иерархия (ОБЯЗАТЕЛЬНО, rule #1)
Весь UI — в бренде **Weekend**. Порядок narrative:

1. **Слайд Weekend cover** — имидж Weekend + **название стола** + фото стола.  
2. **Weekend = официальный дистрибьютор RASSON** (trust, сервис с 1996).  
3. **Имиджевый слайд RASSON**.  
4. Далее продукт: детали, USP, характеристики, чемпионаты.  
5. **Closing CTA**.

Не начинать колоду с «голого» RASSON-hero без Weekend-оболочки.

### 3.5 Контент эталона (факты только из материалов, не выдумывать)

**USP (минимум):**
- V-образные опоры — жёсткость + свобода стойки (нет угловых ножек).
- Борта **Adamath-Wood** — стойкость к износу/влаге/температуре (формулировки — строго по approved copy).
- Резина **KLEMATCH® P59** (Франция) — отскок; EPBF / WPA.
- **Level Box Plus** — микрорегулировка плиты.

**Specs (см. бриф; сверять с папкой):**  
сланец 3 части; толщина 30 mm (8 ft) / 27 mm (9 ft); лузы ТПЭ; прицелы перламутр; шары 57,2 mm; drop pockets; вес и пр. — из `⟦brief⟧`.

**Sanctioning / events (по брифу):** EPBF, WPA; Mosconi Cup, World Pool Masters, Кубок Кремля (контекст Weekend).

**Производитель:** RASSON Billiards (CN). **Дистрибьютор РФ:** Weekend Billiard.

Если слота нет в данных → `null` / omit / TODO в JSON. **Никогда** не додумывать характеристики.

### 3.6 Дизайн (source of truth)
- Файл: `DESIGN_SYSTEM.md` **v2.0 deck-first** (баннеры 500px **устарели**, не использовать).
- Namespace токенов: только **`--wb-*`**.
- Темы: Home / Sport / Classic / Club.  
- Variants: Dark (default) / Light / Accent.
- Шрифты: **Diaria Pro** (display) + **Inter** (body), локальные файлы.
- Философия: тёмный премиум, cinematic photo + veils, минимальная типографика, clip-path badge/CTA, hairlines, corners, noise; motion на screen only.
- Слайд = **full viewport** (`100dvh`), не виджет 1500×500.
- PDF: **1 слайд = 1 страница**, без particles/ken-burns/pulse.
- Рекомендуемый PDF pipeline: Playwright local/CI; артефакты на Vercel, не тяжёлый Chromium в serverless без нужды.

**Тема для Victory II Plus White:** если не указано иначе → `data-wb-theme="home"` + `data-wb-variant="dark"` (можно сменить в deck.json).

### 3.7 Технические предпочтения (default)
- Stack default: **Vite + TypeScript**, static deploy **Vercel**.
- Next.js — **только** если пользователь явно попросил (skill react-nextjs не включать по умолчанию).
- Данные колоды: **`deck.json`** (или yaml → json).
- Client route: `/p/:slug/` — clean UI only.
- Console route: `/console/` — noindex, secret/basic auth; не протекает в client.
- Шрифты и критичные ассеты — self-contained для PDF.
- Открытые продуктовые детали (навигация PPT vs snap, draft/live, 8/9 на одном URL) — см. §8; пока нет ответа — выбрать разумный default и пометить `DECISION:` в README.

---

## 4. Черновой скелет колоды (10–14, эталон)

Оператор может выключать optional-секции в console.

| # | id | archetype | Mandatory |
|---|---|---|---|
| 1 | `cover-weekend` | cover-weekend | yes |
| 2 | `weekend-distributor` | distributor | yes |
| 3 | `rasson-brand` | brand-image | yes |
| 4 | `product-hero` | product-hero | yes |
| 5 | `usp-v-leg` | usp | yes |
| 6 | `usp-adamath` | usp | yes |
| 7 | `usp-klematch` | usp | yes |
| 8 | `usp-level-box` | usp | yes |
| 9 | `engineering-macro` | engineering | yes |
| 10 | `specs` | specs | yes |
| 11 | `championships` | championships | optional toggle |
| 12 | `closing-cta` | closing-cta | yes |

Optional later: FAQ, interior gallery, comparison, legal extended.

---

## 5. Целевая архитектура репо (предложение)

```text
/
  AGENTS.md                 ← правила агента (можно слить с этим seed)
  CODEX_SEED.md             ← этот файл (или заменить AGENTS.md)
  DESIGN_SYSTEM.md          ← v2 tokens + components
  README.md
  package.json
  index.html
  src/
    styles/tokens.css       ← --wb-* from DS §15
    styles/components.css
    styles/print.css
    deck/render.ts          ← deck.json → DOM
    deck/types.ts
    console/                ← operator UI (может быть React+shadcn)
    pdf/export.mjs          ← Playwright
  public/
    fonts/
    brand/
  content/
    decks/
      rasson-victory-ii-plus-white/
        deck.json
        assets/             ← или symlink на materials
  .agents/skills/           ← project skills (см. §7)
```

**Материалы дизайнера (контракт папки товара) — заполни:**
```text
⟦MATERIALS_ROOT⟧/rasson-victory-ii-plus-white/
  product.md | product.yaml
  copy/
  photos/          # лучше + photos.json tags: hero, detail, lifestyle...
  brand/           # если локально к товару
  research/
  constraints.md   # что нельзя обещать
```

---

## 6. Правила для Codex (always-on)

1. Источник визуала: `DESIGN_SYSTEM.md` v2 + `--wb-*`. Не изобретать палитру.  
2. Источник фактов: только files в materials/deck. Нет галлюцинаций specs.  
3. Narrative order Weekend→distributor→RASSON→product→CTA не ломать без спроса.  
4. Client `/p/*` без console chrome.  
5. Print/PDF: motion off, 1 slide = 1 page.  
6. RU copy в UI; code identifiers EN.  
7. Small vertical slices; `build` после slice.  
8. Спросить пользователя, только если решение ломает бренд/narrative/stack.  
9. При сомнении — `TODO` в JSON, не silent invent.  
10. Анти-slop: не purple/teal SaaS-градиенты, не generic shadcn-look на client deck.

### Non-goals v1
- CMS съёмки, автогенерация фото  
- Мультиязык  
- Не-столы  
- Serverless PDF на Vercel как must  
- Полный autopilot без дизайнера  

### Definition of done (MVP)
- [ ] Эталон Victory II Plus: 10–14 слайдов по narrative  
- [ ] Токены `--wb-*`, тема переключается  
- [ ] Client clean URL  
- [ ] PDF download, страницы не режут текст  
- [ ] Console stub: toggle sections → обновляет preview/deck  
- [ ] README: how to add a table  
- [ ] Материалы подключены по путям §3.2  

---

## 7. Skills — как подключать

### 7.1 Принцип
- **AGENTS.md / этот seed** = всегда.  
- **Skills** = on-demand (auto по description или явно `$name` / `/skills`).  
- Не активировать все skills в одном сообщении.  
- Список ниже держать в AGENTS.md, чтобы skills были discoverable.

### 7.2 Где лежат (поправь под свою установку)
```text
.agents/skills/   # предпочтительно project-shared
# или .codex/skills/
# или ~/.agents/skills/ для личных
```

Заполни фактические пути:
- impeccable: `⟦PATH/skills/impeccable⟧`
- site-architecture: `⟦PATH/skills/site-architecture⟧`
- high-end-visual-design: `⟦PATH/skills/high-end-visual-design⟧`
- design-spells: `⟦PATH/skills/design-spells⟧`
- minimalist-ui: `⟦PATH/skills/minimalist-ui⟧`
- shadcn: `⟦PATH/skills/shadcn⟧`
- react-state-management: `⟦PATH/skills/react-state-management⟧`
- react-nextjs-development: `⟦PATH/skills/react-nextjs-development⟧`

### 7.3 Матрица «когда звать»

| Фаза | Skills | Заметка |
|---|---|---|
| Структура роутов, IA | `$site-architecture` | `/p/:slug`, `/console`, content tree |
| Визуал слайдов, shell | `$high-end-visual-design` | Только в рамках DS v2 |
| Эффекты/polish DNA | `$design-spells` | Не менять brand tokens |
| Анти-slop audit | `$impeccable` | Сначала teach/context = Weekend + DS |
| Воздух/ритм type | `$minimalist-ui` | Не упрощать до «плоского SaaS» |
| Console UI kit | `$shadcn` + `$react-state-management` | **Только /console** |
| Next.js | `$react-nextjs-development` | **Не default**; только по явной просьбе |
| PDF export | (script / future skill) | Playwright |

### 7.4 Жёсткие границы skills
- **shadcn** не использовать для client presentation slides.  
- **impeccable**: бренд-контекст = Weekend Billiard + `DESIGN_SYSTEM.md`; не «переучить» в другой aesthetic.  
- **minimalist-ui** vs **high-end-visual-design**: при конфликте побеждает **DESIGN_SYSTEM.md** + high-end cinematic.  
- **design-spells**: screen-only effects; print static.  
- Не подтягивать Next ради skill.

### 7.5 Рекомендуемый порядок работы с skills
1. Scaffold без лишних skills (Vite + tokens + empty slide).  
2. `$site-architecture` — маршруты и папки.  
3. Вёрстка deck на DS + `$high-end-visual-design`.  
4. Контент эталона в `deck.json` из materials.  
5. PDF script.  
6. Console (+ shadcn если React).  
7. `$impeccable` audit/polish перед demo менеджеру.  
8. `$design-spells` точечно.

---

## 8. Открытые решения (defaults, пока пользователь не уточнил)

Помечай в коде `DECISION:` если меняешь.

| Тема | Default сейчас |
|---|---|
| Навигация | Клавиатура + точки; optional scroll-snap later |
| PDF aspect | 16:9, 1920×1080 |
| 8 vs 9 ft | Один deck, params/toggle на cover+specs+CTA |
| Цена | Нет в v1 (toggle later) |
| Publish | Static slug под `/p/...` из build; runtime Blob — later |
| Console auth | Env secret / basic auth |
| Тема эталона | home + dark |

---

## 9. Первый промпт-задача для Codex (скопировать после вставки путей)

```text
Прочитай @CODEX_SEED.md и @DESIGN_SYSTEM.md.

Задача slice 1:
1) Scaffold Vite + TypeScript.
2) Подключи fonts из ⟦PATH/fonts⟧.
3) Создай src/styles/tokens.css строго по DESIGN_SYSTEM §15 (--wb-*).
4) Сверстай пустой shell: .wb-deck + 2 dummy .wb-slide (cover + closing) full viewport.
5) data-wb-theme="home" data-wb-variant="dark".
6) README: scripts dev/build.

Не подключай Next.js. Не используй shadcn на client slides.
Не выдумывай specs стола. После slice 1 остановись и покажи tree.
```

Следующие slice (не делать в первом сообщении, пока slice 1 не ок):
- slice 2: types + deck.json эталона из `⟦brief⟧` + narrative 12 slides  
- slice 3: renderer всех archetypes  
- slice 4: print.css + `npm run export:pdf`  
- slice 5: /console toggles  
- slice 6: $impeccable polish  

---

## 10. Чеклист «перед тем как звать Codex»

- [ ] `DESIGN_SYSTEM.md` v2 в корне  
- [ ] Этот seed в корне  
- [ ] Пути §3.2 и §7.2 заполнены  
- [ ] Skills лежат в project skills dir  
- [ ] Шрифты доступны  
- [ ] Хотя бы hero + несколько detail фото эталона  
- [ ] Бриф Victory II Plus доступен  

---

*Weekend Billiard · Presentation System · Codex seed · 2026-08-09*