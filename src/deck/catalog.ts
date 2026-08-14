import garlandoImageData from '../../content/decks/garlando-image/deck.json'
import rassonVictoryData from '../../content/decks/rasson-victory-ii-plus-white/deck.json'
import type { DeckCatalogItem, DeckDefinition } from './types'

export const deckCatalog: DeckCatalogItem[] = [
  {
    slug: 'rasson-victory-ii-plus-white',
    title: 'RASSON Victory II Plus White',
    shortTitle: 'RASSON Victory II+',
    deck: rassonVictoryData as DeckDefinition,
  },
  {
    slug: 'garlando-image',
    title: 'GARLANDO Image',
    shortTitle: 'GARLANDO Image',
    deck: garlandoImageData as DeckDefinition,
  },
]

export const defaultDeck = deckCatalog[0]

export const resolveDeck = (slug: string | null): DeckCatalogItem =>
  deckCatalog.find((item) => item.slug === slug) ?? defaultDeck
