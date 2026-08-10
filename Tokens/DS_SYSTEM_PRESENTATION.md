# Weekend Billiard — Дизайн-система презентаций

> **Версия:** 2.0 · **Дата:** 2026-08-09  
> **Статус:** source of truth  
> **Назначение:** HTML full-page презентации товаров (бильярдные столы и др.) в бренде Weekend Billiard + экспорт PDF.  
> **Не покрывает:** встраиваемые баннеры 1500×500 (устарели, v1).

---

## 0. Changelog v1 → v2

| Было (v1 banner) | Стало (v2 deck) |
|---|---|
| Виджет 1500×500, radius 16px | Слайд 100vw × 100dvh (stage 16:9) |
| `@container rb-preview` | `@media` + `dvh`; container только для `/console` preview |
| `--rb-*` и голые `--accent` | Единый namespace `--wb-*` |
| `--rb-slide4-bg` | `--wb-color-surface` |
| `bgDark` как «тёмный фон» | `--wb-color-brand-deep` (navy темы) |
| Body 9–12px | Deck type scale 14–17px / fluid clamp |
| Ровно 4 слайда + autoplay 6s | 10–14 слайдов; autoplay выкл. по умолчанию |
| Hardcoded `#fff` / `rgba(255,255,255,*)` | Semantic color tokens (Dark / Light / Accent) |
| Эффекты всегда | Screen-only motion; print/PDF — static |
| `user-select: none` на всём | Только декор; контент и контакты выделяемы |

---

## 1. Философия

| Принцип | Описание |
|---|---|
| **Тёмный премиум** | Глубокие near-black поверхности, акцентное свечение — luxury lookbook |
| **Кинематографичность** | Полноэкранные фото, градиентные вуали, лёгкий film grain |
| **Минимальная типографика** | Крупный display + спокойный body, воздух, короткие блоки |
| **Жёсткая геометрия** | Clip-path на badge/CTA (скос 8–10px), L-corner marks |
| **Один слайд = один экран** | Клиент листает как презентацию; PDF: 1 слайд = 1 страница |
| **Бренд Weekend first** | Оболочка, хром, CTA — Weekend; продукт/завод — внутри narrative |
| **Данные ≠ оформление** | Контент из `deck.json`; токены и компоненты не знают SKU |
| **Screen ≠ Print** | Motion и particles только на экране |

---

## 2. Продуктовая модель

### 2.1 Роли

| Роль | Видит |
|---|---|
| **Клиент** | Чистая презентация `/p/{slug}/` + «Скачать PDF» |
| **Оператор** | `/console/` — состав секций, поля, ссылка |
| **Дизайнер** | Готовит визуал и материалы товара до сборки |

### 2.2 Narrative-дуга (порядок по умолчанию)

1. Cover **Weekend** + название стола + hero  
2. Weekend — официальный дистрибьютор бренда стола (RASSON и др.)  
3. Имидж бренда производителя  
4. Product story: USP → macro gallery → specs → championships  
5. Closing CTA (звонок, opt@, заявка, замер/монтаж, 8/9 ft)

### 2.3 Объём

- Целевой диапазон: **10–14** слайдов  
- Язык v1: **RU**  
- Категория v1: бильярдные столы  

---

## 3. Токены — правила

1. Только префикс **`--wb-`**.  
2. Не использовать: `--rb-*`, голые `--accent`, `--title`, `--bg-surface`.  
3. Компоненты читают **semantic** токены (`--wb-color-text`), не сырой HEX темы.  
4. Тема (Home/Sport/…) задаёт brand accents; variant (Dark/Light/Accent) задаёт surface/text.  
5. Геометрия deck — в `--wb-deck-*`, не в brand-цветах.  
6. Любой новый HEX → сначала в таблицу тем/variant, потом в CSS.

---

## 4. Цветовые токены

### 4.1 Brand themes (линейки Weekend)

| Тема | `--wb-color-accent` | `--wb-color-accent-2` | `--wb-color-brand-deep` | `--wb-color-brand-soft` | `--wb-particle-hue` |
|---|---|---|---|---|---|
| **Home** | `#B6894C` | `#D95C3C` | `#1E396A` | `#F3ECDC` | `182, 137, 76` |
| **Sport** | `#2176FF` | `#FF4D00` | `#0A1526` | `#E8F0FA` | `33, 118, 255` |
| **Classic** | `#6E7257` | `#D4AF37` | `#1B396A` | `#EDEEE8` | `110, 114, 87` |
| **Club** | `#6B46C1` | `#00D2FF` | `#1B396A` | `#E8E8F0` | `107, 70, 193` |

### 4.2 Variants (тон интерфейса)

| Variant | `--wb-color-black` | `--wb-color-white` | `--wb-color-surface` | `--wb-color-title` | `--wb-color-text` | `--wb-color-text-muted` |
|---|---|---|---|---|---|---|
| **Dark** (default) | `#08090A` | `#FFFFFF` | `#05060A` | `#FFFFFF` | `rgba(255,255,255,0.64)` | `rgba(255,255,255,0.36)` |
| **Light** | `#08090A` | `#FFFFFF` | `= brand-soft` | `#111827` | `#4B5563` | `rgba(17,24,39,0.42)` |
| **Accent** | `#08090A` | `#FFFFFF` | `= brand-deep` | `#FFFFFF` | `rgba(255,255,255,0.72)` | `rgba(255,255,255,0.40)` |

### 4.3 Light — уточнения по темам

