# Weekend Billiard Presentation System

Минимальный Vite + TypeScript shell для full-viewport презентаций Weekend Billiard.

## Требования

- Node.js 20.19+ или 22.12+
- npm

## Скрипты

```bash
npm install
npm run index:workspace
npm run validate:data
npm run dev
npm run build
```

- `npm run dev` — запускает локальный Vite dev-сервер.
- `npm run index:workspace` — рекурсивно обновляет машинные индексы `PHOTOBASE` и `LOGO`, не перемещая и не переименовывая исходники.
- `npm run validate:data` — проверяет logo catalog, Photodesign, shot plan, prompt system и каждую JSONL-запись по JSON Schema.
- `npm run build` — проверяет TypeScript и собирает production bundle в `dist/`.
- `npm run preview` — локально показывает собранный bundle.

## Preview themes

- RASSON deck: `http://127.0.0.1:4173/?deck=rasson-victory-ii-plus-white`
- GARLANDO deck: `http://127.0.0.1:4173/?deck=garlando-image`
- Production console: `http://127.0.0.1:4173/console?deck=garlando-image`
- Direct preview example: `http://127.0.0.1:4173/?deck=garlando-image&theme=classic&variant=light`

## Local production console

Консоль — локальный production workspace с разделами Overview, Slides,
Photodesign, Logo Library, Marketing, Theme и Export / QA. Она рекурсивно
сканирует свободную Bridge-структуру товара и центральную папку `LOGO`.
Физические файлы остаются на месте; категории, назначения, статусы и prompt
snapshots хранятся отдельно.

В первой версии консоль записывает только:

- `PHOTOBASE/<PRODUCT>/photodesign.json`;
- `PHOTOBASE/<PRODUCT>/MARKETING/prompt_system.json`;
- `LOGO/logo_catalog.json`;
- append-only generation history после подтверждённой связи результата.

`specification.md`, `photos_description.md`, исследования и
`Logo_Asset_Catalog.md` показываются только для чтения. Новый файл получает
статус `new` и никогда не назначается категории, слайду или prompt snapshot
автоматически.

The presentation selector in the console changes the active deck through
the `deck` query parameter. Draft colors, object positions, and named presets
are stored in `localStorage` under deck-specific keys, so editing one deck does
not affect another.

## PDF export

```bash
npm run export:pdf -- --deck rasson-victory-ii-plus-white
npm run export:garlando
```

Each export is written to `public/downloads/<deck-slug>.pdf`.

## Slice 1

Shell содержит `.wb-deck` и две пустые full-viewport `.wb-slide`: cover и closing. Атрибуты `data-wb-theme="home"` и `data-wb-variant="dark"` установлены на `<html>` по основному `Tokens/DS_SYSTEM_PRESENTATION.md`. Локальные Diaria Pro и доступные начертания Inter подключены из `fonts/`. Товарный контент и характеристики в этот slice не входят.
