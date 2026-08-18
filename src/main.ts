import './styles/tokens.css'
import './styles/deck.css'
import './styles/components.css'
import './styles/console.css'
import './styles/workspace-v2.css'

import { applyColors, applyPositions, clearColors, readDraft } from './console/state'
import { mountWorkspace } from './console/workspace-v2'
import { deckCatalog, resolveDeck } from './deck/catalog'
import { mountDeck } from './deck/render'
import type { DeckDefinition, WbTheme, WbVariant } from './deck/types'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root was not found')
}

const preloadImage = (src: string): Promise<void> => new Promise((resolve) => {
  const image = new Image()
  let settled = false
  const finish = () => {
    if (settled) return
    settled = true
    resolve()
  }
  image.onload = () => {
    image.decode().catch(() => undefined).finally(finish)
  }
  image.onerror = finish
  image.src = src
  if (image.complete) image.onload?.(new Event('load'))
})

const mountDeckLoader = (target: HTMLElement, total: number) => {
  target.innerHTML = `
    <main class="wb-deck-loader" role="status" aria-live="polite">
      <span class="wb-deck-loader__brand">WEEKEND BILLIARD</span>
      <div class="wb-deck-loader__copy">
        <strong>Готовим презентацию</strong>
        <span>Загружаем фотографии и шрифты</span>
      </div>
      <div class="wb-deck-loader__track" aria-hidden="true"><i></i></div>
      <span class="wb-deck-loader__count">0 / ${total}</span>
    </main>
  `
  const bar = target.querySelector<HTMLElement>('.wb-deck-loader__track i')
  const count = target.querySelector<HTMLElement>('.wb-deck-loader__count')
  let complete = 0
  return () => {
    complete += 1
    if (bar) bar.style.setProperty('--wb-loader-progress', String(complete / total))
    if (count) count.textContent = `${complete} / ${total}`
  }
}

const preloadDeck = async (target: HTMLElement, deck: DeckDefinition): Promise<void> => {
  const sources = [...new Set(deck.slides
    .filter((slide) => slide.enabled)
    .flatMap((slide) => slide.media.map((asset) => asset.src)))]
  const markLoaded = mountDeckLoader(target, sources.length)
  const fontsReady = 'fonts' in document ? document.fonts.ready : Promise.resolve()
  await Promise.all([
    fontsReady,
    Promise.all(sources.map(async (src) => {
      await preloadImage(src)
      markLoaded()
    })),
  ])
}

try {
  const params = new URLSearchParams(window.location.search)
  const selectedDeck = resolveDeck(params.get('deck'))
  const deck = selectedDeck.deck
  const isPdfRender = params.get('pdf') === '1'
  const pdfSlideId = params.get('slide')
  const themes: WbTheme[] = ['home', 'sport', 'classic', 'club']
  const variants: WbVariant[] = ['dark', 'light', 'accent']
  const savedDraft = readDraft(deck.slug)
  const theme = params.get('theme') as WbTheme
  const variant = params.get('variant') as WbVariant
  const previewDeck: DeckDefinition = {
    ...deck,
    theme: themes.includes(theme) ? theme : savedDraft?.theme ?? deck.theme,
    variant: variants.includes(variant) ? variant : savedDraft?.variant ?? deck.variant,
  }

  document.documentElement.dataset.wbDeck = deck.slug
  document.documentElement.dataset.wbTheme = previewDeck.theme
  document.documentElement.dataset.wbVariant = previewDeck.variant
  if (window.location.pathname.replace(/\/+$/, '') === '/console') {
    document.body.classList.add('wb-console-page')
    mountWorkspace(app, previewDeck, deckCatalog)
  } else {
    document.body.classList.remove('wb-console-page')
    document.body.classList.toggle('wb-pdf-render', isPdfRender)
    document.body.classList.toggle('wb-pdf-slide', Boolean(pdfSlideId))
    if (pdfSlideId) document.body.dataset.wbPdfSlide = pdfSlideId
    if (!isPdfRender) await preloadDeck(app, previewDeck)
    mountDeck(app, previewDeck)
    if (pdfSlideId) {
      app.querySelectorAll<HTMLElement>('.wb-slide').forEach((slide) => {
        slide.hidden = slide.dataset.wbSlide !== pdfSlideId
      })
    }
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
  }
} catch (error) {
  console.error(error)
  app.innerHTML = '<main class="wb-app-error"><h1>Не удалось открыть презентацию</h1><p>Параметр deck не зарегистрирован или данные презентации повреждены. Вернитесь в Console и выберите доступную презентацию.</p></main>'
}

