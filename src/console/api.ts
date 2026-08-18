export type ReviewStatus = 'new' | 'review' | 'approved' | 'rejected' | 'stale' | 'missing'

export interface FileState {
  sizeBytes: number
  modifiedAt: string
  fingerprint?: string
  width?: number
  height?: number
  mimeType?: string
  colorSpace?: string
}

export interface CategoryAssignment {
  categoryId: string
  role: 'primary' | 'alternate' | 'slideshow' | 'reference-only' | 'rejected'
  sortOrder: number
  confirmedByUser?: boolean
}

export interface PhotoAsset {
  assetId: string
  relativePath: string
  origin: 'source' | 'generated' | 'unclassified'
  status: Exclude<ReviewStatus, 'missing'>
  detectedAt: string
  reviewedAt?: string
  fileState: FileState
  categories: CategoryAssignment[]
  audit?: { document?: string; heading?: string; summary?: string }
  shotSlotIds: string[]
  slideIds: string[]
  collectionIds: string[]
  generationRecordId?: string
  notes?: string
  extensions?: { suggestedCategories?: string[]; requiresUserConfirmation?: boolean; [key: string]: unknown }
}

export interface Photodesign {
  $schema?: string
  schemaVersion: '1.0'
  productId: string
  productFolder: string
  updatedAt: string
  assets: PhotoAsset[]
  collections: Array<Record<string, unknown>>
  extensions?: Record<string, unknown>
}

export interface ShotCategory {
  categoryId: string
  label: string
  enabled: boolean
  minimum: number
  ideal: number
  maximum?: number
  rationale?: string
}

export interface ShotSlot {
  shotId: string
  title: string
  categoryId: string
  required: boolean
  status: 'planned' | 'prompt_ready' | 'generating' | 'candidate_ready' | 'approved' | 'blocked'
  purpose: string
  desiredCount: number
  aspectRatios?: string[]
  assignedAssetIds: string[]
  recipeIds: string[]
  slideIds: string[]
  notes?: string
}

export interface ShotPlan {
  schemaVersion: '1.0'
  productId: string
  deckSlug: string
  status: string
  updatedAt: string
  categories: ShotCategory[]
  slots: ShotSlot[]
}

export interface PromptBlock {
  blockId: string
  scope: 'global' | 'product' | 'category' | 'shot' | 'negative' | 'engine'
  title: string
  version: number
  enabled: boolean
  language: 'en' | 'ru'
  content: string
  categoryIds?: string[]
  sourceRefs: string[]
  notes?: string
}

export interface PromptRecipe {
  recipeId: string
  shotId: string
  categoryId: string
  title: string
  status: 'draft' | 'ready' | 'stale' | 'retired'
  blockRefs: Array<{ blockId: string; version: number }>
  engineProfileId: string
  referenceAssetIds: string[]
  compiledPrompt: string
  compiledAt?: string
  updatedAt: string
  notes?: string
}

export interface PromptSystem {
  $schema?: string
  schemaVersion: '1.0'
  productId: string
  updatedAt: string
  blocks: PromptBlock[]
  engineProfiles: Array<{ engineProfileId: string; engine: string; model?: string; label: string; enabled: boolean; prefix?: string; suffix?: string; parameters: Record<string, unknown> }>
  recipes: PromptRecipe[]
  extensions?: Record<string, unknown>
}

export interface LogoAsset {
  assetId: string
  relativePath: string
  brandId: string
  status: ReviewStatus
  detectedAt: string
  reviewedAt?: string
  fileState: FileState
  format: string
  isVector?: boolean
  transparency?: 'yes' | 'no' | 'unknown'
  assetType: string
  layout: string
  colorway: string
  backgroundCompatibility: string[]
  usage: string[]
  transformPolicy: string
  description?: string
  notes?: string
  extensions?: Record<string, unknown>
}

export interface LogoBrand {
  brandId: string
  displayName: string
  kind: string
  aliases: string[]
  assetIds: string[]
  preferred?: Record<string, string>
  notes?: string
}

export interface LogoPlacement {
  placementId: string
  deckId: string
  slideId?: string
  assetId: string
  role: 'primary-brand' | 'manufacturer' | 'partner' | 'certification' | 'customer' | 'footer' | 'other'
  background: 'light' | 'dark' | 'photographic' | 'brand-color'
  output: 'web' | 'pdf' | 'print'
  transform: 'none' | 'recolor' | 'convert'
  status: 'draft' | 'approved' | 'rejected' | 'stale'
  notes?: string
}

export interface LogoCatalog {
  $schema?: string
  schemaVersion: '1.0'
  libraryId: string
  rootFolder: string
  updatedAt: string
  brands: LogoBrand[]
  assets: LogoAsset[]
  placements: LogoPlacement[]
  extensions?: Record<string, unknown>
}

export interface WorkspaceDocument {
  kind: string
  relativePath: string
  title: string
  content: string
}

export interface WorkspaceProduct {
  productId: string
  displayName: string
  productFolder: string
  photodesign: Photodesign
  documents: WorkspaceDocument[]
  shotPlan: ShotPlan | null
  promptSystem: PromptSystem | null
  generationHistory: GenerationRecord[]
  generationHistoryIssues: Array<{ line: number; message: string }>
  generationHistoryExists: boolean
}

export interface GenerationRecord {
  schemaVersion: '1.0'
  recordId: string
  productId: string
  recipeId: string
  shotId: string
  createdAt: string
  status: 'planned' | 'submitted' | 'completed' | 'partially-completed' | 'failed' | 'cancelled'
  engine: { name: string; model?: string; parameters: Record<string, unknown> }
  promptSnapshot: { text: string; negativeText?: string; blockVersions: Record<string, number>; referenceAssetIds: string[] }
  outputs: Array<{ assetId: string; relativePath: string; status: 'new' | 'linked' | 'approved' | 'rejected' | 'missing'; variant?: string }>
  notes?: string
  extensions?: Record<string, unknown>
}

export interface WorkspaceSnapshot {
  schemaVersion: '1.0'
  scannedAt: string
  products: WorkspaceProduct[]
  logoCatalog: LogoCatalog
}

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, { cache: 'no-store', ...init })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText })) as { error?: string }
    throw new Error(body.error ?? `Workspace request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

const postJson = async (url: string, value: unknown): Promise<void> => {
  await requestJson(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })
}

export const fetchWorkspace = (): Promise<WorkspaceSnapshot> => requestJson('/api/workspace')
export const saveLogoCatalog = (catalog: LogoCatalog): Promise<void> => postJson('/api/logo-catalog', catalog)
export const savePhotodesign = (productId: string, photodesign: Photodesign): Promise<void> => postJson(`/api/photodesign?product=${encodeURIComponent(productId)}`, photodesign)
export const savePromptSystem = (productId: string, promptSystem: PromptSystem): Promise<void> => postJson(`/api/prompt-system?product=${encodeURIComponent(productId)}`, promptSystem)
export const linkGenerationResult = (productId: string, record: GenerationRecord, photodesign: Photodesign): Promise<void> => postJson(`/api/link-generation?product=${encodeURIComponent(productId)}`, { record, photodesign })
export const assetUrl = (scope: 'logo' | 'photo', relativePath: string, productId?: string): string => {
  const parameters = new URLSearchParams({ scope, path: relativePath })
  if (productId) parameters.set('product', productId)
  return `/api/asset?${parameters}`
}
