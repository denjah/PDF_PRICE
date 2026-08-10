# Weekend Billiard — Дизайн-система баннеров

> **Версия:** 1.0 · **Дата:** 2026-08-09
> **Назначение:** Источник истины для создания HTML-страниц-презентаций в едином визуальном стиле с hero-баннерами Weekend Billiard (Rasson / Cosmos).

---

## 1. Философия дизайна

| Принцип | Описание |
|---|---|
| **Тёмный премиум** | Глубокие, почти чёрные фоны с акцентным свечением — ощущение luxury-каталога |
| **Кинематографичность** | Полноэкранные фото с цветовыми вуалями (градиентные оверлеи), мягкий шум плёнки |
| **Минимальная типографика** | Крупные заголовки-дисплей + мелкий body-текст, много воздуха |
| **Жёсткая геометрия** | Clip-path на кнопках и бейджах: скошенные углы 8–10 px, угловые L-маркеры |
| **Микро-анимации** | Каскадный reveal-up, медленный ken-burns zoom, пульсирующий glow-orb, canvas-частицы |

---

## 2. Цветовые палитры

### 2.1 Брендовые группы (темы)

Каждая тема — визуальная «линейка» бренда Weekend. Все значения — HEX.

| Тема | `accent` | `accent2` | `bgDark` | `bgLight` | `particleHue` (RGB) |
|---|---|---|---|---|---|
| **Home** | `#B6894C` | `#D95C3C` | `#1E396A` | `#F3ECDC` | `182,137,76` |
| **Sport** | `#2176FF` | `#FF4D00` | `#0A1526` | `#E8F0FA` | `33,118,255` |
| **Classic** | `#6E7257` | `#D4AF37` | `#1B396A` | `#EDEEE8` | `110,114,87` |
| **Club** | `#6B46C1` | `#00D2FF` | `#1B396A` | `#E8E8F0` | `107,70,193` |

### 2.2 Варианты отображения

Определяют тон интерфейса поверх выбранной темы.

| Вариант | `black` | `white` | `slide4Bg` | `titleColor` | `textColor` |
|---|---|---|---|---|---|
| **Dark** | `#08090A` | `#FFFFFF` | `#05060A` | `#FFFFFF` | `#9ca3af` |
| **Light** | `#08090A` | `#FFFFFF` | `#F3ECDC` | `#111827` | `#4b5563` |
| **Accent** | `#08090A` | `#FFFFFF` | `#1E396A` *(= bgDark темы)* | `#FFFFFF` | `#cbd5e1` |

### 2.3 Light Mode — дополнительные переменные

Используются когда `variant === 'light'`:

| Тема | `bgLight` | `bgLightRgb` | `textDark` | `textDarkRgb` |
|---|---|---|---|---|
| **Home** | `#F3ECDC` | `243,236,220` | `#1E396A` | `30,57,106` |
| **Sport** | `#E8F0FA` | `232,240,250` | `#0A1526` | `10,21,38` |
| **Classic** | `#EDEEE8` | `237,238,232` | `#1B396A` | `27,57,106` |
| **Club** | `#EAE8F5` | `234,232,245` | `#1B1050` | `27,16,80` |

### 2.4 Производные цвета (computed)

Вычисляются на основе `accent`:

| CSS-переменная | Формула | Пример (Home) |
|---|---|---|
| `--rb-accent-dim` | `rgba(accent, 0.15)` | `rgba(182,137,76,0.15)` |
| `--rb-accent-mid` | `rgba(accent, 0.4)` | `rgba(182,137,76,0.4)` |
| `--rb-white-10` | `rgba(255,255,255,0.07)` | — |
| `--rb-white-20` | `rgba(255,255,255,0.14)` | — |
| `--rb-white-40` | `rgba(255,255,255,0.4)` | — |
| `--rb-white-60` | `rgba(255,255,255,0.6)` | — |

### 2.5 Сводка CSS-переменных