| Тема | surface (brand-soft) | `--wb-color-text-strong` (для body reverse) |
|---|---|---|
| Home | `#F3ECDC` | `#1E396A` |
| Sport | `#E8F0FA` | `#0A1526` |
| Classic | `#EDEEE8` | `#1B396A` |
| Club | `#EAE8F5` | `#1B1050` |

### 4.4 Derived

| Token | Формула |
|---|---|
| `--wb-color-accent-dim` | `color-mix(in srgb, var(--wb-color-accent) 15%, transparent)` |
| `--wb-color-accent-mid` | `color-mix(in srgb, var(--wb-color-accent) 40%, transparent)` |
| `--wb-color-overlay-05` | `color-mix(in srgb, var(--wb-color-white) 5%, transparent)` |
| `--wb-color-overlay-10` | `color-mix(in srgb, var(--wb-color-white) 10%, transparent)` |
| `--wb-color-overlay-20` | `color-mix(in srgb, var(--wb-color-white) 20%, transparent)` |
| `--wb-color-overlay-40` | `color-mix(in srgb, var(--wb-color-white) 40%, transparent)` |
| `--wb-color-hairline` | `color-mix(in srgb, var(--wb-color-white) 12%, transparent)` |
| `--wb-color-divider` | `linear-gradient(90deg, var(--wb-color-accent), transparent)` |

> Light variant: overlay/hairline считать от `--wb-color-black` (инверсия), либо отдельные `--wb-color-overlay-*-inv` при реализации.

### 4.5 CSS `:root` — эталон (Home + Dark)

```css
:root {
  /* —— Theme: Home —— */
  --wb-color-accent:        #B6894C;
  --wb-color-accent-2:      #D95C3C;
  --wb-color-brand-deep:    #1E396A;
  --wb-color-brand-soft:    #F3ECDC;
  --wb-particle-hue:        182, 137, 76;

  /* —— Variant: Dark —— */
  --wb-color-black:         #08090A;
  --wb-color-white:         #FFFFFF;
  --wb-color-surface:       #05060A;
  --wb-color-page:          #08090A;
  --wb-color-title:         #FFFFFF;
  --wb-color-text:          rgba(255, 255, 255, 0.64);
  --wb-color-text-muted:    rgba(255, 255, 255, 0.36);
  --wb-color-text-strong:   #FFFFFF;

  /* —— Derived —— */
  --wb-color-accent-dim:    color-mix(in srgb, var(--wb-color-accent) 15%, transparent);
  --wb-color-accent-mid:    color-mix(in srgb, var(--wb-color-accent) 40%, transparent);
  --wb-color-overlay-05:    rgba(255, 255, 255, 0.05);
  --wb-color-overlay-10:    rgba(255, 255, 255, 0.10);
  --wb-color-overlay-20:    rgba(255, 255, 255, 0.20);
  --wb-color-overlay-40:    rgba(255, 255, 255, 0.40);
  --wb-color-hairline:      rgba(255, 255, 255, 0.12);

  /* —— Fonts —— */
  --wb-font-display:        "Diaria Pro", Georgia, "Times New Roman", serif;
  --wb-font-body:           Inter, Arial, Helvetica, sans-serif;

  /* —— Motion —— */
  --wb-ease-out:            cubic-bezier(0.22, 1, 0.36, 1);
  --wb-duration-color:      0.5s;
  --wb-motion:              1; /* 0 при reduced-motion / print */
}
```

### 4.6 Переключение темы / variant

```html
<html lang="ru"
  data-wb-theme="home"
  data-wb-variant="dark">
```

```css
html[data-wb-theme="sport"] {
  --wb-color-accent:     #2176FF;
  --wb-color-accent-2:   #FF4D00;
  --wb-color-brand-deep: #0A1526;
  --wb-color-brand-soft: #E8F0FA;
  --wb-particle-hue:     33, 118, 255;
}

html[data-wb-variant="light"] {
  --wb-color-surface:     var(--wb-color-brand-soft);
  --wb-color-page:        var(--wb-color-brand-soft);
  --wb-color-title:       #111827;
  --wb-color-text:        #4B5563;
  --wb-color-text-muted:  rgba(17, 24, 39, 0.42);
  --wb-color-text-strong: var(--wb-color-brand-deep);
  --wb-color-hairline:    rgba(17, 24, 39, 0.12);
  --wb-color-overlay-10:  rgba(17, 24, 39, 0.08);
}

html[data-wb-variant="accent"] {
  --wb-color-surface:     var(--wb-color-brand-deep);
  --wb-color-page:        var(--wb-color-brand-deep);
  --wb-color-title:       #FFFFFF;
  --wb-color-text:        rgba(255, 255, 255, 0.72);
  --wb-color-text-muted:  rgba(255, 255, 255, 0.40);
}
```

---

## 5. Типографика

### 5.1 Файлы

| Роль | Семейство | Начертания | Fallback |
|---|---|---|---|
| Display | Diaria Pro | 400, 600, 700 | Georgia, serif |
| Body / UI | Inter | 300, 400, 500, 600, 700, 800, 900 | Arial, sans-serif |

```css
@font-face {
  font-family: "Diaria Pro";
  src: url("./fonts/DiariaPro-Regular.otf") format("opentype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Diaria Pro";
  src: url("./fonts/DiariaPro-SemiBold.otf") format("opentype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Diaria Pro";
  src: url("./fonts/DiariaPro-Bold.otf") format("opentype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Light.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-ExtraBold.ttf") format("truetype");
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Inter";
  src: url("./fonts/Inter-Black.ttf") format("truetype");
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
```

