import { renderDeckSlide } from '../deck/render'
import type { DeckCatalogItem, DeckDefinition, WbTheme, WbVariant } from '../deck/types'
import { applyColors, applyPositions, clearColors, editableTokens, readDraft, readPresets, savePreset, type EditableToken, type Position, type PresentationDraft, writeDraft } from './state'

const themes: WbTheme[] = ['home', 'sport', 'classic', 'club']
const variants: WbVariant[] = ['dark', 'light', 'accent']
const movableSelector = ['.wb-brand-mark', '.wb-badge', '.wb-eyebrow', '.wb-title', '.wb-sub', '.wb-body', '.wb-params', '.wb-metrics', '.wb-features', '.wb-badge-row', '.wb-technology-logo', '.wb-macro-grid', '.wb-usp-media', '.wb-specs-wrap', '.wb-event-list', '.wb-certifications', '.wb-actions', '.wb-contacts', '.wb-brand-story', '.wb-championship-copy', '.wb-closing-copy'].join(', ')
const label = (token: EditableToken): string => token.replace('--wb-color-', '').replaceAll('-', ' ')
const resolved = (token: EditableToken): string => getComputedStyle(document.documentElement).getPropertyValue(token).trim()
const blankDraft = (deck: DeckDefinition): PresentationDraft => ({ theme: deck.theme, variant: deck.variant, colors: {}, positions: {} })

const tokenControls = (): string => editableTokens.map((token) => `<label class="wb-console-token"><input class="wb-console-token__picker" data-wb-token-picker="${token}" type="color" value="#b6894c" aria-label="Выбрать ${label(token)}" /><span class="wb-console-token__swatch" data-wb-token-swatch="${token}"></span><span>${label(token)}</span><input data-wb-token-input="${token}" type="text" spellcheck="false" /></label>`).join('')
const slides = (deck: DeckDefinition): string => deck.slides.filter((slide) => slide.enabled).map((slide, index) => `<article class="wb-console-card" data-wb-preview-card="${slide.id}"><header><span>${String(index + 1).padStart(2, '0')}</span><span>${slide.archetype}</span></header><div class="wb-console-stage"><div class="wb-console-canvas" data-wb-canvas="${slide.id}">${renderDeckSlide(slide, index)}</div></div></article>`).join('')