```css
:root {
  --rb-black:       #08090A;
  --rb-white:       #FFFFFF;
  --rb-accent:      #B6894C;        /* ← меняется по теме */
  --rb-accent2:     #D95C3C;        /* ← вторичный акцент */
  --rb-bg-dark:     #1E396A;
  --rb-bg-light:    #F3ECDC;        /* ← light-mode фон */
  --rb-slide4-bg:   #05060A;        /* ← фон слайда / панелей */
  --rb-title-color: #FFFFFF;
  --rb-text-color:  rgba(255,255,255,0.6);
  --rb-accent-dim:  rgba(182,137,76,0.15);
  --rb-accent-mid:  rgba(182,137,76,0.4);
  --rb-f-display:   'Diaria Pro', 'Georgia', serif;
  --rb-f-body:      'Inter', 'Arial', sans-serif;
}
```

---

## 3. Типографика

### 3.1 Шрифты

| Роль | Семейство | Файлы | Fallback |
|---|---|---|---|
| **Display** (заголовки) | Diaria Pro | `Regular.otf` (400), `Semi Bold.otf` (600), `Bold.otf` (700) | `Georgia`, serif |
| **Body** (текст, UI) | Inter | `Light.ttf` (300), `Bold.ttf` (700), `ExtraBold.ttf` (800), `Black.ttf` (900) | `Arial`, sans-serif |

### 3.2 Подключение шрифтов

```css
@font-face {
  font-family: 'Diaria Pro';
  src: url('./fonts/Diaria Pro Regular.otf') format('opentype');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Diaria Pro';
  src: url('./fonts/Diaria Pro Semi Bold.otf') format('opentype');
  font-weight: 600; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Diaria Pro';
  src: url('./fonts/Diaria Pro Bold.otf') format('opentype');
  font-weight: 700; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('./fonts/Inter-Light.ttf') format('truetype');
  font-weight: 300; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('./fonts/Inter-Bold.ttf') format('truetype');
  font-weight: 700; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('./fonts/Inter-ExtraBold.ttf') format('truetype');
  font-weight: 800; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Inter';
  src: url('./fonts/Inter-Black.ttf') format('truetype');
  font-weight: 900; font-style: normal; font-display: swap;
}
```

### 3.3 Типографическая шкала

| Элемент | Шрифт | Размер (Desktop) | Вес | Интерлиньяж | Трекинг | Доп. |
|---|---|---|---|---|---|---|
| **H1 — Hero Title** | Diaria Pro | 62 px | 700 | 1.0 | — | `white-space: pre-line` |
| **H2 — Section Title** | Diaria Pro | 50–54 px | 700 | 1.0–1.1 | — | `white-space: pre-line` |
| **H2 — Brand Title** (Slide 3) | Diaria Pro | 38 px | 700 | 1.1 | — | |
| **Eyebrow** | Inter | 10 px | 500 | — | `0.4em` | `text-transform: uppercase` |
| **Badge** | Inter | 11–13 px | 700 | — | `0.22em` | `text-transform: uppercase` |
| **Subtitle** | Inter | 15–19 px | 300 | 1.55 | `0.01em` | |
| **Body / Features** | Inter | 12 px | 400 | 1.4 | `0.04em` | `strong` = weight 500 |
| **Param Label** | Inter | 9 px | — | 1.2 | `0.3em` | `text-transform: uppercase`, цвет `rgba(255,255,255,0.35)` |
| **Param Value** | Inter | 13 px | 500 | 1.3 | `0.1em` | цвет `#fff` |
| **CTA Button** | Inter | 11 px | 600 | — | `0.3em` | `text-transform: uppercase` |
| **Slide Counter** | Inter | 10 px | 500 | — | `0.22em` | цвет `rgba(255,255,255,0.3)` |
| **Macro Label** | Inter | 9 px | 700 | — | `0.35em` | `text-transform: uppercase`, `text-shadow` |
| **Ghost Text** | Diaria Pro | 160–200 px | 700 | 1 | `-0.04em` | `transparent` fill, `stroke 1px rgba(255,255,255,0.04)` |

### 3.4 Адаптивная шкала

