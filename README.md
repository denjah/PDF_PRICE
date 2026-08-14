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

- RASSON deck: `http://127.0.0.1:4173/?deck=rasson-victory-ii-plus-white`
- GARLANDO deck: `http://127.0.0.1:4173/?deck=garlando-image`
- Constructor: `http://127.0.0.1:4173/console/?deck=garlando-image`
- Direct preview example: `http://127.0.0.1:4173/?deck=garlando-image&theme=classic&variant=light`

The console is a local authoring workspace. It shows a 2×2 board of real slide
previews, switches `data-wb-theme` and `data-wb-variant`, edits resolved
`--wb-color-*` values, saves named presets, and remembers object positions in
the current browser profile.

The presentation selector in the constructor changes the active deck through
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