> Имена файлов привести к фактическим в `/fonts`. Сохранять локально (self-contained HTML/PDF).

### 5.2 Type scale — Deck (full-page)

| Role | Token | Font | Desktop | Weight | Line-height | Tracking | Прочее |
|---|---|---|---|---|---|---|---|
| Hero title | `--wb-fs-h1` | display | `clamp(40px, 5.2vw, 72px)` | 700 | 1.0 | normal | `pre-line` |
| Section title | `--wb-fs-h2` | display | `clamp(32px, 3.6vw, 56px)` | 700 | 1.05 | normal | `pre-line` |
| Brand title | `--wb-fs-h2-brand` | display | `clamp(28px, 2.8vw, 40px)` | 700 | 1.1 | normal | |
| Eyebrow | `--wb-fs-eyebrow` | body | `11px` | 500 | 1.2 | `0.4em` | uppercase, accent |
| Badge | `--wb-fs-badge` | body | `12px` | 700 | 1 | `0.22em` | uppercase |
| Subtitle | `--wb-fs-sub` | body | `clamp(16px, 1.2vw, 20px)` | 300 | 1.55 | `0.01em` | |
| Body / features | `--wb-fs-body` | body | `clamp(14px, 1.05vw, 17px)` | 400 | 1.45 | `0.02em` | strong = 500 + title color |
| Param label | `--wb-fs-param-label` | body | `11px` | 500 | 1.2 | `0.3em` | uppercase, muted |
| Param value | `--wb-fs-param-value` | body | `15px` | 500 | 1.3 | `0.06em` | title color |
| CTA | `--wb-fs-cta` | body | `12px` | 600 | 1 | `0.3em` | uppercase |
| Slide counter | `--wb-fs-counter` | body | `11px` | 500 | 1 | `0.22em` | muted |
| Macro label | `--wb-fs-macro` | body | `10px` | 700 | 1 | `0.3em` | uppercase |
| Ghost | `--wb-fs-ghost` | display | `clamp(96px, 14vw, 200px)` | 700 | 1 | `-0.04em` | stroke only |
| Spec table | `--wb-fs-spec` | body | `14px` | 400 | 1.4 | normal | |

```css
:root {
  --wb-fs-h1:            clamp(40px, 5.2vw, 72px);
  --wb-fs-h2:            clamp(32px, 3.6vw, 56px);
  --wb-fs-h2-brand:      clamp(28px, 2.8vw, 40px);
  --wb-fs-eyebrow:       11px;
  --wb-fs-badge:         12px;
  --wb-fs-sub:           clamp(16px, 1.2vw, 20px);
  --wb-fs-body:          clamp(14px, 1.05vw, 17px);
  --wb-fs-param-label:   11px;
  --wb-fs-param-value:   15px;
  --wb-fs-cta:           12px;
  --wb-fs-counter:       11px;
  --wb-fs-macro:         10px;
  --wb-fs-ghost:         clamp(96px, 14vw, 200px);
  --wb-fs-spec:          14px;
}
```

### 5.3 Адаптив type (ориентиры)

| Breakpoint | h1 | h2 | sub | body |
|---|---|---|---|---|
| ≥1200px | ≤72 | ≤56 | ≤20 | ≤17 |
| ≤1199px | ~52 | ~44 | 16 | 15 |
| ≤899px | ~40 | ~34 | 15 | 15 |
| ≤639px | ~32 | ~28 | 14 | 14 |
| ≤479px | ~28 | ~24 | 13 | 14 |

Основной механизм — `clamp`; таблица для QA, не дублировать px без нужды.

---

## 6. Deck layout tokens

### 6.1 Сцена

```css
:root {
  --wb-deck-aspect:         16 / 9;
  --wb-deck-width:          100vw;
  --wb-deck-height:         100dvh;
  --wb-deck-stage-max-w:    1920px;   /* опциональный letterbox */
  --wb-deck-radius:         0px;      /* client page */
  --wb-deck-pad-x:          clamp(24px, 4.5vw, 72px);
  --wb-deck-pad-y:          clamp(28px, 5.5vh, 72px);
  --wb-deck-text-col:       minmax(360px, 42%);
  --wb-deck-media-col:      1fr;
  --wb-deck-gap:            clamp(16px, 2vw, 40px);
  --wb-deck-content-max:    34rem;    /* max width текстового потока в колонке */
}
```

### 6.2 Z-index scale

```css
:root {
  --wb-z-base:       0;
  --wb-z-decor:      2;    /* ghost, glow */
  --wb-z-media:      5;
  --wb-z-veil:       6;
  --wb-z-content:    10;
  --wb-z-chrome:     40;   /* counter, arrows, download */
  --wb-z-noise:      50;
  --wb-z-overlay:    60;   /* console modals later */
}
```

### 6.3 Слайд-shell