| Breakpoint | Container Width | Hero Title | Section Title | Subtitle |
|---|---|---|---|---|
| **Desktop** | > 1200 px | 62 px | 50–54 px | 15–19 px |
| **Small Desktop** | ≤ 1199 px | 52 px | 44 px | 15 px |
| **Tablet** | ≤ 899 px | 40 px | 36 px | 14 px |
| **Mobile** | ≤ 639 px | 32 px | 28 px | 13 px |
| **Small Phone** | ≤ 479 px | 26 px | 24 px | 12 px |

---

## 4. Лейаут и сетка

### 4.1 Контейнер баннера

```
max-width:     1500px
height:        500px  (desktop)
border-radius: 16px   (desktop), 12px (tablet), 0 (mobile)
overflow:      hidden
background:    var(--rb-black)    /* dark mode */
               var(--rb-bg-light) /* light mode */
margin:        0 auto
```

### 4.2 Двухколоночная сетка слайда

```
grid-template-columns: 560px 1fr        /* Slide 1, 4 */
                       520px 1fr        /* Slide 2 */
                       540px 1fr        /* Slide 3 */
```

**Левая колонка (текст):**
- `padding: 50px 60px 50px 70px` (Slide 1)
- `padding: 44px 52px 44px 70px` (Slide 2, 4)
- `padding: 24px 52px 50px 70px` (Slide 3)
- Фон: `linear-gradient(105deg, var(--rb-slide4-bg) 0%, var(--rb-slide4-bg) 60%, transparent 100%)`

**Правая колонка (изображение):**
- Полная высота, `overflow: hidden`
- Slide 2: внутренняя сетка `2×2` для macro-зон

### 4.3 Мобильный лейаут (≤ 639 px)

- Колонки → `flex-direction: column`
- **Фото сверху** (order: 1, flex: 1 1 auto, min-height: 160 px)
- **Текст снизу** (order: 2, flex: 0 0 auto, padding: 20px 28px 25px)
- `min-height: 520px` для баннера
- Ghost text, glow-orb, particles — скрыты

---

## 5. Компоненты

