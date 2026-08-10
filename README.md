# Weekend Billiard Presentation System

Минимальный Vite + TypeScript shell для full-viewport презентаций Weekend Billiard.

## Требования

- Node.js 20.19+ или 22.12+
- npm

## Скрипты

```bash
npm install
npm run dev
npm run build
```

- `npm run dev` — запускает локальный Vite dev-сервер.
- `npm run build` — проверяет TypeScript и собирает production bundle в `dist/`.
- `npm run preview` — локально показывает собранный bundle.

## Preview themes

- Deck: `http://127.0.0.1:4173/`
- Theme inspector: `http://127.0.0.1:4173/console/`
- Direct preview example: `http://127.0.0.1:4173/?theme=home&variant=light`

The console is a local authoring workspace. It shows a 2×2 board of real slide
previews, switches `data-wb-theme` and `data-wb-variant`, edits resolved
`--wb-color-*` values, saves named presets, and remembers object positions in
the current browser profile.

## Slice 1

Shell содержит `.wb-deck` и две пустые full-viewport `.wb-slide`: cover и closing. Атрибуты `data-wb-theme="home"` и `data-wb-variant="dark"` установлены на `<html>` по основному `Tokens/DS_SYSTEM_PRESENTATION.md`. Локальные Diaria Pro и доступные начертания Inter подключены из `fonts/`. Товарный контент и характеристики в этот slice не входят.
