export type WbTheme = 'home' | 'sport' | 'classic' | 'club'

export type WbVariant = 'dark' | 'light' | 'accent'

export type SlideArchetype =
  | 'cover-weekend'
  | 'distributor'
  | 'brand-image'
  | 'product-hero'
  | 'usp'
  | 'engineering'
  | 'specs'
  | 'championships'
  | 'sport-gallery'
  | 'closing-cta'

export type AssetKind = 'image' | 'logo'

export type AssetRole =
  | 'hero'
  | 'background'
  | 'detail'
  | 'macro'
  | 'support'
  | 'brand'
  | 'certification'

export interface SourceRef {
  id: string
  label: string
  path: string
  kind: 'brief' | 'copy' | 'visual-catalog' | 'brand-guide' | 'design-system'
}

export interface AssetRef {
  id: string
  kind: AssetKind
  role: AssetRole
  src: string
  sourcePath: string
  alt: string
  focalPoint?: string
}

export interface SlideCopy {
  eyebrow?: string
  title: string
  titleAccent?: string
  subtitle?: string
  body?: string
}

export interface Metric {
  value: string
  label: string
}

export interface Parameter {
  label: string
  value: string
}

export interface Feature {
  title: string
  body: string
}

export interface Badge {
  label: string
  asset?: AssetRef
}

export interface DeckContact {
  type: 'phone' | 'email' | 'website'
  label: string
  value: string
  href: string
}

export interface DeckAction {
  label: string
  href: string
  kind: 'primary' | 'secondary'
}

export interface SpecOption {
  id: string
  label: string
}

export interface SpecRow {
  label: string
  values: Record<string, string | number | null>
  note?: string
}

interface BaseSlide<A extends SlideArchetype> {
  id: string
  archetype: A
  mandatory: boolean
  enabled: boolean
  narrativeJob: string
  sourceIds: string[]
  copy: SlideCopy
  media: AssetRef[]
  visualBrief?: string
  theme?: WbTheme
  variant?: WbVariant
}

export interface CoverSlide extends BaseSlide<'cover-weekend'> {
  badge: string
  ghostLabel?: string
  params: Parameter[]
}

export interface DistributorSlide extends BaseSlide<'distributor'> {
  metrics: Metric[]
  features: Feature[]
}

export interface BrandImageSlide extends BaseSlide<'brand-image'> {
  metrics: Metric[]
}

export interface ProductHeroSlide extends BaseSlide<'product-hero'> {
  params: Parameter[]
}

export interface UspSlide extends BaseSlide<'usp'> {
  uspId:
    | 'v-leg'
    | 'adamath-wood'
    | 'klematch-p59'
    | 'level-box-plus'
    | 'mirror-finish'
    | 'precision-play'
    | 'commercial-ready'
  features: Feature[]
  badges?: Badge[]
}

export interface EngineeringSlide extends BaseSlide<'engineering'> {
  features: Feature[]
}

export interface SpecsSlide extends BaseSlide<'specs'> {
  options: SpecOption[]
  rows: SpecRow[]
}

export interface ChampionshipsSlide extends BaseSlide<'championships'> {
  badges: Badge[]
  events: string[]
}

export interface SportGallerySlide extends BaseSlide<'sport-gallery'> {}

export interface ClosingSlide extends BaseSlide<'closing-cta'> {
  features: Feature[]
  actions: DeckAction[]
  contacts: DeckContact[]
}

export type DeckSlide =
  | CoverSlide
  | DistributorSlide
  | BrandImageSlide
  | ProductHeroSlide
  | UspSlide
  | EngineeringSlide
  | SpecsSlide
  | ChampionshipsSlide
  | SportGallerySlide
  | ClosingSlide

export interface ProductIdentity {
  brand: string
  model: string
  edition: string
  game: string
  sizesFt: number[]
  articles: Record<string, string | null>
  manufacturer: string
  distributor: string
  price: number | null
}

export interface DeckNarrative {
  audience: string
  communicationJob: string
  centralTakeaway: string
}

export interface DeckDefinition {
  schemaVersion: '1.0'
  slug: string
  locale: 'ru-RU'
  title: string
  theme: WbTheme
  variant: WbVariant
  materialsRoot: string
  assetRoot: string
  downloadPath?: string
  product: ProductIdentity
  narrative: DeckNarrative
  sources: SourceRef[]
  slides: DeckSlide[]
}

export interface DeckCatalogItem {
  slug: string
  productId: string
  title: string
  shortTitle: string
  deck: DeckDefinition
}
