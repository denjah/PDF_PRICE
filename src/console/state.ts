import type { WbTheme, WbVariant } from '../deck/types'

export const editableTokens = [
  '--wb-color-accent',
  '--wb-color-accent-2',
  '--wb-color-brand-deep',
  '--wb-color-brand-soft',
  '--wb-color-black',
  '--wb-color-white',
  '--wb-color-surface',
  '--wb-color-page',
  '--wb-color-title',
  '--wb-color-text',
  '--wb-color-text-muted',
  '--wb-color-text-strong',
  '--wb-color-hairline',
] as const

export type EditableToken = (typeof editableTokens)[number]
export type Position = { x: number; y: number }

export interface PresentationDraft {
  theme: WbTheme
  variant: WbVariant
  colors: Partial<Record<EditableToken, string>>
  positions: Record<string, Position>
}

export interface PresentationPreset extends PresentationDraft {
  id: string
  name: string
  createdAt: string
}

const legacyDraftKey = 'wb-presentation-draft-v1'
const legacyPresetsKey = 'wb-presentation-presets-v1'
const draftKey = (deckSlug: string): string => `wb-presentation-draft-v2:${deckSlug}`
const presetsKey = (deckSlug: string): string => `wb-presentation-presets-v2:${deckSlug}`

const parse = <T>(value: string | null, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export const readDraft = (deckSlug: string): PresentationDraft | null => {
  try {
    const stored = localStorage.getItem(draftKey(deckSlug))
    if (stored) return parse<PresentationDraft | null>(stored, null)
    return deckSlug === 'rasson-victory-ii-plus-white'
      ? parse<PresentationDraft | null>(localStorage.getItem(legacyDraftKey), null)
      : null
  } catch { return null }
}

export const writeDraft = (deckSlug: string, draft: PresentationDraft): void => {
  try { localStorage.setItem(draftKey(deckSlug), JSON.stringify(draft)) } catch { /* browser storage may be disabled */ }
}

export const readPresets = (deckSlug: string): PresentationPreset[] => {
  try {
    const stored = localStorage.getItem(presetsKey(deckSlug))
    if (stored) return parse<PresentationPreset[]>(stored, [])
    return deckSlug === 'rasson-victory-ii-plus-white'
      ? parse<PresentationPreset[]>(localStorage.getItem(legacyPresetsKey), [])
      : []
  } catch { return [] }
}

export const writePresets = (deckSlug: string, presets: PresentationPreset[]): void => {
  try { localStorage.setItem(presetsKey(deckSlug), JSON.stringify(presets)) } catch { /* browser storage may be disabled */ }
}

export const savePreset = (deckSlug: string, name: string, draft: PresentationDraft): PresentationPreset => {
  const preset: PresentationPreset = {
    ...draft,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim() || 'Новый пресет',
    createdAt: new Date().toISOString(),
  }
  writePresets(deckSlug, [...readPresets(deckSlug), preset])
  return preset
}

export const applyColors = (colors: PresentationDraft['colors']): void => {
  Object.entries(colors).forEach(([token, value]) => {
    document.documentElement.style.setProperty(token, value)
  })
}

export const clearColors = (): void => {
  editableTokens.forEach((token) => document.documentElement.style.removeProperty(token))
}

export const applyPositions = (root: ParentNode, positions: Record<string, Position>): void => {
  root.querySelectorAll<HTMLElement>('[data-wb-object-key]').forEach((element) => {
    const position = positions[element.dataset.wbObjectKey ?? '']
    element.style.setProperty('--wb-console-offset-x', `${position?.x ?? 0}px`)
    element.style.setProperty('--wb-console-offset-y', `${position?.y ?? 0}px`)
  })
}