```css
.wb-page {
  margin: 0;
  background: var(--wb-color-page);
  color: var(--wb-color-text);
  font-family: var(--wb-font-body);
  font-weight: 300;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

.wb-deck {
  width: var(--wb-deck-width);
}

.wb-slide {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  min-height: var(--wb-deck-height);
  height: var(--wb-deck-height);
  overflow: hidden;
  background: var(--wb-color-surface);
  color: var(--wb-color-text);
  border-radius: var(--wb-deck-radius);
}

.wb-slide__grid {
  display: grid;
  grid-template-columns: var(--wb-deck-text-col) var(--wb-deck-media-col);
  gap: 0;
  min-height: 100%;
  height: 100%;
}

/* модификаторы доли текста */
.wb-slide--split-default {
  --wb-deck-text-col: minmax(360px, 42%);
}
.wb-slide--split-wide-text {
  --wb-deck-text-col: minmax(380px, 48%);
}
.wb-slide--split-narrow-text {
  --wb-deck-text-col: minmax(320px, 38%);
}
.wb-slide--stack {
  /* mobile / full-bleed text */
}

.wb-slide__text {
  position: relative;
  z-index: var(--wb-z-content);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--wb-deck-pad-y) var(--wb-deck-pad-x);
  max-width: 100%;
  background: linear-gradient(
    105deg,
    var(--wb-color-surface) 0%,
    var(--wb-color-surface) 58%,
    transparent 100%
  );
}

.wb-slide__text-inner {
  max-width: var(--wb-deck-content-max);
}

.wb-slide__media {
  position: relative;
  z-index: var(--wb-z-media);
  min-height: 0;
  overflow: hidden;
}

.wb-slide__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

### 6.4 Mobile (≤639px)

```css
@media (max-width: 639px) {
  .wb-slide {
    height: auto;
    min-height: 100dvh;
  }

  .wb-slide__grid {
    display: flex;
    flex-direction: column;
  }

  .wb-slide__media {
    order: 1;
    flex: 0 0 auto;
    min-height: 42vw;
    max-height: 48vh;
    aspect-ratio: 16 / 10;
  }

  .wb-slide__text {
    order: 2;
    flex: 1 1 auto;
    background: var(--wb-color-surface);
    padding: 20px 22px 28px;
    justify-content: flex-start;
  }

  .wb-ghost,
  .wb-glow-orb,
  .wb-particles,
  .wb-corner {
    display: none !important;
  }
}
```

### 6.5 Breakpoints

| Имя | Width | Layout |
|---|---|---|
| Desktop | >1200px | 2 col, full vh |
| Small desktop | ≤1199px | 2 col ~45/55 |
| Tablet | ≤899px | 2 col ~50/50; corners off |
| Mobile | ≤639px | stack, photo top |
| Small phone | ≤479px | stack compact |

```css
/* corners */
@media (max-width: 899px) {
  .wb-corner { display: none; }
}
```

Console preview (опционально):

```css
.wb-console-preview {
  container-type: size;
  container-name: wb-preview;
}
```

Не использовать container queries как primary для клиентской выдачи.

---

## 7. Компоненты (semantic tokens only)

### 7.1 Eyebrow

```css
.wb-eyebrow {
  font-family: var(--wb-font-body);
  font-size: var(--wb-fs-eyebrow);
  font-weight: 500;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--wb-color-accent);
  margin: 0 0 12px;
}
```

### 7.2 Badge

```css
.wb-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--wb-color-accent);
  color: var(--wb-color-white);
  font-family: var(--wb-font-body);
  font-size: var(--wb-fs-badge);
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 8px 18px;
  position: relative;
  clip-path: polygon(
    0 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% 100%,
    8px 100%,
    0 calc(100% - 8px)
  );
}
.wb-badge::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  clip-path: inherit;
  pointer-events: none;
}
```

### 7.3 Titles

```css
.wb-title {
  font-family: var(--wb-font-display);
  font-weight: 700;
  color: var(--wb-color-title);
  line-height: 1.0;
  margin: 0 0 12px;
  white-space: pre-line;
}
.wb-title--h1 { font-size: var(--wb-fs-h1); }
.wb-title--h2 { font-size: var(--wb-fs-h2); line-height: 1.05; }
.wb-title--brand { font-size: var(--wb-fs-h2-brand); line-height: 1.1; }

.wb-accent {
  color: var(--wb-color-accent);
}
```

### 7.4 Subtitle / body

```css
.wb-sub {
  font-family: var(--wb-font-body);
  font-size: var(--wb-fs-sub);
  font-weight: 300;
  line-height: 1.55;
  letter-spacing: 0.01em;
  color: var(--wb-color-text);
  margin: 0 0 20px;
}

