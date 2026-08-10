import type { DeckDefinition, WbTheme, WbVariant } from '../deck/types'

const themes: WbTheme[] = ['home', 'sport', 'classic', 'club']
const variants: WbVariant[] = ['dark', 'light', 'accent']

const colorTokens = [
  '--wb-color-accent', '--wb-color-accent-2', '--wb-color-brand-deep', '--wb-color-brand-soft',
  '--wb-color-black', '--wb-color-white', '--wb-color-surface', '--wb-color-page',
  '--wb-color-title', '--wb-color-text', '--wb-color-text-muted', '--wb-color-text-strong', '--wb-color-hairline',
]

const tokenLabel = (token: string): string => token.replace('--wb-color-', '')

const renderSwatches = (): string => colorTokens.map((token) => `
  <article class="wb-token-swatch">
    <span class="wb-token-swatch__color" data-wb-swatch="${token}"></span>
    <span class="wb-token-swatch__name">${tokenLabel(token)}</span>
    <code data-wb-token-value="${token}"></code>
  </article>
`).join('')

export const mountConsole = (root: HTMLElement, deck: DeckDefinition): void => {
  const params = new URLSearchParams(window.location.search)
  const initialTheme = themes.includes(params.get('theme') as WbTheme) ? (params.get('theme') as WbTheme) : deck.theme
  const initialVariant = variants.includes(params.get('variant') as WbVariant) ? (params.get('variant') as WbVariant) : deck.variant

  document.documentElement.dataset.wbTheme = initialTheme
  document.documentElement.dataset.wbVariant = initialVariant
  document.title = `Preview console — ${deck.title}`
  root.innerHTML = `
    <main class="wb-console" aria-label="Preview console">
      <header class="wb-console__header"><a class="wb-console__brand" href="/">WEEKEND BILLIARD</a><span>DEV PREVIEW</span></header>
      <section class="wb-console__intro">
        <p class="wb-console__kicker">Theme inspector</p>
        <h1>${deck.title}</h1>
        <p>Выберите тему и вариант. Сетка ниже показывает фактические значения токенов из <code>tokens.css</code>.</p>
      </section>
      <section class="wb-console__controls" aria-label="Theme controls">
        <label>Theme<select data-wb-console-theme>${themes.map((theme) => `<option value="${theme}" ${theme === initialTheme ? 'selected' : ''}>${theme}</option>`).join('')}</select></label>
        <label>Variant<select data-wb-console-variant>${variants.map((variant) => `<option value="${variant}" ${variant === initialVariant ? 'selected' : ''}>${variant}</option>`).join('')}</select></label>
        <a class="wb-console__open" data-wb-open-deck href="/">Открыть презентацию</a>
      </section>
      <section class="wb-token-grid" aria-label="Color tokens">${renderSwatches()}</section>
    </main>
  `

  const themeSelect = root.querySelector<HTMLSelectElement>('[data-wb-console-theme]')
  const variantSelect = root.querySelector<HTMLSelectElement>('[data-wb-console-variant]')
  const openDeck = root.querySelector<HTMLAnchorElement>('[data-wb-open-deck]')
  const sync = (): void => {
    const theme = themeSelect?.value as WbTheme
    const variant = variantSelect?.value as WbVariant
    document.documentElement.dataset.wbTheme = theme
    document.documentElement.dataset.wbVariant = variant
    colorTokens.forEach((token) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
      const swatch = root.querySelector<HTMLElement>(`[data-wb-swatch="${token}"]`)
      const label = root.querySelector<HTMLElement>(`[data-wb-token-value="${token}"]`)
      if (swatch) swatch.style.background = value
      if (label) label.textContent = value
    })
    if (openDeck) openDeck.href = `/?theme=${encodeURIComponent(theme)}&variant=${encodeURIComponent(variant)}`
    window.history.replaceState({}, '', `/console/?theme=${encodeURIComponent(theme)}&variant=${encodeURIComponent(variant)}`)
  }
  themeSelect?.addEventListener('change', sync)
  variantSelect?.addEventListener('change', sync)
  sync()
}