### 5.1 Badge (Бейдж)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--rb-accent);
  color: #FFFFFF;
  font-family: var(--rb-f-body);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  padding: 7px 18px;
  position: relative;
  /* Скошенные углы */
  clip-path: polygon(
    0 0,
    calc(100% - 8px) 0,
    100% 8px,
    100% 100%,
    8px 100%,
    0 calc(100% - 8px)
  );
}
/* Внутренний градиент-блик */
.badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  clip-path: inherit;
}
```

### 5.2 CTA Button (Кнопка действия)

```css
.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 1px solid var(--rb-accent);
  color: var(--rb-white);
  font-family: var(--rb-f-body);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  padding: 13px 32px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  /* Скошенные углы */
  clip-path: polygon(
    0 0,
    calc(100% - 10px) 0,
    100% 10px,
    100% 100%,
    10px 100%,
    0 calc(100% - 10px)
  );
}
/* Hover-заливка слева направо */
.btn-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--rb-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.btn-cta:hover::before {
  transform: scaleX(1);
}
.btn-cta:hover {
  box-shadow: 0 0 28px var(--rb-accent-dim), 0 0 60px var(--rb-accent-dim);
  color: #fff;
}
.btn-cta span,
.btn-cta svg {
  position: relative;
  z-index: 1;
}
```

### 5.3 Params Row (Строка параметров)

```css
.params-row {
  display: flex;
  align-items: flex-start;
  gap: 0;
}
.param-divider {
  width: 1px;
  height: 32px;
  background: rgba(255,255,255,0.12);
  margin: 0 28px;
  flex-shrink: 0;
}
.param-col {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.param-label {
  font-size: 9px;
  letter-spacing: 0.3em;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  line-height: 1.2;
}
.param-value {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.1em;
  line-height: 1.3;
}
```

### 5.4 Features List (Список преимуществ)

```css
.features-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0 0 28px 0;
}
.features-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  font-weight: 400;
  color: var(--rb-text-color);
  letter-spacing: 0.04em;
  line-height: 1.4;
}
/* Акцентная точка */
.dot-icon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--rb-accent);
  flex-shrink: 0;
  margin-top: 5px;
  box-shadow: 0 0 6px var(--rb-accent-mid);
}
.features-list li strong {
  color: var(--rb-title-color);
  font-weight: 500;
}
```

### 5.5 Horizontal Line (Разделитель)

```css
.h-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, var(--rb-accent), transparent);
  margin-bottom: 24px;
}
```

### 5.6 Hairlines (Тонкие декоративные линии)

```css
/* Верхняя — акцентная */
.hairline-top {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--rb-accent), transparent);
  opacity: 0.6;
  z-index: 55;
}
/* Нижняя — белая */
.hairline-bottom {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  z-index: 55;
}
```

### 5.7 Corner Marks (Угловые L-маркеры)

```css
.corner-mark-tr {
  position: absolute;
  top: 18px; right: 22px;
  width: 24px; height: 24px;
  border-top: 1px solid rgba(255,255,255,0.12);
  border-right: 1px solid rgba(255,255,255,0.12);
  z-index: 20;
}
.corner-mark-bl {
  position: absolute;
  bottom: 18px; left: 22px;
  width: 24px; height: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  border-left: 1px solid rgba(255,255,255,0.08);
  z-index: 20;
}
```

> Скрываются на ≤ 899 px.

### 5.8 Macro Zone (Фото-карточка 2×2)

```css
.macro-zone {
  position: relative;
  overflow: hidden;
}
.macro-zone img {
  width: 100%; height: 100%;
  object-fit: cover;
  filter: brightness(0.72) contrast(1.08);
  transition: transform 0.6s ease;
}
.macro-zone:hover img {
  transform: scale(1.04);
}
/* Метка */
.macro-zone-label {
  position: absolute;
  top: 12px; left: 12px;
  display: inline-flex;
  max-width: calc(100% - 24px);
  padding: 5px 8px;
  background: rgba(2,6,23,0.58);
  border: 1px solid rgba(255,255,255,0.16);
  backdrop-filter: blur(6px);
  font-family: var(--rb-f-body);
  font-size: 9px; font-weight: 700;
  letter-spacing: 0.35em;
  color: rgba(255,255,255,0.9);
  text-transform: uppercase;
  z-index: 10;
  text-shadow: 0 1px 4px rgba(0,0,0,0.9);
}
/* Вуаль сверху и снизу */
.macro-zone::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg,
    var(--rb-slide4-bg) 0%,
    transparent 40%,
    var(--rb-slide4-bg) 100%
  );
  opacity: 0.5;
  z-index: 2;
}
```

### 5.9 Ghost Text (Фоновый текст-призрак)

```css
.ghost-text {
  position: absolute;
  font-family: var(--rb-f-display);
  font-weight: 700;
  font-size: 200px;
  letter-spacing: -0.04em;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.04);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 0;
  bottom: -30px;
  left: -10px;
}
```

> В light mode: `-webkit-text-stroke: 1px rgba(0,0,0,0.06)`.
> Скрывается на ≤ 639 px.

### 5.10 Glow Orb (Пульсирующее свечение)

```css
.glow-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
  width: 400px; height: 400px;
  top: 50%; right: 100px;
  transform: translateY(-50%);
  background: radial-gradient(circle, var(--rb-accent-dim) 0%, transparent 70%);
  animation: pulse 4s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: translateY(-50%) scale(1);   opacity: 1;   }
  50%      { transform: translateY(-50%) scale(1.1);  opacity: 0.7; }
}
```

> Скрывается на ≤ 639 px.

### 5.11 Progress Bar (Полоса прогресса)

```css
.progress-bar {
  position: absolute;
  bottom: 0; left: 0;
  height: 2px;
  width: 100%;
  background: linear-gradient(90deg, var(--rb-accent), var(--rb-accent-dim));
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform linear;
  box-shadow: 0 0 8px var(--rb-accent-mid);
  border-radius: 0 0 16px 16px;
  z-index: 60;
}
```

---

## 6. Текстуры и эффекты

### 6.1 Шум плёнки (Noise overlay)

Накладывается через `::before` на контейнер:

```css
.container::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 50;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.028;
  pointer-events: none;
}
```

### 6.2 Canvas-частицы

55 частиц, хаотичное движение:

| Параметр | Значение |
|---|---|
| Количество | 55 |
| Радиус | 0.2–1.4 px |
| Альфа | 0.04–0.29 |
| Скорость X | ±0.18 px/frame |
| Скорость Y | ±0.12 px/frame |
| Цвет | 70% → `rgb(255,255,255)`, 30% → `rgb(particleHue)` |
| Wrap | Телепорт при выходе за границы ± 5 px |

### 6.3 Gradient Overlays (Градиентные вуали)

| Где | Направление | Формула |
|---|---|---|
| Левая колонка → правый край | 105° | `var(--rb-slide4-bg) 0% → 60%, transparent 100%` |
| Правая колонка → левый край | 90° | `var(--rb-slide4-bg) → transparent`, ширина 60–200 px |
| Правая колонка → нижний край | to top | `var(--rb-slide4-bg) → transparent`, высота 100–120 px |

### 6.4 Image Filters

| Контекст | CSS filter |
|---|---|
| Macro-зона (Slide 2) | `brightness(0.72) contrast(1.08)` |
| Hero-фото (Slide 3) | `brightness(0.85)` |
| Background-фото (Slide 4) | `brightness(0.6) saturate(0.7)` |
| Light mode hero | `brightness(0.92) saturate(0.85)` |
| Light mode bg | `brightness(0.85) saturate(0.8)` |

---

## 7. Анимации

### 7.1 Easing

**Основная кривая:** `cubic-bezier(0.22, 1, 0.36, 1)` — быстрый старт, мягкое замедление.

### 7.2 Каталог анимаций

| Имя | Свойства | Длительность | Описание |
|---|---|---|---|
| **revealUp** | `opacity: 0→1, translateY: 20px→0` | 0.7s | Каскадный вход текстовых блоков |
| **tableReveal** | `opacity: 0→1, scale: 1.07→1, translateX: 40px→0` | 1.1s | Вход hero-изображения |
| **macroReveal** | `opacity: 0→1, scale: 1.1→1` | 1.0s | Вход фото-карточек |
| **slowZoom** | `scale: 1.06→1.0, opacity: 0→1 (at 20%)` | 8.0s | Ken Burns на brand-фото |
| **pulse** | `scale: 1↔1.1, opacity: 1↔0.7` | 4.0s (infinite) | Пульсация glow-orb |

### 7.3 Каскадные задержки (stagger)

Элементы с классом `.anim-item` внутри активного слайда получают нарастающую задержку:

| nth-child | Delay |
|---|---|
| 1 | 0.05s |
| 2 | 0.18s |
| 3 | 0.30s |
| 4 | 0.44s |
| 5 | 0.56s |
| 6 | 0.68s |

Macro-зоны: `0.15s → 0.25s → 0.35s → 0.45s`.

### 7.4 Keyframes (копируемый CSS)

```css
@keyframes revealUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}