.wb-body {
  font-size: var(--wb-fs-body);
  font-weight: 400;
  line-height: 1.45;
  color: var(--wb-color-text);
}
```

### 7.5 CTA

```css
.wb-btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 1px solid var(--wb-color-accent);
  color: var(--wb-color-title);
  font-family: var(--wb-font-body);
  font-size: var(--wb-fs-cta);
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  padding: 14px 32px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  clip-path: polygon(
    0 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% 100%,
    10px 100%,
    0 calc(100% - 10px)
  );
  transition: color var(--wb-duration-color) var(--wb-ease-out);
}
.wb-btn-cta::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--wb-color-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--wb-ease-out);
  z-index: 0;
}
.wb-btn-cta:hover::before { transform: scaleX(1); }
.wb-btn-cta:hover {
  box-shadow:
    0 0 28px var(--wb-color-accent-dim),
    0 0 60px var(--wb-color-accent-dim);
  color: var(--wb-color-white);
}
.wb-btn-cta:focus-visible {
  outline: 2px solid var(--wb-color-accent);
  outline-offset: 3px;
}
.wb-btn-cta > * {
  position: relative;
  z-index: 1;
}
```

### 7.6 Params row

```css
.wb-params {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0;
  margin-top: 8px;
}
.wb-params__divider {
  width: 1px;
  height: 36px;
  background: var(--wb-color-hairline);
  margin: 0 24px;
  flex-shrink: 0;
}
.wb-params__col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.wb-params__label {
  font-size: var(--wb-fs-param-label);
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--wb-color-text-muted);
  line-height: 1.2;
}
.wb-params__value {
  font-size: var(--wb-fs-param-value);
  font-weight: 500;
  letter-spacing: 0.06em;
  color: var(--wb-color-title);
  line-height: 1.3;
}
```

### 7.7 Features list

```css
.wb-features {
  list-style: none;
  margin: 0 0 28px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.wb-features li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: var(--wb-fs-body);
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: 0.02em;
  color: var(--wb-color-text);
}
.wb-features__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--wb-color-accent);
  flex-shrink: 0;
  margin-top: 0.55em;
  box-shadow: 0 0 6px var(--wb-color-accent-mid);
}
.wb-features strong {
  color: var(--wb-color-title);
  font-weight: 500;
}
```

### 7.8 Divider / hairlines / corners

```css
.wb-hline {
  width: 100%;
  height: 1px;
  border: 0;
  margin: 0 0 24px;
  background: linear-gradient(90deg, var(--wb-color-accent), transparent);
}

.wb-hairline-top,
.wb-hairline-bottom {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  z-index: var(--wb-z-chrome);
  pointer-events: none;
}
.wb-hairline-top {
  top: 0;
  background: linear-gradient(90deg, transparent, var(--wb-color-accent), transparent);
  opacity: 0.6;
}
.wb-hairline-bottom {
  bottom: 0;
  background: linear-gradient(90deg, transparent, var(--wb-color-overlay-20), transparent);
}

.wb-corner {
  position: absolute;
  width: 24px;
  height: 24px;
  z-index: var(--wb-z-content);
  pointer-events: none;
}
.wb-corner--tr {
  top: 18px;
  right: 22px;
  border-top: 1px solid var(--wb-color-overlay-20);
  border-right: 1px solid var(--wb-color-overlay-20);
}
.wb-corner--bl {
  bottom: 18px;
  left: 22px;
  border-bottom: 1px solid var(--wb-color-overlay-10);
  border-left: 1px solid var(--wb-color-overlay-10);
}
```

### 7.9 Macro zone (2×2)

```css
.wb-macro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 0;
  height: 100%;
  min-height: 100%;
}

.wb-macro {
  position: relative;
  overflow: hidden;
  min-height: 0;
}
.wb-macro img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.72) contrast(1.08);
  transition: transform 0.6s var(--wb-ease-out);
}
@media (hover: hover) {
  .wb-macro:hover img { transform: scale(1.04); }
}
.wb-macro__label {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  max-width: calc(100% - 24px);
  padding: 5px 8px;
  background: color-mix(in srgb, var(--wb-color-black) 58%, transparent);
  border: 1px solid var(--wb-color-overlay-20);
  backdrop-filter: blur(6px);
  font-size: var(--wb-fs-macro);
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--wb-color-white);
  text-shadow: 0 1px 4px rgba(0,0,0,0.9);
}
.wb-macro::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0.5;
  background: linear-gradient(
    0deg,
    var(--wb-color-surface) 0%,
    transparent 40%,
    var(--wb-color-surface) 100%
  );
}
```

### 7.10 Ghost text / glow

```css
.wb-ghost {
  position: absolute;
  z-index: var(--wb-z-decor);
  bottom: -0.15em;
  left: -0.05em;
  font-family: var(--wb-font-display);
  font-weight: 700;
  font-size: var(--wb-fs-ghost);
  letter-spacing: -0.04em;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--wb-color-white) 4%, transparent);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}
html[data-wb-variant="light"] .wb-ghost {
  -webkit-text-stroke: 1px color-mix(in srgb, var(--wb-color-black) 6%, transparent);
}

