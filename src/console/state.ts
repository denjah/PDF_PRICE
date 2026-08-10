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

const draftKey = 'wb-presentation-draft-v1'
const presetsKey = 'wb-presentation-presets-v1'

const parse = <T>(value: string | null, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export const readDraft = (): PresentationDraft | null => {
  try { return parse<PresentationDraft | null>(localStorage.getItem(draftKey), null) } catch { return null }
}

export const writeDraft = (draft: PresentationDraft): void => {
  try { localStorage.setItem(draftKey, JSON.stringify(draft)) } catch { /* browser storage may be disabled */ }
}

export const readPresets = (): PresentationPreset[] => {
  try { return parse<PresentationPreset[]>(localStorage.getItem(presetsKey), []) } catch { return [] }
}

export const writePresets = (presets: PresentationPreset[]): void => {
  try { localStorage.setItem(presetsKey, JSON.stringify(presets)) } catch { /* browser storage may be disabled */ }
}

export const savePreset = (name: string, draft: PresentationDraft): PresentationPreset => {
  const preset: PresentationPreset = {
    ...draft,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: name.trim() || 'Новый пресет',
    createdAt: new Date().toISOString(),
  }
  writePresets([...readPresets(), preset])
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