@keyframes tableReveal {
  from { opacity: 0; transform: scale(1.07) translateX(40px); }
  to   { opacity: 1; transform: scale(1) translateX(0);       }
}

@keyframes macroReveal {
  from { opacity: 0; transform: scale(1.1); }
  to   { opacity: 1; transform: scale(1);   }
}

@keyframes slowZoom {
  0%   { transform: scale(1.06); opacity: 0; }
  20%  { opacity: 1; }
  100% { transform: scale(1.0);  opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: translateY(-50%) scale(1);   opacity: 1;   }
  50%      { transform: translateY(-50%) scale(1.1);  opacity: 0.7; }
}
```

### 7.5 Transition defaults

Все цветовые переходы: `transition: * 0.5s` — плавная смена палитры при переключении темы.

---

## 8. Структура слайдов (шаблоны)

### 8.1 Hero (Slide 1) — Главный

```
┌─────────────────────────────────────────────┐
│  [ghost text]                               │
│  EYEBROW · uppercase · accent color         │
│  ★ BADGE                                    │
│  TITLE LINE 1                               │
│  ACCENT WORD  LINE 2                        │
│  subtitle                                   │
│  ──── h-line ────                           │
│  PARAM | PARAM | PARAM                      │
│                    [HERO IMAGE + glow orb]   │
└─────────────────────────────────────────────┘
```

Особенности:
- Grid: `560px 1fr`
- Hero Title: 62 px
- Badge: 13 px, padding 8×20
- Image animation: `tableReveal 1.1s`
- Правая колонка: gradient overlay left 200px + bottom 120px

### 8.2 Information (Slide 2) — Инженерия

```
┌─────────────────────────────────────────────┐
│  [ghost text · 160px]                       │
│  TITLE (54px)                               │
│  subtitle (16px)                            │
│  ──── h-line ────                           │
│  • Feature 1              [img1] [img2]     │
│  • Feature 2              [img3] [img4]     │
│  • Feature 3              (2×2 macro grid)  │
└─────────────────────────────────────────────┘
```

Особенности:
- Grid: `520px 1fr`
- Правая колонка: `grid 2×2`, каждая зона — macro-zone
- Macro images: staggered reveal `0.15s → 0.45s`
- Left gradient overlay: 60px

### 8.3 Alternative (Slide 3) — Бренд

```
┌─────────────────────────────────────────────┐
│  [ghost text · 200px]                       │
│  LOGO LABEL (eyebrow-стиль)                 │
│  [brand logo img · h: 28px]                 │
│  TITLE (38px)                               │
│  subtitle (14px)                            │
│  ──── h-line ────                           │
│  PARAM | PARAM | PARAM                      │
│                    [FULL HERO + slowZoom 8s] │
└─────────────────────────────────────────────┘
```

Особенности:
- Grid: `540px 1fr`
- Изображение: `object-fit: cover`, `brightness(0.85)`
- Animation: `slowZoom 8s ease-out`
- Left gradient: 200px, bottom gradient: 100px

### 8.4 Closing (Slide 4) — Финал + CTA

```
┌─────────────────────────────────────────────┐
│  [ghost text · 200px]                       │
│  TITLE (50px)                               │
│  subtitle (16px)                            │
│  ──── h-line ────                           │
│  • Feature 1                                │
│  • Feature 2                                │
│  • Feature 3                                │
│  [ CTA BUTTON → ]                           │
│                    [BG IMAGE desaturated]    │
└─────────────────────────────────────────────┘
```

Особенности:
- Grid: `560px 1fr`
- `slide-left` background: `var(--rb-slide4-bg) !important` (сплошной)
- Image filter: `brightness(0.6) saturate(0.7)`
- Image animation: `macroReveal 1.1s 0.1s`
- Left gradient: 180px
- CTA button с arrow SVG `14×14`

---

## 9. Глобальные параметры

| Параметр | Значение |
|---|---|
| `slideCount` | 4 |
| `autoplayDuration` | 6000 ms |
| `bannerHeight` | 500 px |
| `borderRadius` | 16 px |
| `maxWidth` | 1500 px |

---

## 10. Адаптивные breakpoints

Реализованы через `@container` queries (`container-name: rb-preview`):

| Имя | Ширина | Высота | Radius | Лейаут | Grid |
|---|---|---|---|---|---|
| **Desktop** | > 1200 px | 500 px | 16 px | 2 col grid | `560px 1fr` |
| **Small Desktop** | ≤ 1199 px | 460 px | 16 px | 2 col grid | `45% 55%` |
| **Tablet** | ≤ 899 px | 400 px | 12 px | 2 col grid | `50% 50%` |
| **Mobile** | ≤ 639 px | auto (min 520) | 0 | stacked (photo top) | flex column |
| **Small Phone** | ≤ 479 px | auto (min 490) | 0 | stacked compact | flex column |

---

## 11. Accessibility и Performance

| Аспект | Решение |
|---|---|
| `prefers-reduced-motion` | Все анимации → `0.01ms`, `iteration-count: 1` |
| `font-display` | `swap` для всех шрифтов |
| `user-select: none` | На баннере (декоративный контент) |
| `pointer-events: none` | На декоративных оверлеях, ghost text, particles |

---

## 12. Быстрый старт: шаблон HTML-презентации

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekend — [Название презентации]</title>

  <style>
    /* === Шрифты === */
    @font-face {
      font-family: 'Diaria Pro';
      src: url('./fonts/Diaria Pro Bold.otf') format('opentype');
      font-weight: 700; font-display: swap;
    }
    @font-face {
      font-family: 'Inter';
      src: url('./fonts/Inter-Light.ttf') format('truetype');
      font-weight: 300; font-display: swap;
    }
    @font-face {
      font-family: 'Inter';
      src: url('./fonts/Inter-Bold.ttf') format('truetype');
      font-weight: 700; font-display: swap;
    }

    /* === Тема: Home (замени на нужную из §2.1) === */
    :root {
      --accent:     #B6894C;
      --accent2:    #D95C3C;
      --accent-dim: rgba(182,137,76, 0.15);
      --accent-mid: rgba(182,137,76, 0.4);
      --bg-dark:    #1E396A;
      --bg-surface: #05060A;
      --bg-light:   #F3ECDC;
      --white:      #FFFFFF;
      --black:      #08090A;
      --title:      #FFFFFF;
      --text:       rgba(255,255,255, 0.6);
      --text-muted: rgba(255,255,255, 0.35);
      --f-display:  'Diaria Pro', 'Georgia', serif;
      --f-body:     'Inter', 'Arial', sans-serif;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background: var(--black);
      color: var(--text);
      font-family: var(--f-body);
      font-weight: 300;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }

    /* === Заголовки === */
    h1, h2, h3 {
      font-family: var(--f-display);
      font-weight: 700;
      color: var(--title);
      line-height: 1.0;
    }
    h1 { font-size: clamp(32px, 5vw, 62px); }
    h2 { font-size: clamp(24px, 4vw, 50px); }

    .accent { color: var(--accent); }

    .eyebrow {
      font-family: var(--f-body);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.4em;
      color: var(--accent);
      text-transform: uppercase;
    }

    .divider {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, var(--accent), transparent);
      margin: 24px 0;
    }

    /* === Шум === */
    .noise {
      position: relative;
    }
    .noise::before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 50;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
      opacity: 0.028;
      pointer-events: none;
    }

    /* === Reveal-анимация === */
    .anim-item {
      opacity: 0;
      transform: translateY(20px);
    }
    .active .anim-item {
      animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    .active .anim-item:nth-child(1) { animation-delay: 0.05s; }
    .active .anim-item:nth-child(2) { animation-delay: 0.18s; }
    .active .anim-item:nth-child(3) { animation-delay: 0.30s; }
    .active .anim-item:nth-child(4) { animation-delay: 0.44s; }
    .active .anim-item:nth-child(5) { animation-delay: 0.56s; }
    .active .anim-item:nth-child(6) { animation-delay: 0.68s; }

    @keyframes revealUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>
  <!-- Контент презентации -->
</body>
</html>
```

---

## 13. Чеклист для новой презентации

- [ ] Выбрана тема из таблицы §2.1 → подставлены переменные в `:root`
- [ ] Подключены оба шрифта (Diaria Pro + Inter) с нужными начертаниями
- [ ] Фон: `--bg-surface` (#05060A) или `--black` (#08090A)
- [ ] Заголовки: Diaria Pro 700, с акцентным словом через `<span class="accent">`
- [ ] Eyebrow: Inter 500, 10 px, tracking 0.4em, uppercase, accent color
- [ ] Subtitle: Inter 300, 15–19 px, line-height 1.55
- [ ] Разделитель: 1px gradient `accent → transparent`
- [ ] CTA: clip-path со скошенными углами, hover fill left→right
- [ ] Noise overlay на секции
- [ ] Hairline top/bottom на ключевых блоках
- [ ] Corner marks (L-уголки) если desktop
- [ ] Анимации: `revealUp` с каскадным stagger 0.12–0.18s
- [ ] Все transitions: `0.5s` для цветов
- [ ] Адаптив: stacked layout на mobile, скрытие декоративных элементов
- [ ] `prefers-reduced-motion`: fallback без анимаций
