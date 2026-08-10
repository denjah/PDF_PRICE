import './styles/tokens.css'
import './styles/deck.css'
import './styles/components.css'
import './styles/console.css'

import deckData from '../content/decks/rasson-victory-ii-plus-white/deck.json'
import { applyColors, applyPositions, clearColors, readDraft } from './console/state'
import { mountWorkspace } from './console/workspace'
import { mountDeck } from './deck/render'
import type { DeckDefinition, WbTheme, WbVariant } from './deck/types'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found')
}

const deck = deckData as DeckDefinition
const params = new URLSearchParams(window.location.search)
const themes: WbTheme[] = ['home', 'sport', 'classic', 'club']
const variants: WbVariant[] = ['dark', 'light', 'accent']
const savedDraft = readDraft()
const theme = params.get('theme') as WbTheme
const variant = params.get('variant') as WbVariant
const previewDeck: DeckDefinition = {
  ...deck,
  theme: themes.includes(theme) ? theme : savedDraft?.theme ?? deck.theme,
  variant: variants.includes(variant) ? variant : savedDraft?.variant ?? deck.variant,
}

try {
  if (window.location.pathname.replace(/\/+$/, '') === '/console') {
    document.body.classList.add('wb-console-page')
    mountWorkspace(app, previewDeck)
  } else {
    document.body.classList.remove('wb-console-page')
    mountDeck(app, previewDeck)
    if (savedDraft) {
      clearColors()
      applyColors(savedDraft.colors)
      const movable = '.wb-brand-mark, .wb-badge, .wb-eyebrow, .wb-title, .wb-sub, .wb-body, .wb-params, .wb-metrics, .wb-features, .wb-badge-row, .wb-technology-logo, .wb-macro-grid, .wb-usp-media, .wb-specs-wrap, .wb-event-list, .wb-certifications, .wb-actions, .wb-contacts, .wb-brand-story, .wb-championship-copy, .wb-closing-copy'
      app.querySelectorAll<HTMLElement>('.wb-slide').forEach((slide) => {
        const slideId = slide.id
        slide.querySelectorAll<HTMLElement>(movable).forEach((element, index) => {
          const part = [...element.classList].find((item) => item.startsWith('wb-')) ?? 'object'
          element.dataset.wbObjectKey = `${slideId}:${part}:${index}`
          element.classList.add('wb-layout-object')
        })
      })
      applyPositions(app, savedDraft.positions)
    }
    if (params.get('print') === '1') {
      document.body.classList.add('wb-print-mode')
      window.setTimeout(() => window.print(), 600)
    }
  }
} catch (error) {
  console.error(error)
  app.innerHTML = `<main class="wb-app-error"><h1>Не удалось открыть презентацию</h1><p>Перезапустите <code>npm run dev</code>. Детали ошибки доступны в консоли браузера.</p></main>`
}