.wb-glow-orb {
  position: absolute;
  z-index: var(--wb-z-decor);
  width: min(400px, 40vw);
  height: min(400px, 40vw);
  top: 50%;
  right: 8%;
  transform: translateY(-50%);
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, var(--wb-color-accent-dim) 0%, transparent 70%);
}
@media (prefers-reduced-motion: no-preference) {
  .wb-glow-orb {
    animation: wb-pulse calc(4s * var(--wb-motion, 1)) ease-in-out infinite;
  }
}
```

### 7.11 Noise

```css
.wb-noise {
  position: relative;
}
.wb-noise::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: var(--wb-z-noise);
  pointer-events: none;
  opacity: 0.028;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
}
```

### 7.12 Chrome: counter, nav, download

```css
.wb-chrome {
  position: fixed;
  z-index: var(--wb-z-chrome);
  pointer-events: none;
}
.wb-chrome a,
.wb-chrome button {
  pointer-events: auto;
}
.wb-counter {
  font-size: var(--wb-fs-counter);
  font-weight: 500;
  letter-spacing: 0.22em;
  color: var(--wb-color-text-muted);
  text-transform: uppercase;
}
.wb-download {
  /* визуально secondary CTA; не ломать clean client UI лишним chrome */
}
```

### 7.13 Specs table

```css
.wb-specs {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--wb-fs-spec);
  color: var(--wb-color-text);
}
.wb-specs th,
.wb-specs td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--wb-color-hairline);
  text-align: left;
  vertical-align: top;
}
.wb-specs th {
  color: var(--wb-color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
  width: 42%;
}
.wb-specs td {
  color: var(--wb-color-title);
  font-weight: 500;
}
```

---

## 8. Медиа и вуали

### 8.1 Image filter presets

| Preset | CSS `filter` | Применение |
|---|---|---|
| `macro` | `brightness(0.72) contrast(1.08)` | 2×2 детали |
| `hero` | `brightness(0.85)` | product / brand hero |
| `bg-fade` | `brightness(0.6) saturate(0.7)` | closing background |
| `hero-light` | `brightness(0.92) saturate(0.85)` | Light variant hero |
| `bg-light` | `brightness(0.85) saturate(0.8)` | Light variant bg |

```css
.wb-media--macro  img { filter: brightness(0.72) contrast(1.08); }
.wb-media--hero   img { filter: brightness(0.85); }
.wb-media--bg     img { filter: brightness(0.6) saturate(0.7); }
```

### 8.2 Gradient veils

| Где | Recipe |
|---|---|
| Text column → media | `linear-gradient(105deg, surface 0%, surface 58%, transparent 100%)` |
| Media left edge | `linear-gradient(90deg, surface, transparent)` width `clamp(48px, 12vw, 200px)` |
| Media bottom | `linear-gradient(to top, surface, transparent)` height `clamp(72px, 12vh, 120px)` |

---

## 9. Motion (screen only)

### 9.1 Tokens

```css
:root {
  --wb-ease-out:         cubic-bezier(0.22, 1, 0.36, 1);
  --wb-duration-reveal:  0.7s;
  --wb-duration-media:   1.1s;
  --wb-duration-color:   0.5s;
}

@media (prefers-reduced-motion: reduce) {
  :root { --wb-motion: 0; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 9.2 Keyframes

```css
@keyframes wb-reveal-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes wb-media-in {
  from { opacity: 0; transform: scale(1.07) translateX(40px); }
  to   { opacity: 1; transform: scale(1) translateX(0); }
}
@keyframes wb-macro-in {
  from { opacity: 0; transform: scale(1.1); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes wb-slow-zoom {
  0%   { transform: scale(1.06); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes wb-pulse {
  0%, 100% { transform: translateY(-50%) scale(1); opacity: 1; }
  50%      { transform: translateY(-50%) scale(1.1); opacity: 0.7; }
}
```

### 9.3 Stagger (active slide)

| nth | delay |
|---|---|
| 1 | 0.05s |
| 2 | 0.18s |
| 3 | 0.30s |
| 4 | 0.44s |
| 5 | 0.56s |
| 6 | 0.68s |

Macro cells: `0.15s → 0.25s → 0.35s → 0.45s`.

```css
.wb-anim {
  opacity: 0;
  transform: translateY(20px);
}
.wb-slide.is-active .wb-anim {
  animation: wb-reveal-up var(--wb-duration-reveal) var(--wb-ease-out) forwards;
}
```

### 9.4 Particles (optional, screen)

| Param | Value |
|---|---|
| Count | 40–55 |
| Radius | 0.2–1.4px |
| Alpha | 0.04–0.29 |
| Color | 70% white / 30% `rgb(var(--wb-particle-hue))` |
| PDF / reduced-motion | off |

### 9.5 Autoplay

**Default: OFF.**  
Не использовать progress autoplay 6s как в баннере. Листание: клавиатура / кнопки / (опционально) scroll-snap — продуктовое решение, не токен анимации карусели.

---

## 10. Архетипы слайдов (library)

Не «4 слайда», а **типы блоков** для колоды 10–14.

| ID | Имя | Grid | Типичный контент |
|---|---|---|---|
| `cover-weekend` | Cover Weekend | split-default | logo Weekend, title стола, hero, badge, params |
| `distributor` | Distributor trust | split-default / wide-text | Weekend = official distributor + facts |
| `brand-image` | Manufacturer brand | split-narrow-text | logo RASSON, brand copy, slowZoom hero |
| `product-hero` | Product hero | split-default | slogan, key params, table hero |
| `usp` | USP single | split-default | one advantage + macro/hero |
| `engineering` | Engineering 2×2 | split-narrow-text | features + macro grid |
| `gallery` | Gallery | full / 2×2 | lifestyle / details |
| `specs` | Specs | wide-text or full | table 8/9 ft notes |
| `championships` | Sanctioning | split-default | EPBF/WPA, tournaments |
| `closing-cta` | Closing | split-default | CTA list, contacts, desaturated bg |

### 10.1 Wireframe: Cover
┌──────────────────────────────────────────────────────┐
│ ghost │
│ EYEBROW │
│ BADGE │
│ TITLE line 1 │
│ TITLE accent line 2 │
│ subtitle │
│ ──── hline ──── │
│ PARAM | PARAM | PARAM │ HERO + glow │
└──────────────────────────────────────────────────────┘

text


### 10.2 Wireframe: Engineering
┌──────────────────────────────────────────────────────┐
│ TITLE │
│ subtitle │
│ ──── hline ──── │
│ - feature │
│ - feature │ [m] [m] │
│ - feature │ [m] [m] │
└──────────────────────────────────────────────────────┘

text


### 10.3 Wireframe: Closing
┌──────────────────────────────────────────────────────┐
│ TITLE │
│ subtitle │
│ ──── hline ──── │
│ - next steps │
│ [ CTA] │ BG desaturated │
│ contacts │
└──────────────────────────────────────────────────────┘

text


## 11. Навигация и клиентский chrome

Рекомендуемый default (уточняется продуктом):

- Один слайд = один viewport (`height: 100dvh`)  
- Управление: `←/→`, `Space`, точки/счётчик  
- Опционально: vertical scroll-snap  
- Fixed: счётчик `03 / 12`, кнопка PDF  
- Console UI **никогда** не попадает в client bundle route `/p/*`

---

## 12. Print / PDF

### 12.1 Цели

- 1 `.wb-slide` = 1 страница PDF  
- Без обрезки текста и CTA  
- Без particles, pulse, ken-burns, hover  
- Шрифты встроены  
- Формат страницы: **16:9** (предпочтительно 1920×1080 landscape)  

### 12.2 CSS

```css
@page {
  size: 338.67mm 190.5mm; /* 1920×1080 CSS px @ 96dpi ≈ */
  margin: 0;
}

@media print {
  :root {
    --wb-motion: 0;
    --wb-deck-height: 100%;
    --wb-deck-radius: 0;
  }

  body {
    background: #fff;
  }

  .wb-chrome,
  .wb-particles,
  .wb-glow-orb,
  .wb-progress {
    display: none !important;
  }

  .wb-slide {
    height: 100vh;
    min-height: 0;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .wb-slide:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  .wb-anim,
  .wb-slide.is-active .wb-anim {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }

  .wb-macro img,
  .wb-slide__media img {
    filter: none; /* или финальный статичный preset без animation */
  }
}
```

### 12.3 Playwright (рекомендация)

- Viewport: `1920×1080`  
- `emulateMedia({ media: 'print' })` **или** screen + print CSS — выбрать один pipeline и зафиксировать в README  
- Дождаться fonts: `document.fonts.ready`  
- `page.pdf({ width: '1920px', height: '1080px', printBackground: true, margin: none })`  
- Скрипт: `npm run export:pdf` (local/CI), артефакт рядом с deck  

---

## 13. Accessibility & performance

| Тема | Правило |
|---|---|
| reduced-motion | `--wb-motion: 0`, анимации off |
| Контраст | title/text на surface ≥ читаемый; QA на Dark и Light |
| Focus | `:focus-visible` на CTA, nav, download |
| Selection | текст и контакты **selectable**; `user-select: none` только ghost/decor |
| Alt | все product images с осмысленным `alt` |
| font-display | `swap` |
| LCP | hero первого слайда — priority / preload |
| Console | `noindex`, auth/secret |

---

## 14. Map rename (v1 → v2)

| v1 | v2 |
|---|---|
| `--rb-accent` / `--accent` | `--wb-color-accent` |
| `--rb-accent2` / `--accent2` | `--wb-color-accent-2` |
| `--rb-bg-dark` / `--bg-dark` | `--wb-color-brand-deep` |
| `--rb-bg-light` / `--bg-light` | `--wb-color-brand-soft` |
| `--rb-slide4-bg` / `--bg-surface` | `--wb-color-surface` |
| `--rb-title-color` / `--title` | `--wb-color-title` |
| `--rb-text-color` / `--text` | `--wb-color-text` |
| `--rb-black` / `--black` | `--wb-color-black` |
| `--rb-white` / `--white` | `--wb-color-white` |
| `--rb-accent-dim` | `--wb-color-accent-dim` |
| `--rb-accent-mid` | `--wb-color-accent-mid` |
| `--rb-f-display` / `--f-display` | `--wb-font-display` |
| `--rb-f-body` / `--f-body` | `--wb-font-body` |
| `bannerHeight: 500` | удалён |
| `borderRadius: 16` (page) | `--wb-deck-radius: 0` |
| `slideCount: 4` | deck length из данных |
| `autoplayDuration: 6000` | default off |
| `.container` | `.wb-slide` / `.wb-deck` |
| `.badge` | `.wb-badge` |
| `.btn-cta` | `.wb-btn-cta` |
| `.ghost-text` | `.wb-ghost` |
| `.glow-orb` | `.wb-glow-orb` |
| `.macro-zone` | `.wb-macro` |

---

## 15. Минимальный `tokens.css` (copy-paste start)

```css
/* tokens.css — Weekend Billiard Presentation System v2 */
:root {
  --wb-color-accent:        #B6894C;
  --wb-color-accent-2:      #D95C3C;
  --wb-color-brand-deep:    #1E396A;
  --wb-color-brand-soft:    #F3ECDC;
  --wb-particle-hue:        182, 137, 76;

  --wb-color-black:         #08090A;
  --wb-color-white:         #FFFFFF;
  --wb-color-surface:       #05060A;
  --wb-color-page:          #08090A;
  --wb-color-title:         #FFFFFF;
  --wb-color-text:          rgba(255, 255, 255, 0.64);
  --wb-color-text-muted:    rgba(255, 255, 255, 0.36);
  --wb-color-text-strong:   #FFFFFF;

  --wb-color-accent-dim:    color-mix(in srgb, var(--wb-color-accent) 15%, transparent);
  --wb-color-accent-mid:    color-mix(in srgb, var(--wb-color-accent) 40%, transparent);
  --wb-color-overlay-05:    rgba(255, 255, 255, 0.05);
  --wb-color-overlay-10:    rgba(255, 255, 255, 0.10);
  --wb-color-overlay-20:    rgba(255, 255, 255, 0.20);
  --wb-color-overlay-40:    rgba(255, 255, 255, 0.40);
  --wb-color-hairline:      rgba(255, 255, 255, 0.12);

  --wb-font-display:        "Diaria Pro", Georgia, serif;
  --wb-font-body:           Inter, Arial, sans-serif;

  --wb-fs-h1:               clamp(40px, 5.2vw, 72px);
  --wb-fs-h2:               clamp(32px, 3.6vw, 56px);
  --wb-fs-h2-brand:         clamp(28px, 2.8vw, 40px);
  --wb-fs-eyebrow:          11px;
  --wb-fs-badge:            12px;
  --wb-fs-sub:              clamp(16px, 1.2vw, 20px);
  --wb-fs-body:             clamp(14px, 1.05vw, 17px);
  --wb-fs-param-label:      11px;
  --wb-fs-param-value:      15px;
  --wb-fs-cta:              12px;
  --wb-fs-counter:          11px;
  --wb-fs-macro:            10px;
  --wb-fs-ghost:            clamp(96px, 14vw, 200px);
  --wb-fs-spec:             14px;

  --wb-deck-aspect:         16 / 9;
  --wb-deck-width:          100vw;
  --wb-deck-height:         100dvh;
  --wb-deck-stage-max-w:    1920px;
  --wb-deck-radius:         0px;
  --wb-deck-pad-x:          clamp(24px, 4.5vw, 72px);
  --wb-deck-pad-y:          clamp(28px, 5.5vh, 72px);
  --wb-deck-text-col:       minmax(360px, 42%);
  --wb-deck-media-col:      1fr;
  --wb-deck-gap:            clamp(16px, 2vw, 40px);
  --wb-deck-content-max:    34rem;

  --wb-z-base:              0;
  --wb-z-decor:             2;
  --wb-z-media:             5;
  --wb-z-veil:              6;
  --wb-z-content:           10;
  --wb-z-chrome:            40;
  --wb-z-noise:             50;
  --wb-z-overlay:           60;

  --wb-ease-out:            cubic-bezier(0.22, 1, 0.36, 1);
  --wb-duration-reveal:     0.7s;
  --wb-duration-media:      1.1s;
  --wb-duration-color:      0.5s;
  --wb-motion:              1;
}

html[data-wb-theme="sport"] {
  --wb-color-accent: #2176FF;
  --wb-color-accent-2: #FF4D00;
  --wb-color-brand-deep: #0A1526;
  --wb-color-brand-soft: #E8F0FA;
  --wb-particle-hue: 33, 118, 255;
}
html[data-wb-theme="classic"] {
  --wb-color-accent: #6E7257;
  --wb-color-accent-2: #D4AF37;
  --wb-color-brand-deep: #1B396A;
  --wb-color-brand-soft: #EDEEE8;
  --wb-particle-hue: 110, 114, 87;
}
html[data-wb-theme="club"] {
  --wb-color-accent: #6B46C1;
  --wb-color-accent-2: #00D2FF;
  --wb-color-brand-deep: #1B396A;
  --wb-color-brand-soft: #E8E8F0;
  --wb-particle-hue: 107, 70, 193;
}

html[data-wb-variant="light"] {
  --wb-color-surface: var(--wb-color-brand-soft);
  --wb-color-page: var(--wb-color-brand-soft);
  --wb-color-title: #111827;
  --wb-color-text: #4B5563;
  --wb-color-text-muted: rgba(17, 24, 39, 0.42);
  --wb-color-text-strong: var(--wb-color-brand-deep);
  --wb-color-hairline: rgba(17, 24, 39, 0.12);
  --wb-color-overlay-10: rgba(17, 24, 39, 0.08);
  --wb-color-overlay-20: rgba(17, 24, 39, 0.14);
}
html[data-wb-variant="accent"] {
  --wb-color-surface: var(--wb-color-brand-deep);
  --wb-color-page: var(--wb-color-brand-deep);
  --wb-color-title: #FFFFFF;
  --wb-color-text: rgba(255, 255, 255, 0.72);
  --wb-color-text-muted: rgba(255, 255, 255, 0.40);
}

@media (prefers-reduced-motion: reduce) {
  :root { --wb-motion: 0; }
}
```

---

## 16. Чеклист новой презентации

- [ ] `data-wb-theme` + `data-wb-variant` на `<html>`  
- [ ] Подключены Diaria Pro + Inter (локальные файлы)  
- [ ] Только токены `--wb-*` (нет `--rb-*`, нет голых `--accent`)  
- [ ] Слайды: `min-height/height: 100dvh`, radius 0 на client  
- [ ] Narrative: Weekend cover → distributor → brand → product → CTA  
- [ ] Заголовки: display 700, акцент через `.wb-accent`  
- [ ] Eyebrow / badge / params / features / CTA по компонентам выше  
- [ ] Нет hardcoded `#fff` в param/CTA (кроме badge text on accent)  
- [ ] Noise / hairlines / corners на desktop  
- [ ] Mobile stack: photo top, decor off  
- [ ] `prefers-reduced-motion`  
- [ ] Print: 1 slide = 1 page, motion off  
- [ ] PDF script прогнан, текст не обрезан  
- [ ] Контакты выделяемы и кликабельны  
- [ ] Console не протекает в client URL  

---

## 17. Вне scope v2.0

- Баннерный виджет 500px  
- Автогенерация фактов о товаре  
- CMS съёмки  
- Мультиязык  
- Serverless Chromium на Vercel (PDF — CI/local)  

---

*Weekend Billiard Design System v2.0 — deck-first presentation tokens & components.*