export const mountWorkspace = (root: HTMLElement, deck: DeckDefinition, catalog: DeckCatalogItem[]): void => {
  const stored = readDraft(deck.slug)
  const draft: PresentationDraft = stored ?? blankDraft(deck)
  draft.colors ??= {}
  draft.positions ??= {}
  draft.theme = themes.includes(draft.theme) ? draft.theme : deck.theme
  draft.variant = variants.includes(draft.variant) ? draft.variant : deck.variant
  document.documentElement.dataset.wbTheme = draft.theme
  document.documentElement.dataset.wbVariant = draft.variant
  document.documentElement.dataset.wbDeck = deck.slug
  clearColors()
  applyColors(draft.colors)
  document.title = `Console — ${deck.title}`
  const enabledSlideCount = deck.slides.filter((slide) => slide.enabled).length
  root.innerHTML = `<main class="wb-console" aria-label="Консоль презентации"><aside class="wb-console-panel"><header class="wb-console-panel__header"><a href="/?deck=${deck.slug}">WEEKEND BILLIARD</a><span>LIVE EDITOR</span></header><div class="wb-console-panel__section"><p class="wb-console-kicker">${deck.product.brand} · ${deck.product.model}</p><h1>Презентация<br />в работе</h1><p class="wb-console-help">Кликните объект на слайде, затем тяните его. Черновик и пресеты сохраняются отдельно для каждой презентации.</p></div><div class="wb-console-panel__section wb-console-controls"><label class="wb-console-controls__deck">Презентация<select data-wb-deck>${catalog.map((item) => `<option value="${item.slug}" ${item.slug === deck.slug ? 'selected' : ''}>${item.shortTitle}</option>`).join('')}</select></label><label>Theme<select data-wb-theme>${themes.map((theme) => `<option value="${theme}" ${theme === draft.theme ? 'selected' : ''}>${theme}</option>`).join('')}</select></label><label>Variant<select data-wb-variant>${variants.map((variant) => `<option value="${variant}" ${variant === draft.variant ? 'selected' : ''}>${variant}</option>`).join('')}</select></label></div><div class="wb-console-panel__section"><div class="wb-console-section-title"><span>Цвета</span><button type="button" data-wb-reset-colors>Сбросить</button></div><div class="wb-console-tokens">${tokenControls()}</div></div><div class="wb-console-panel__section"><div class="wb-console-section-title"><span>Пресеты этой презентации</span></div><div class="wb-console-save"><input data-wb-preset-name placeholder="Название версии" /><button type="button" data-wb-save-preset>Сохранить</button></div><div class="wb-console-presets" data-wb-presets></div></div><footer class="wb-console-panel__footer"><a data-wb-open-deck href="/?deck=${deck.slug}">Открыть презентацию ↗</a><span data-wb-selected-object>Выберите объект</span></footer></aside><section class="wb-console-board" aria-label="Слайды — предпросмотр"><div class="wb-console-board__top"><span>${enabledSlideCount} slides · scale to fit</span><span>2 × 2 board</span></div><div class="wb-console-grid">${slides(deck)}</div></section></main>`

  const deckSelect = root.querySelector<HTMLSelectElement>('[data-wb-deck]')
  const themeSelect = root.querySelector<HTMLSelectElement>('[data-wb-theme]')
  const variantSelect = root.querySelector<HTMLSelectElement>('[data-wb-variant]')
  const selected = root.querySelector<HTMLElement>('[data-wb-selected-object]')
  const openDeck = root.querySelector<HTMLAnchorElement>('[data-wb-open-deck]')
  const exportButton = document.createElement('button')
  exportButton.type = 'button'
  exportButton.className = 'wb-console-export'
  exportButton.textContent = deck.downloadPath ? 'Скачать PDF' : 'PDF будет после экспорта'
  exportButton.disabled = !deck.downloadPath
  root.querySelector<HTMLElement>('.wb-console-panel__footer')?.prepend(exportButton)
  const persist = (): void => writeDraft(deck.slug, draft)
  const syncTokens = (): void => editableTokens.forEach((token) => {
    const input = root.querySelector<HTMLInputElement>(`[data-wb-token-input="${token}"]`)
    const picker = root.querySelector<HTMLInputElement>(`[data-wb-token-picker="${token}"]`)
    const swatch = root.querySelector<HTMLElement>(`[data-wb-token-swatch="${token}"]`)
    const value = draft.colors[token] ?? resolved(token)
    if (input && document.activeElement !== input) input.value = value
    if (picker && /^#[0-9a-f]{6}$/i.test(value)) picker.value = value
    if (swatch) swatch.style.background = value
  })
  const syncTheme = (): void => {
    document.documentElement.dataset.wbTheme = draft.theme
    document.documentElement.dataset.wbVariant = draft.variant
    clearColors(); applyColors(draft.colors); syncTokens()
    if (openDeck) openDeck.href = `/?deck=${deck.slug}&theme=${draft.theme}&variant=${draft.variant}`
  }
  const renderPresetList = (): void => {
    const target = root.querySelector<HTMLElement>('[data-wb-presets]')
    if (!target) return
    const presets = readPresets(deck.slug)
    target.innerHTML = presets.length ? presets.map((preset) => `<button type="button" data-wb-load-preset="${preset.id}">${preset.name}</button>`).join('') : '<span>Сохранённых версий пока нет</span>'
    target.querySelectorAll<HTMLButtonElement>('[data-wb-load-preset]').forEach((button) => button.addEventListener('click', () => {
      const preset = readPresets(deck.slug).find((item) => item.id === button.dataset.wbLoadPreset)
      if (!preset) return
      draft.theme = preset.theme; draft.variant = preset.variant; draft.colors = { ...preset.colors }; draft.positions = { ...preset.positions }
      if (themeSelect) themeSelect.value = draft.theme
      if (variantSelect) variantSelect.value = draft.variant
      syncTheme(); applyPositions(root, draft.positions); persist()
    }))
  }
  const fit = (): void => root.querySelectorAll<HTMLElement>('.wb-console-stage').forEach((stage) => {
    const canvas = stage.querySelector<HTMLElement>('.wb-console-canvas')
    if (!canvas) return
    const box = stage.getBoundingClientRect()
    canvas.style.setProperty('--wb-console-scale', String(Math.max(0.05, Math.min(box.width / 1440, box.height / 810))))
  })
  root.querySelectorAll<HTMLElement>('[data-wb-canvas]').forEach((canvas) => {
    const id = canvas.dataset.wbCanvas ?? 'slide'
    canvas.querySelectorAll<HTMLElement>(movableSelector).forEach((element, index) => {
      const part = [...element.classList].find((item) => item.startsWith('wb-')) ?? 'object'
      element.dataset.wbObjectKey = `${id}:${part}:${index}`
      element.classList.add('wb-editable-object', 'wb-layout-object')
    })
  })
  let active: HTMLElement | null = null
  let start: { x: number; y: number; position: Position; scale: number } | null = null
  root.addEventListener('pointerdown', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-wb-object-key]')
    if (!target) return
    event.preventDefault(); event.stopPropagation(); active?.classList.remove('is-selected'); active = target; active.classList.add('is-selected')
    const key = active.dataset.wbObjectKey ?? ''
    const stage = active.closest<HTMLElement>('.wb-console-stage')
    const scale = Number(stage?.querySelector<HTMLElement>('.wb-console-canvas')?.style.getPropertyValue('--wb-console-scale')) || 1
    start = { x: event.clientX, y: event.clientY, position: draft.positions[key] ?? { x: 0, y: 0 }, scale }
    if (selected) selected.textContent = key.split(':').slice(1, -1).join(' · ')
    active.setPointerCapture(event.pointerId)
  })
  root.addEventListener('pointermove', (event) => {
    if (!active || !start) return
    const key = active.dataset.wbObjectKey ?? ''
    draft.positions[key] = { x: Math.round(start.position.x + (event.clientX - start.x) / start.scale), y: Math.round(start.position.y + (event.clientY - start.y) / start.scale) }
    applyPositions(root, draft.positions)
  })
  root.addEventListener('pointerup', () => { if (start) { start = null; persist() } })
  themeSelect?.addEventListener('change', () => { draft.theme = themeSelect.value as WbTheme; syncTheme(); persist() })
  variantSelect?.addEventListener('change', () => { draft.variant = variantSelect.value as WbVariant; syncTheme(); persist() })
  deckSelect?.addEventListener('change', () => {
    const params = new URLSearchParams(window.location.search)
    params.set('deck', deckSelect.value)
    params.delete('theme')
    params.delete('variant')
    window.location.assign(`${window.location.pathname}?${params.toString()}`)
  })
  editableTokens.forEach((token) => root.querySelector<HTMLInputElement>(`[data-wb-token-input="${token}"]`)?.addEventListener('input', (event) => {
    const value = (event.currentTarget as HTMLInputElement).value.trim()
    if (value) draft.colors[token] = value; else delete draft.colors[token]
    clearColors(); applyColors(draft.colors); syncTokens(); persist()
  }))
  editableTokens.forEach((token) => root.querySelector<HTMLInputElement>(`[data-wb-token-picker="${token}"]`)?.addEventListener('input', (event) => {
    const textInput = root.querySelector<HTMLInputElement>(`[data-wb-token-input="${token}"]`)
    if (!textInput) return
    textInput.value = (event.currentTarget as HTMLInputElement).value
    textInput.dispatchEvent(new Event('input', { bubbles: true }))
  }))
  root.querySelector<HTMLButtonElement>('[data-wb-reset-colors]')?.addEventListener('click', () => { draft.colors = {}; syncTheme(); persist() })
  root.querySelector<HTMLButtonElement>('[data-wb-save-preset]')?.addEventListener('click', () => {
    const input = root.querySelector<HTMLInputElement>('[data-wb-preset-name]')
    savePreset(deck.slug, input?.value ?? '', draft); if (input) input.value = ''; renderPresetList()
  })
  exportButton.addEventListener('click', () => {
    if (!deck.downloadPath) return
    const link = document.createElement('a')
    link.href = deck.downloadPath
    link.download = deck.downloadPath.split('/').at(-1) ?? `${deck.slug}.pdf`
    link.click()
  })
  applyPositions(root, draft.positions); syncTheme(); renderPresetList(); new ResizeObserver(fit).observe(root); requestAnimationFrame(fit)
}
