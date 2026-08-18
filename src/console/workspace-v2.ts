import { renderDeckSlide } from '../deck/render'
import type { DeckCatalogItem, DeckDefinition, WbTheme, WbVariant } from '../deck/types'
import {
  applyColors, clearColors, editableTokens, readDraft, readPresets, savePreset,
  type EditableToken, type PresentationDraft, writeDraft,
} from './state'
import {
  assetUrl, fetchWorkspace, linkGenerationResult, saveLogoCatalog, savePhotodesign, savePromptSystem,
  type GenerationRecord, type LogoAsset, type LogoPlacement, type PhotoAsset, type PromptBlock, type PromptRecipe,
  type WorkspaceProduct, type WorkspaceSnapshot,
} from './api'

type Section = 'overview' | 'slides' | 'photodesign' | 'logos' | 'marketing' | 'theme' | 'export'
type PhotoTab = 'library' | 'coverage' | 'prompts' | 'history'
type LogoTab = 'assets' | 'variants' | 'placements'
type MarketingTab = 'flow' | 'classic' | 'documents'

const themes: WbTheme[] = ['home', 'sport', 'classic', 'club']
const variants: WbVariant[] = ['dark', 'light', 'accent']
const sections: Array<{ id: Section; label: string }> = [
  { id: 'overview', label: 'Overview' }, { id: 'slides', label: 'Slides' },
  { id: 'photodesign', label: 'Photodesign' }, { id: 'logos', label: 'Logo Library' },
  { id: 'marketing', label: 'Marketing' }, { id: 'theme', label: 'Theme' },
  { id: 'export', label: 'Export / QA' },
]
const photoTabs: Array<{ id: PhotoTab; label: string }> = [
  { id: 'library', label: 'Library' }, { id: 'coverage', label: 'Coverage' },
  { id: 'prompts', label: 'Prompt Builder' }, { id: 'history', label: 'History' },
]
const logoTabs: Array<{ id: LogoTab; label: string }> = [
  { id: 'assets', label: 'Assets' }, { id: 'variants', label: 'Brands / Variants' },
  { id: 'placements', label: 'Placements' },
]
const marketingTabs: Array<{ id: MarketingTab; label: string }> = [
  { id: 'flow', label: 'Prompt Flow' }, { id: 'classic', label: 'Classic Builder' },
  { id: 'documents', label: 'Documents' },
]
const photoCategories = [
  ['hero-cover', 'Hero'], ['studio-white', 'Studio white'], ['studio-dark', 'Studio dark'],
  ['interior', 'Interior'], ['in-use', 'In use'], ['lifestyle', 'Lifestyle'],
  ['detail-macro', 'Detail / macro'], ['technical', 'Technical'], ['scale-options', 'Scale / options'],
  ['packaging-installation', 'Packaging'], ['brand-editorial', 'Editorial'],
  ['tournament-certification', 'Tournament'], ['service-commercial', 'Commercial CTA'],
] as const

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
}[character] ?? character))
const formatDate = (value?: string): string => value
  ? new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
  : '—'
const formatBytes = (value: number): string => value >= 1_000_000
  ? `${(value / 1_000_000).toFixed(1)} MB`
  : `${Math.max(1, Math.round(value / 1000))} KB`
const statusLabel = (status: string): string => ({
  new: 'Новый', review: 'На проверке', approved: 'Утверждён', rejected: 'Отклонён', stale: 'Изменён', missing: 'Отсутствует',
  ready: 'Готов', draft: 'Черновик', planned: 'Запланирован', prompt_ready: 'Промпт готов',
  generating: 'Генерация', candidate_ready: 'Есть кандидат', blocked: 'Заблокирован', released: 'Выпущен',
  review_required: 'Нужна проверка', not_started: 'Не начат',
}[status] ?? status)

const icon = (name: Section | 'refresh' | 'open' | 'copy' | 'close' | 'save' | 'link'): string => {
  const paths: Record<string, string> = {
    overview: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    slides: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 9h8M8 13h5"/>',
    photodesign: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 17 5-4 3 2 3-3 5 5"/>',
    logos: '<path d="M12 3 4 7v10l8 4 8-4V7z"/><path d="m8 15 4-8 4 8M9.5 12h5"/>',
    marketing: '<path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>',
    theme: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>',
    export: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/>',
    refresh: '<path d="M20 6v5h-5M4 18v-5h5"/><path d="M18 9a7 7 0 0 0-12-2L4 11M6 15a7 7 0 0 0 12 2l2-4"/>',
    open: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    save: '<path d="M5 4h12l2 2v14H5zM8 4v6h8V4M8 20v-6h8v6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/>',
  }
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`
}

const inlineMarkdown = (value: string): string => escapeHtml(value)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span class="wb-doc-link">$1</span>')

const markdownToHtml = (source: string): string => {
  const lines = source.replace(/\r/g, '').split('\n')
  const result: string[] = []
  let inCode = false
  let inList = false
  const closeList = (): void => { if (inList) { result.push('</ul>'); inList = false } }
  lines.forEach((line) => {
    if (line.startsWith('```')) { closeList(); result.push(inCode ? '</code></pre>' : '<pre><code>'); inCode = !inCode; return }
    if (inCode) { result.push(`${escapeHtml(line)}\n`); return }
    if (!line.trim()) { closeList(); return }
    const heading = line.match(/^(#{1,4})\s+(.+)/)
    if (heading) { closeList(); const level = Math.min(4, heading[1].length + 1); result.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); return }
    if (/^[-*]\s+/.test(line)) { if (!inList) { result.push('<ul>'); inList = true }; result.push(`<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`); return }
    if (line.startsWith('> ')) { closeList(); result.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`); return }
    if (/^\|.+\|$/.test(line)) { closeList(); result.push(`<div class="wb-doc-table-line">${inlineMarkdown(line)}</div>`); return }
    closeList(); result.push(`<p>${inlineMarkdown(line)}</p>`)
  })
  closeList()
  return result.join('')
}

const statusBadge = (status: string): string => `<span class="wb-status" data-status="${escapeHtml(status)}">${escapeHtml(statusLabel(status))}</span>`
const promptScopeLabel = (scope: PromptBlock['scope']): string => ({
  product: 'Product Core', category: 'Category / Light', shot: 'Shot Brief', global: 'Quality',
  negative: 'Negative', engine: 'Engine',
}[scope])
const previewableLogo = (asset: LogoAsset): boolean => ['svg', 'png', 'jpg', 'jpeg'].includes(asset.format)
const previewablePhoto = (asset: PhotoAsset): boolean => ['png','jpg','jpeg','webp'].includes(asset.relativePath.split('.').at(-1)?.toLowerCase() ?? '')

export const mountWorkspace = (root: HTMLElement, deck: DeckDefinition, catalog: DeckCatalogItem[]): void => {
  const url = new URL(window.location.href)
  const activeCatalogItem = catalog.find((item) => item.slug === deck.slug)
  if (!activeCatalogItem) throw new Error(`Presentation ${deck.slug} is not registered in the workspace catalog`)
  let activeSection = (sections.some((item) => item.id === url.searchParams.get('section')) ? url.searchParams.get('section') : 'overview') as Section
  let photoTab: PhotoTab = 'library'
  let logoTab: LogoTab = 'assets'
  let marketingTab: MarketingTab = 'flow'
  let snapshot: WorkspaceSnapshot | null = null
  let selectedProductId = activeCatalogItem.productId
  let selectedPhotoId = ''
  let selectedLogoId = ''
  let selectedRecipeId = ''
  let selectedFlowBlockId = ''
  let selectedDocumentKind = ''
  let historyPhotoId = ''
  let historyRecipeId = ''
  let photoStatusFilter = 'all'
  let photoCategoryFilter = 'all'
  let logoBrandFilter = 'all'
  let logoStatusFilter = 'all'
  let logoBackgroundFilter = 'all'
  let logoTone: 'light' | 'dark' = 'light'
  let message = ''
  let saving = false
  let loading = true
  let error = ''
  let lastSignature = ''
  let flowDirty = false
  const pendingBlockEdits = new Map<string, string>()
  const storedDraft = readDraft(deck.slug)
  const themeDraft: PresentationDraft = storedDraft ?? { theme: deck.theme, variant: deck.variant, colors: {}, positions: {} }
  themeDraft.colors ??= {}
  themeDraft.positions ??= {}

  const currentProduct = (): WorkspaceProduct | null => snapshot?.products.find((item) => item.productId === selectedProductId) ?? null
  const selectedPhoto = (): PhotoAsset | null => currentProduct()?.photodesign.assets.find((item) => item.assetId === selectedPhotoId) ?? null
  const selectedLogo = (): LogoAsset | null => snapshot?.logoCatalog.assets.find((item) => item.assetId === selectedLogoId) ?? null
  const selectedRecipe = (): PromptRecipe | null => currentProduct()?.promptSystem?.recipes.find((item) => item.recipeId === selectedRecipeId) ?? null
  const placementIsCompatible = (placement: LogoPlacement, asset?: LogoAsset): boolean => {
    if (!asset || asset.status !== 'approved') return false
    if (!asset.backgroundCompatibility.some((item) => item === placement.background || item === 'any')) return false
    if (!asset.usage.includes(placement.output)) return false
    if (placement.transform === 'recolor' && asset.transformPolicy !== 'recolor-approved') return false
    if (placement.transform === 'convert' && !['convert-only','recolor-approved'].includes(asset.transformPolicy)) return false
    if (placement.role === 'certification' && !['certification','badge'].includes(asset.assetType)) return false
    if (['primary-brand','manufacturer'].includes(placement.role) && asset.assetType === 'certification') return false
    return true
  }

  const resetWorkspaceScroll = (): void => {
    requestAnimationFrame(() => {
      const content = root.querySelector<HTMLElement>('.wb-app-content')
      if (content) content.scrollTop = 0
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
  }

  const flowScrollBehavior = (): ScrollBehavior => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  const snapshotSignature = (value: WorkspaceSnapshot): string => JSON.stringify({
    logos: { brands: value.logoCatalog.brands, assets: value.logoCatalog.assets, placements: value.logoCatalog.placements },
    products: value.products.map((product) => ({
      productId: product.productId,
      assets: product.photodesign.assets,
      extensions: product.photodesign.extensions,
      documents: product.documents.map((document) => [document.kind, document.content]),
      shotPlan: product.shotPlan,
      promptSystem: product.promptSystem,
      generationHistory: product.generationHistory,
    })),
  })

  const persist = async (action: () => Promise<void>, success: string, rollback?: () => void): Promise<boolean> => {
    if (saving) return false
    saving = true; root.querySelector('.wb-console-shell')?.setAttribute('aria-busy', 'true')
    try { await action(); syncMessage(success); return true }
    catch (cause) { rollback?.(); render(); syncMessage(`Ошибка сохранения: ${cause instanceof Error ? cause.message : 'неизвестная ошибка'}`); return false }
    finally { saving = false; root.querySelector('.wb-console-shell')?.removeAttribute('aria-busy') }
  }

  const setLocation = (): void => {
    const next = new URL(window.location.href)
    next.pathname = '/console'
    next.searchParams.set('deck', deck.slug)
    next.searchParams.set('section', activeSection)
    if (selectedProductId) next.searchParams.set('product', selectedProductId)
    window.history.replaceState({}, '', next)
  }

  const setTheme = (): void => {
    document.documentElement.dataset.wbTheme = themeDraft.theme
    document.documentElement.dataset.wbVariant = themeDraft.variant
    clearColors(); applyColors(themeDraft.colors)
  }

  const syncMessage = (text: string): void => {
    message = text
    const target = root.querySelector<HTMLElement>('[data-toast]')
    if (target) { target.textContent = text; target.hidden = !text }
    if (text) window.setTimeout(() => { message = ''; if (target) target.hidden = true }, 3200)
  }

  const guardFlowTransition = (): boolean => {
    if (!flowDirty) return false
    syncMessage('Есть несохранённые изменения Prompt Flow. Сохраните их или нажмите «Сбросить».')
    root.querySelector<HTMLButtonElement>('[data-discard-flow]')?.focus()
    return true
  }

  const renderLoading = (): string => `<section class="wb-console-state" aria-live="polite"><span class="wb-console-spinner"></span><h1>Сканирую рабочее пространство</h1><p>Фотографии, логотипы и канонические документы остаются на месте.</p></section>`
  const renderError = (): string => `<section class="wb-console-state is-error"><h1>Консоль не получила локальные данные</h1><p>${escapeHtml(error)}</p><button class="wb-button" type="button" data-refresh>${icon('refresh')}Повторить</button></section>`

  const renderOverview = (product: WorkspaceProduct): string => {
    const photos = product.photodesign.assets
    const logos = snapshot?.logoCatalog.assets ?? []
    const gates = (product.photodesign.extensions?.qualityGates ?? {}) as Record<string, boolean>
    const stages = [
      ['Source inventory', gates.sourceInventory ? 'approved' : photos.length > 0 ? 'review_required' : 'blocked', `${photos.length} изображений зарегистрировано; подтверждение ручное`],
      ['Photo audit', product.documents.some((document) => document.kind === 'photo-audit') ? 'review_required' : 'not_started', 'Пофайловый аудит доступен только для чтения'],
      ['Visual DNA', product.documents.some((document) => document.kind === 'specification') ? 'review_required' : 'not_started', 'Техническая спецификация найдена'],
      ['Shot plan', product.shotPlan?.status ?? 'not_started', product.shotPlan ? `${product.shotPlan.slots.length} слотов` : 'План кадров отсутствует'],
      ['Prompt design', product.promptSystem ? 'review_required' : 'not_started', product.promptSystem ? `${product.promptSystem.recipes.length} рецептов` : 'Prompt system отсутствует'],
      ['Deck assembly', deck.slides.length ? 'review_required' : 'not_started', `${deck.slides.filter((slide) => slide.enabled).length} включённых слайдов`],
      ['Release', deck.downloadPath ? 'review_required' : 'blocked', deck.downloadPath ? 'PDF существует, нужен visual QA' : 'PDF не экспортирован'],
    ]
    const queue = [
      { label: 'Новые фотографии', value: photos.filter((asset) => asset.status === 'new').length, action: 'photodesign' as Section },
      { label: 'Фото на проверке', value: photos.filter((asset) => asset.status === 'review').length, action: 'photodesign' as Section },
      { label: 'Логотипы на проверке', value: logos.filter((asset) => asset.status === 'review').length, action: 'logos' as Section },
      { label: 'Готовые промпты', value: product.promptSystem?.recipes.filter((recipe) => recipe.status === 'ready').length ?? 0, action: 'marketing' as Section },
    ]
    return `<section class="wb-workspace-view wb-overview"><header class="wb-view-header"><div><h1>${escapeHtml(product.displayName)} — рабочая картина</h1><p>Фактическое состояние материалов, без автоматического утверждения.</p></div><a class="wb-button is-primary" href="/?deck=${encodeURIComponent(deck.slug)}" target="_blank">${icon('open')}Открыть презентацию</a></header><div class="wb-overview-layout"><section class="wb-stage-list" aria-label="Pipeline status"><header><h2>Presentation pipeline</h2><span>${stages.filter((stage) => stage[1] === 'approved').length}/${stages.length} gates</span></header>${stages.map(([label, status, proof]) => `<div class="wb-stage-row"><span class="wb-stage-dot" data-status="${status}"></span><div><strong>${escapeHtml(label)}</strong><small>${escapeHtml(proof)}</small></div>${statusBadge(status)}</div>`).join('')}</section><section class="wb-queue"><header><h2>Очередь внимания</h2><span>требует решения</span></header>${queue.map((item) => `<button type="button" data-section="${item.action}"><strong>${item.value}</strong><span>${escapeHtml(item.label)}</span><small>Перейти →</small></button>`).join('')}<div class="wb-queue-note"><strong>Главный следующий шаг</strong><p>Проверить новые изображения, затем подтвердить подходящие логотипы и назначения по слайдам.</p></div></section></div></section>`
  }

  const renderSlides = (): string => {
    const enabled = deck.slides.filter((slide) => slide.enabled)
    return `<section class="wb-workspace-view"><header class="wb-view-header"><div><h1>Slides</h1><p>${enabled.length} включённых слайдов · порядок задаётся deck.json</p></div><a class="wb-button is-primary" href="/?deck=${encodeURIComponent(deck.slug)}" target="_blank">${icon('open')}Полный экран</a></header><div class="wb-slide-workbench"><div class="wb-slide-index">${enabled.map((slide, index) => `<a href="#slide-${escapeHtml(slide.id)}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(slide.copy.title)}</strong><small>${escapeHtml(slide.archetype)}</small></a>`).join('')}</div><div class="wb-slide-board">${enabled.map((slide, index) => `<article class="wb-slide-preview" id="slide-${escapeHtml(slide.id)}"><header><span>${String(index + 1).padStart(2, '0')} · ${escapeHtml(slide.archetype)}</span>${slide.mandatory ? '<strong>mandatory</strong>' : ''}</header><div class="wb-slide-stage"><div class="wb-slide-canvas">${renderDeckSlide(slide, index)}</div></div><footer><span>${escapeHtml(slide.narrativeJob)}</span><span>${slide.media.length} media</span></footer></article>`).join('')}</div></div></section>`
  }

  const photoFilterOptions = (): string => `<label>Статус<select data-photo-status-filter><option value="all">Все статусы</option>${['new', 'review', 'approved', 'stale', 'rejected'].map((status) => `<option value="${status}" ${photoStatusFilter === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></label><label>Категория<select data-photo-category-filter><option value="all">Все категории</option>${photoCategories.map(([id, label]) => `<option value="${id}" ${photoCategoryFilter === id ? 'selected' : ''}>${label}</option>`).join('')}</select></label>`

  const renderPhotoInspector = (product: WorkspaceProduct, asset: PhotoAsset): string => {
    const assigned = new Set(asset.categories.map((item) => item.categoryId))
    const assignedSlots = new Set(asset.shotSlotIds)
    const slides = deck.slides.filter((slide) => slide.enabled)
    const slots = product.shotPlan?.slots ?? []
    const roleOptions = [['primary','Primary'],['alternate','Alternate'],['slideshow','Slideshow'],['reference-only','Reference only'],['rejected','Rejected']]
    return `<aside class="wb-inspector" aria-label="Редактор фотографии"><header><div><h2>${escapeHtml(asset.relativePath)}</h2><p>${asset.audit?.summary ? escapeHtml(asset.audit.summary) : 'Новый файл без подтверждённого описания'}</p></div><button class="wb-icon-button" type="button" data-close-inspector aria-label="Закрыть">${icon('close')}</button></header><div class="wb-inspector-preview">${previewablePhoto(asset) ? `<img src="${assetUrl('photo', asset.relativePath, product.productFolder)}" alt="${escapeHtml(asset.audit?.summary ?? asset.relativePath)}" />` : `<strong>${escapeHtml(asset.relativePath.split('.').at(-1)?.toUpperCase() ?? 'SOURCE')}</strong><span>Bridge / Photoshop source</span>`}</div><div class="wb-form-grid"><label>Статус<select data-photo-edit-status>${['new','review','approved','rejected','stale'].map((status) => `<option value="${status}" ${asset.status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></label><label>Origin<select data-photo-edit-origin>${['source','generated','unclassified'].map((origin) => `<option value="${origin}" ${asset.origin === origin ? 'selected' : ''}>${origin}</option>`).join('')}</select></label></div><fieldset><legend>Виртуальные категории и роли</legend><div class="wb-category-grid">${photoCategories.map(([id, label]) => { const currentRole = asset.categories.find((item) => item.categoryId === id)?.role ?? 'reference-only'; return `<div><label><input type="checkbox" data-photo-category value="${id}" ${assigned.has(id) ? 'checked' : ''}/><span>${label}</span></label><select data-photo-category-role="${id}">${roleOptions.map(([value,roleLabel]) => `<option value="${value}" ${currentRole === value ? 'selected' : ''}>${roleLabel}</option>`).join('')}</select></div>` }).join('')}</div></fieldset><fieldset><legend>Shot slots</legend><div class="wb-check-grid">${slots.map((slot) => `<label><input type="checkbox" data-photo-slot value="${slot.shotId}" ${assignedSlots.has(slot.shotId) ? 'checked' : ''}/><span>${escapeHtml(slot.title)}</span></label>`).join('') || '<span>Shot plan не найден</span>'}</div></fieldset><fieldset><legend>Назначение по слайдам</legend><div class="wb-check-grid">${slides.map((slide, index) => `<label><input type="checkbox" data-photo-slide value="${slide.id}" ${asset.slideIds.includes(slide.id) ? 'checked' : ''}/><span>${String(index + 1).padStart(2,'0')} · ${escapeHtml(slide.copy.title)}</span></label>`).join('')}</div></fieldset><dl class="wb-meta"><div><dt>Размер</dt><dd>${asset.fileState.width ?? '—'} × ${asset.fileState.height ?? '—'}</dd></div><div><dt>Файл</dt><dd>${formatBytes(asset.fileState.sizeBytes)}</dd></div><div><dt>Изменён</dt><dd>${formatDate(asset.fileState.modifiedAt)}</dd></div></dl><button class="wb-button is-primary is-wide" type="button" data-save-photo>${icon('save')}Сохранить в photodesign.json</button></aside>`
  }

  const renderPhotoLibrary = (product: WorkspaceProduct): string => {
    const filtered = product.photodesign.assets.filter((asset) => {
      const statusMatches = photoStatusFilter === 'all' || asset.status === photoStatusFilter
      const categories = [...asset.categories.map((item) => item.categoryId), ...(asset.extensions?.suggestedCategories ?? [])]
      return statusMatches && (photoCategoryFilter === 'all' || categories.includes(photoCategoryFilter))
    })
    const inspector = selectedPhoto()
    return `<div class="wb-library-layout ${inspector ? 'has-inspector' : ''}"><div class="wb-library-main"><div class="wb-filterbar">${photoFilterOptions()}<span>${filtered.length} из ${product.photodesign.assets.length}</span></div><div class="wb-photo-grid">${filtered.map((asset) => `<button class="wb-asset-card" type="button" data-photo-id="${asset.assetId}"><span class="wb-asset-image">${previewablePhoto(asset) ? `<img loading="lazy" src="${assetUrl('photo', asset.relativePath, product.productFolder)}" alt="${escapeHtml(asset.audit?.summary ?? asset.relativePath)}" />` : `<strong>${escapeHtml(asset.relativePath.split('.').at(-1)?.toUpperCase() ?? 'SOURCE')}</strong><small>Bridge / Photoshop source</small>`}</span><span class="wb-asset-copy"><strong>${escapeHtml(asset.relativePath)}</strong><span>${statusBadge(asset.status)}<small>${escapeHtml(asset.origin)}</small></span><em>${asset.categories.map((item) => `${item.categoryId}:${item.role}`).join(' · ') || 'без категории'}</em></span></button>`).join('')}</div>${filtered.length ? '' : '<div class="wb-empty"><h2>Ничего не найдено</h2><p>Измените фильтры — файлы в PHOTOBASE не затронуты.</p></div>'}</div>${inspector ? renderPhotoInspector(product, inspector) : ''}</div>`
  }

  const renderCoverage = (product: WorkspaceProduct): string => {
    if (!product.shotPlan) return '<div class="wb-empty"><h2>Shot plan не найден</h2><p>Coverage появится после создания MARKETING/shot_plan.json.</p></div>'
    const approved = product.photodesign.assets.filter((asset) => asset.status === 'approved')
    return `<div class="wb-coverage-layout"><section class="wb-coverage-categories"><header><h2>Покрытие категорий</h2><span>approved primary / alternate / slideshow</span></header>${product.shotPlan.categories.filter((category) => category.enabled).map((category) => { const actual = approved.filter((asset) => asset.categories.some((assignment) => assignment.categoryId === category.categoryId && ['primary','alternate','slideshow'].includes(assignment.role))).length; const progress = Math.min(100, Math.round(actual / Math.max(1, category.ideal) * 100)); const excess = category.maximum !== undefined && actual > category.maximum; return `<div class="wb-coverage-row"><div><strong>${escapeHtml(category.label)}</strong><small>${escapeHtml(category.rationale ?? '')}${excess ? ' · excess: рассмотрите slideshow/alternate' : ''}</small></div><span>${actual} / ${category.ideal}</span><i><b style="width:${progress}%"></b></i></div>` }).join('')}</section><section class="wb-slot-list"><header><h2>Shot slots</h2><span>${product.shotPlan.slots.length} задач</span></header>${product.shotPlan.slots.map((slot) => { const assigned = approved.filter((asset) => asset.shotSlotIds.includes(slot.shotId)); const computedStatus = assigned.length >= slot.desiredCount ? 'approved' : assigned.length > 0 ? 'candidate_ready' : slot.recipeIds.length ? 'prompt_ready' : slot.required ? 'blocked' : 'planned'; return `<article><div><strong>${escapeHtml(slot.title)}</strong><p>${escapeHtml(slot.purpose)}</p><small>${assigned.length} / ${slot.desiredCount} approved · ${slot.aspectRatios?.join(', ') ?? 'без формата'}</small></div>${statusBadge(computedStatus)}</article>` }).join('')}</section></div>`
  }

  const renderPromptBuilder = (product: WorkspaceProduct): string => {
    const system = product.promptSystem
    if (!system) return '<div class="wb-empty"><h2>Prompt system не найден</h2><p>Создайте MARKETING/prompt_system.json.</p></div>'
    if (!selectedRecipeId) selectedRecipeId = system.recipes[0]?.recipeId ?? ''
    const recipe = selectedRecipe()
    if (!recipe) return '<div class="wb-empty"><h2>Нет prompt recipes</h2></div>'
    const blocks = recipe.blockRefs.map((reference) => system.blocks.find((block) => block.blockId === reference.blockId)).filter(Boolean)
    const references = product.photodesign.assets.filter((asset) => ['source','generated'].includes(asset.origin) && asset.status !== 'rejected')
    return `<div class="wb-prompt-layout"><nav class="wb-recipe-list" aria-label="Prompt recipes"><header><h2>Recipes</h2><span>${system.recipes.length}</span></header>${system.recipes.map((item) => `<button type="button" data-recipe-id="${item.recipeId}" class="${item.recipeId === recipe.recipeId ? 'is-active' : ''}"><span>${statusBadge(item.status)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.categoryId)}</small></button>`).join('')}</nav><section class="wb-prompt-editor"><header><div><h2>${escapeHtml(recipe.title)}</h2><p>${recipe.referenceAssetIds.length} reference assets · ${blocks.length} blocks · ${escapeHtml(recipe.engineProfileId)}</p></div><button class="wb-button" type="button" data-copy-prompt>${icon('copy')}Копировать</button></header><div class="wb-prompt-config"><label>Engine profile<select data-recipe-engine>${system.engineProfiles.filter((profile) => profile.enabled).map((profile) => `<option value="${profile.engineProfileId}" ${profile.engineProfileId === recipe.engineProfileId ? 'selected' : ''}>${escapeHtml(profile.label)}</option>`).join('')}</select></label><fieldset><legend>Reference assets</legend><div class="wb-reference-list">${references.map((asset) => `<label><input type="checkbox" data-recipe-reference value="${asset.assetId}" ${recipe.referenceAssetIds.includes(asset.assetId) ? 'checked' : ''}/><span>${escapeHtml(asset.relativePath)}</span></label>`).join('')}</div></fieldset></div><details class="wb-master-blocks"><summary>Master blocks · изменение пересоберёт полный prompt</summary>${blocks.map((block) => block ? `<label><span>${escapeHtml(block.title)} <small>${block.scope} · v${block.version}</small></span><textarea data-prompt-block="${block.blockId}" spellcheck="false">${escapeHtml(block.content)}</textarea></label>` : '').join('')}</details><label class="wb-prompt-textarea"><span>Compiled prompt snapshot</span><textarea data-compiled-prompt spellcheck="false">${escapeHtml(recipe.compiledPrompt)}</textarea></label><footer><span>Записываются blocks, references, engine и готовый snapshot в prompt_system.json</span><button class="wb-button is-primary" type="button" data-save-prompt>${icon('save')}Пересобрать и сохранить</button></footer></section></div>`
  }

  const compileRecipePreview = (system: NonNullable<WorkspaceProduct['promptSystem']>, recipe: PromptRecipe): string => {
    const profile = system.engineProfiles.find((item) => item.engineProfileId === recipe.engineProfileId)
    const content = recipe.blockRefs.map((reference) => system.blocks.find((block) => block.blockId === reference.blockId))
      .filter((block) => block?.enabled)
      .map((block) => pendingBlockEdits.get(block!.blockId) ?? block!.content)
    return [profile?.prefix, ...content, profile?.suffix]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .join('\n\n')
  }

  const renderPromptFlow = (product: WorkspaceProduct): string => {
    const system = product.promptSystem
    if (!system) return '<div class="wb-empty"><h2>Prompt system не найден</h2><p>Граф появится после создания MARKETING/prompt_system.json.</p></div>'
    if (!selectedRecipeId) selectedRecipeId = system.recipes.find((item) => item.recipeId === 'recipe-studio-white-front-three-quarter')?.recipeId ?? system.recipes[0]?.recipeId ?? ''
    const recipe = selectedRecipe()
    if (!recipe) return '<div class="wb-empty"><h2>Нет prompt recipes</h2></div>'
    const connectedBlocks = recipe.blockRefs.map((reference) => system.blocks.find((block) => block.blockId === reference.blockId)).filter((block): block is PromptBlock => Boolean(block))
    if (!selectedFlowBlockId || !connectedBlocks.some((block) => block.blockId === selectedFlowBlockId)) selectedFlowBlockId = connectedBlocks[0]?.blockId ?? ''
    const activeBlock = system.blocks.find((block) => block.blockId === selectedFlowBlockId)
    const profile = system.engineProfiles.find((item) => item.engineProfileId === recipe.engineProfileId)
    const referenceCandidates = product.photodesign.assets.filter((asset) => ['source','generated'].includes(asset.origin) && asset.status !== 'rejected')
    const relevantBlocks = system.blocks.filter((block) => block.enabled && (
      ['product','global','negative'].includes(block.scope) || block.categoryIds?.includes(recipe.categoryId) || recipe.blockRefs.some((reference) => reference.blockId === block.blockId)
    ))
    const orderedRecipes = system.recipes.slice().sort((a, b) => Number(!a.categoryId.startsWith('studio-')) - Number(!b.categoryId.startsWith('studio-')) || a.title.localeCompare(b.title))
    const node = (block: PromptBlock): string => `<button type="button" class="wb-flow-node ${block.blockId === selectedFlowBlockId ? 'is-selected' : ''}" data-flow-node="${block.blockId}" data-scope="${block.scope}" aria-pressed="${block.blockId === selectedFlowBlockId}"><span>${escapeHtml(promptScopeLabel(block.scope))}<b>v${block.version}</b></span><strong>${escapeHtml(block.title)}</strong><small>${escapeHtml((pendingBlockEdits.get(block.blockId) ?? block.content).slice(0, 86))}${block.content.length > 86 ? '…' : ''}</small></button>`
    const wire = '<span class="wb-flow-wire" aria-hidden="true"><i></i></span>'
    const graph = [
      ...connectedBlocks.flatMap((block) => [node(block), wire]),
      `<button type="button" class="wb-flow-node" data-scope="engine" data-flow-engine-node><span>Engine Adapter<b>${escapeHtml(profile?.model ?? '')}</b></span><strong>${escapeHtml(profile?.label ?? recipe.engineProfileId)}</strong><small>${escapeHtml(profile?.suffix ?? profile?.prefix ?? 'Без дополнительного синтаксиса')}</small></button>`, wire,
      `<button type="button" class="wb-flow-node" data-scope="references" data-flow-references-node><span>References<b>${recipe.referenceAssetIds.length}</b></span><strong>Visual evidence</strong><small>${recipe.referenceAssetIds.length ? 'Выбранные исходники передаются вместе с prompt' : 'Референсы ещё не выбраны'}</small></button>`, wire,
      `<button type="button" class="wb-flow-node is-output" data-scope="output" data-copy-flow><span>Output<b>${connectedBlocks.length + 2}</b></span><strong>Compiled Prompt</strong><small>Готов к копированию и snapshot</small></button>`,
    ].join('')
    const compiledPreview = compileRecipePreview(system, recipe)
    return `<div class="wb-flow-shell"><nav class="wb-flow-recipes" aria-label="Prompt recipes"><header><div><h2>Prompt recipes</h2><p>Studio-серии показаны первыми</p></div><span>${system.recipes.length}</span></header>${orderedRecipes.map((item) => `<button type="button" data-recipe-id="${item.recipeId}" class="${item.recipeId === recipe.recipeId ? 'is-active' : ''}"><span><i data-series="${item.categoryId}"></i>${statusBadge(item.status)}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.categoryId)} · ${item.blockRefs.length} nodes</small></button>`).join('')}</nav><section class="wb-flow-workbench"><header class="wb-flow-toolbar"><div><h2>${escapeHtml(recipe.title)}</h2><p>${escapeHtml(recipe.shotId)} · ${escapeHtml(recipe.categoryId)}${flowDirty ? ' · несохранённые связи' : ''}</p></div><label>Engine<select data-flow-engine-select>${system.engineProfiles.filter((item) => item.enabled).map((item) => `<option value="${item.engineProfileId}" ${item.engineProfileId === recipe.engineProfileId ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select></label><div class="wb-flow-actions"><button class="wb-button" type="button" data-discard-flow ${flowDirty ? '' : 'disabled'}>Сбросить</button><button class="wb-button" type="button" data-copy-flow>${icon('copy')}Копировать</button><button class="wb-button is-primary" type="button" data-save-flow>${icon('save')}Собрать и сохранить</button></div></header><div class="wb-flow-phase"><span>START · идентичность</span><span>MIDDLE · задача кадра</span><span>END · ограничения и вывод</span></div><div class="wb-flow-canvas" role="region" aria-label="Узловая схема выбранного промпта" tabindex="0"><div class="wb-flow-track">${graph}</div></div><div class="wb-flow-details"><section class="wb-flow-editor">${activeBlock ? `<header><div><span data-scope="${activeBlock.scope}">${escapeHtml(promptScopeLabel(activeBlock.scope))}</span><h3>${escapeHtml(activeBlock.title)}</h3></div><b>v${activeBlock.version}</b></header><label class="wb-sr-only" for="flow-block-editor">Содержимое узла ${escapeHtml(activeBlock.title)}</label><textarea id="flow-block-editor" data-prompt-block="${activeBlock.blockId}" data-flow-block-editor spellcheck="false">${escapeHtml(pendingBlockEdits.get(activeBlock.blockId) ?? activeBlock.content)}</textarea><footer><span>Источники: ${activeBlock.sourceRefs.map(escapeHtml).join(' · ') || 'не указаны'}</span><em>Изменение увеличит версию и пометит зависимые recipes как stale.</em></footer>` : '<div class="wb-empty"><h2>Выберите узел</h2><p>Его содержимое появится здесь.</p></div>'}</section><aside class="wb-flow-links"><header><h3>Связи рецепта</h3><span>${connectedBlocks.length} active</span></header><p>Включите блок — он появится на поле и войдёт в итог в порядке Product → Category → Shot → Quality → Negative.</p><div>${relevantBlocks.map((block) => `<label data-scope="${block.scope}"><input type="checkbox" data-flow-block-toggle value="${block.blockId}" ${recipe.blockRefs.some((reference) => reference.blockId === block.blockId) ? 'checked' : ''}/><span><strong>${escapeHtml(block.title)}</strong><small>${escapeHtml(promptScopeLabel(block.scope))} · v${block.version}</small></span></label>`).join('')}</div></aside><section class="wb-flow-output"><header><div><h3>Compiled Prompt</h3><p data-flow-output-meta>${compiledPreview.length} знаков · начало, середина и конец собраны из узлов</p></div><button class="wb-button" type="button" data-copy-flow>${icon('copy')}Копировать</button></header><label class="wb-sr-only" for="flow-compiled-prompt">Собранный полный промпт</label><textarea id="flow-compiled-prompt" data-compiled-prompt readonly spellcheck="false">${escapeHtml(compiledPreview)}</textarea><details data-flow-reference-details><summary>Reference assets · ${recipe.referenceAssetIds.length}</summary><div class="wb-flow-references">${referenceCandidates.map((asset) => `<label><input type="checkbox" data-flow-reference value="${asset.assetId}" ${recipe.referenceAssetIds.includes(asset.assetId) ? 'checked' : ''}/><span>${escapeHtml(asset.relativePath)}</span></label>`).join('')}</div></details></section></div></section></div>`
  }

  const renderGenerationHistory = (product: WorkspaceProduct): string => {
    const records = product.generationHistory ?? []
    const candidates = product.photodesign.assets.filter((asset) => !asset.generationRecordId && asset.origin === 'unclassified' && asset.status !== 'rejected')
    const recipes = product.promptSystem?.recipes.filter((recipe) => recipe.status !== 'retired') ?? []
    if (!historyPhotoId || !candidates.some((asset) => asset.assetId === historyPhotoId)) historyPhotoId = candidates[0]?.assetId ?? ''
    if (!historyRecipeId || !recipes.some((recipe) => recipe.recipeId === historyRecipeId)) historyRecipeId = recipes[0]?.recipeId ?? ''
    const issues = product.generationHistoryIssues ?? []
    return `<div class="wb-history-layout"><section class="wb-history-list"><header><h2>Prompt snapshots</h2><span>${records.length}</span></header>${issues.length ? `<div class="wb-history-warning"><strong>JSONL требует проверки</strong><span>${issues.map((issue) => `Строка ${issue.line}: ${escapeHtml(issue.message)}`).join('<br/>')}</span></div>` : ''}${records.length ? records.slice().reverse().map((record) => `<article><div><strong>${escapeHtml(record.recordId)}</strong><small>${formatDate(record.createdAt)} · ${escapeHtml(record.engine.name)}</small></div>${statusBadge(record.status)}<p>${escapeHtml(record.promptSnapshot.text)}</p><footer>${record.outputs.map((output) => `<span>${escapeHtml(output.relativePath)} · ${output.status}</span>`).join('')}</footer></article>`).join('') : '<div class="wb-empty"><h2>История пока пуста</h2><p>Она начнётся после вашего подтверждения связи нового файла с точным prompt snapshot.</p></div>'}</section><aside class="wb-history-linker"><h2>Связать новый результат</h2><p>Ничего не назначается автоматически. Подтверждение создаст immutable JSONL record и отметит файл как generated.</p><label>Новый файл<select data-history-photo>${candidates.map((asset) => `<option value="${asset.assetId}" ${asset.assetId === historyPhotoId ? 'selected' : ''}>${escapeHtml(asset.relativePath)}</option>`).join('')}</select></label><label>Prompt recipe<select data-history-recipe>${recipes.map((recipe) => `<option value="${recipe.recipeId}" ${recipe.recipeId === historyRecipeId ? 'selected' : ''}>${escapeHtml(recipe.title)}</option>`).join('')}</select></label><button class="wb-button is-primary is-wide" type="button" data-link-generation ${!historyPhotoId || !historyRecipeId ? 'disabled' : ''}>${icon('link')}Подтвердить связь и snapshot</button><small>${candidates.length ? `${candidates.length} неподтверждённых файлов доступны для связи` : 'Новых неподтверждённых файлов нет'}</small></aside></div>`
  }

  const renderPhotodesign = (product: WorkspaceProduct): string => `<section class="wb-workspace-view"><header class="wb-view-header"><div><h1>Photodesign</h1><p>${product.photodesign.assets.length} файлов · физические папки Bridge остаются без изменений</p></div>${statusBadge(product.shotPlan?.status ?? 'not_started')}</header><nav class="wb-subnav" role="tablist">${photoTabs.map((tab) => `<button type="button" role="tab" data-photo-tab="${tab.id}" aria-selected="${photoTab === tab.id}" class="${photoTab === tab.id ? 'is-active' : ''}">${tab.label}</button>`).join('')}</nav>${photoTab === 'library' ? renderPhotoLibrary(product) : photoTab === 'coverage' ? renderCoverage(product) : photoTab === 'prompts' ? renderPromptBuilder(product) : renderGenerationHistory(product)}</section>`

  const renderLogoInspector = (asset: LogoAsset): string => {
    const brand = snapshot?.logoCatalog.brands.find((item) => item.brandId === asset.brandId)
    const types = ['wordmark','symbol','lockup','badge','certification','partner-mark','subbrand','unknown']
    const layouts = ['horizontal','vertical','square','round','freeform','unknown']
    const colorways = ['full-color','brand-color','dark','light','mono-black','mono-white','unknown']
    return `<aside class="wb-inspector" aria-label="Редактор логотипа"><header><div><h2>${escapeHtml(asset.relativePath)}</h2><p>${escapeHtml(asset.description ?? '')}</p></div><button class="wb-icon-button" type="button" data-close-inspector aria-label="Закрыть">${icon('close')}</button></header><div class="wb-inspector-preview is-logo ${logoTone === 'dark' ? 'is-dark' : ''}">${previewableLogo(asset) ? `<img src="${assetUrl('logo', asset.relativePath)}" alt="${escapeHtml(asset.description ?? asset.relativePath)}" />` : `<strong>.${escapeHtml(asset.format)}</strong><span>master/source</span>`}</div><div class="wb-form-grid"><label>Статус<select data-logo-edit-status>${['new','review','approved','rejected','stale'].map((status) => `<option value="${status}" ${asset.status === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></label><label>Бренд<input value="${escapeHtml(brand?.displayName ?? asset.brandId)}" disabled /></label><label>Тип<select data-logo-edit-type>${types.map((value) => `<option value="${value}" ${asset.assetType === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>Layout<select data-logo-edit-layout>${layouts.map((value) => `<option value="${value}" ${asset.layout === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>Colorway<select data-logo-edit-colorway>${colorways.map((value) => `<option value="${value}" ${asset.colorway === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>Transform<select data-logo-edit-transform>${['forbidden','recolor-approved','convert-only','unknown'].map((value) => `<option value="${value}" ${asset.transformPolicy === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label></div><fieldset><legend>Совместимые фоны</legend><div class="wb-check-grid">${['light','dark','photographic','brand-color','any','unknown'].map((value) => `<label><input type="checkbox" data-logo-background value="${value}" ${asset.backgroundCompatibility.includes(value) ? 'checked' : ''}/><span>${value}</span></label>`).join('')}</div></fieldset><dl class="wb-meta"><div><dt>Формат</dt><dd>${escapeHtml(asset.format.toUpperCase())}</dd></div><div><dt>Usage</dt><dd>${escapeHtml(asset.usage.join(', '))}</dd></div></dl><p class="wb-inspector-warning">Утверждение означает ручную проверку семантики и совместимости. Оно не изменяет оригинал.</p><button class="wb-button is-primary is-wide" type="button" data-save-logo>${icon('save')}Сохранить в logo_catalog.json</button></aside>`
  }

  const renderLogoAssets = (): string => {
    if (!snapshot) return ''
    const brands = snapshot.logoCatalog.brands
    const filtered = snapshot.logoCatalog.assets.filter((asset) => (logoBrandFilter === 'all' || asset.brandId === logoBrandFilter) && (logoStatusFilter === 'all' || asset.status === logoStatusFilter) && (logoBackgroundFilter === 'all' || asset.backgroundCompatibility.includes(logoBackgroundFilter)))
    const inspector = selectedLogo()
    return `<div class="wb-library-layout ${inspector ? 'has-inspector' : ''}"><div class="wb-library-main"><div class="wb-filterbar"><label>Бренд<select data-logo-brand-filter><option value="all">Все бренды</option>${brands.map((brand) => `<option value="${brand.brandId}" ${logoBrandFilter === brand.brandId ? 'selected' : ''}>${escapeHtml(brand.displayName)}</option>`).join('')}</select></label><label>Статус<select data-logo-status-filter><option value="all">Все статусы</option>${['new','review','approved','stale','rejected'].map((status) => `<option value="${status}" ${logoStatusFilter === status ? 'selected' : ''}>${statusLabel(status)}</option>`).join('')}</select></label><label>Подложка<select data-logo-background-filter><option value="all">Любой фон</option>${['light','dark','photographic'].map((background) => `<option value="${background}" ${logoBackgroundFilter === background ? 'selected' : ''}>${background}</option>`).join('')}</select></label><div class="wb-tone-switch"><button type="button" data-logo-tone="light" class="${logoTone === 'light' ? 'is-active' : ''}">Светлая</button><button type="button" data-logo-tone="dark" class="${logoTone === 'dark' ? 'is-active' : ''}">Тёмная</button></div><span>${filtered.length} из ${snapshot.logoCatalog.assets.length}</span></div><div class="wb-logo-grid ${logoTone === 'dark' ? 'is-dark' : ''}">${filtered.map((asset) => { const brand = brands.find((item) => item.brandId === asset.brandId); return `<button class="wb-logo-card" type="button" data-logo-id="${asset.assetId}"><span class="wb-logo-image">${previewableLogo(asset) ? `<img loading="lazy" src="${assetUrl('logo', asset.relativePath)}" alt="${escapeHtml(asset.description ?? asset.relativePath)}" />` : `<strong>.${escapeHtml(asset.format)}</strong><small>master</small>`}</span><span class="wb-logo-copy"><strong>${escapeHtml(brand?.displayName ?? asset.brandId)}</strong><small>${escapeHtml(asset.assetType)} · ${escapeHtml(asset.colorway)}</small><span>${statusBadge(asset.status)}<em>${escapeHtml(asset.format.toUpperCase())}</em></span></span></button>` }).join('')}</div></div>${inspector ? renderLogoInspector(inspector) : ''}</div>`
  }

  const renderLogoVariants = (): string => {
    if (!snapshot) return ''
    const fields = [['lightBackgroundAssetId','Light background'],['darkBackgroundAssetId','Dark background'],['printAssetId','Print / PDF'],['fallbackAssetId','Fallback']] as const
    return `<div class="wb-variant-grid">${snapshot.logoCatalog.brands.map((brand) => { const assets = snapshot!.logoCatalog.assets.filter((asset) => asset.brandId === brand.brandId && asset.status !== 'rejected'); const preferredIds = Object.values(brand.preferred ?? {}); const confirmed = preferredIds.length > 0 && preferredIds.every((assetId) => snapshot!.logoCatalog.assets.find((asset) => asset.assetId === assetId)?.status === 'approved'); return `<article data-variant-brand="${brand.brandId}"><header><div><h2>${escapeHtml(brand.displayName)}</h2><p>${escapeHtml(brand.kind)} · ${assets.length} variants</p></div>${statusBadge(confirmed ? 'approved' : 'review_required')}</header><div class="wb-form-grid">${fields.map(([field,label]) => `<label>${label}<select data-preferred-field="${field}"><option value="">Не выбрано</option>${assets.map((asset) => `<option value="${asset.assetId}" ${brand.preferred?.[field] === asset.assetId ? 'selected' : ''}>${escapeHtml(asset.relativePath)} · ${asset.format}</option>`).join('')}</select></label>`).join('')}</div><button class="wb-button" type="button" data-save-variants="${brand.brandId}">${icon('save')}Сохранить варианты</button></article>` }).join('')}</div>`
  }

  const renderLogoPlacements = (): string => {
    if (!snapshot) return ''
    const productBrandId = currentProduct()?.productId
    const assets = snapshot.logoCatalog.assets.filter((asset) => asset.status !== 'rejected' && asset.status !== 'missing').sort((a, b) => Number(b.brandId === productBrandId) - Number(a.brandId === productBrandId))
    const placements = snapshot.logoCatalog.placements
    return `<div class="wb-placement-layout"><section class="wb-placement-list"><header><h2>Placements</h2><span>${placements.length}</span></header>${placements.length ? placements.map((placement) => { const asset = snapshot!.logoCatalog.assets.find((item) => item.assetId === placement.assetId); const compatible = placementIsCompatible(placement, asset); return `<article data-placement-id="${placement.placementId}"><div><strong>${escapeHtml(asset?.relativePath ?? placement.assetId)}</strong><small>${escapeHtml(placement.deckId)}${placement.slideId ? ` · ${escapeHtml(placement.slideId)}` : ''} · ${escapeHtml(placement.role)} · ${escapeHtml(placement.background)} · ${escapeHtml(placement.output)} · ${escapeHtml(placement.transform)}</small>${compatible ? '' : '<em>Approval недоступен: проверьте статус ассета и совместимость.</em>'}</div><select data-placement-status>${['draft','approved','rejected','stale'].map((status) => `<option value="${status}" ${placement.status === status ? 'selected' : ''} ${status === 'approved' && !compatible ? 'disabled' : ''}>${statusLabel(status)}</option>`).join('')}</select><button class="wb-button" type="button" data-save-placement="${placement.placementId}">${icon('save')}Сохранить</button></article>` }).join('') : '<div class="wb-empty"><h2>Назначений пока нет</h2><p>Добавьте первое назначение и подтвердите его отдельно.</p></div>'}</section><aside class="wb-placement-create"><h2>Новое назначение</h2><label>Asset<select data-placement-asset>${assets.map((asset) => `<option value="${asset.assetId}">${escapeHtml(asset.relativePath)} · ${statusLabel(asset.status)}</option>`).join('')}</select></label><label>Slide<select data-placement-slide><option value="">На уровне презентации</option>${deck.slides.filter((slide) => slide.enabled).map((slide) => `<option value="${slide.id}">${escapeHtml(slide.copy.title)}</option>`).join('')}</select></label><label>Role<select data-placement-role>${['primary-brand','manufacturer','partner','certification','customer','footer','other'].map((role) => `<option value="${role}">${role}</option>`).join('')}</select></label><label>Background<select data-placement-background>${['light','dark','photographic','brand-color'].map((value) => `<option value="${value}">${value}</option>`).join('')}</select></label><label>Output<select data-placement-output>${['pdf','web','print'].map((value) => `<option value="${value}">${value}</option>`).join('')}</select></label><label>Transform<select data-placement-transform>${['none','recolor','convert'].map((value) => `<option value="${value}">${value}</option>`).join('')}</select></label><button class="wb-button is-primary is-wide" type="button" data-add-placement>${icon('link')}Добавить как draft</button><p>Placement не изменяет исходный логотип. Approved доступен только после проверки asset status, background, output, role и transform policy.</p></aside></div>`
  }

  const renderLogos = (): string => {
    if (!snapshot) return ''
    const open = snapshot.logoCatalog.assets.some((asset) => ['new','review','stale'].includes(asset.status)) || snapshot.logoCatalog.placements.some((placement) => placement.status !== 'approved')
    return `<section class="wb-workspace-view"><header class="wb-view-header"><div><h1>Logo Library</h1><p>${snapshot.logoCatalog.assets.length} ассета · ${snapshot.logoCatalog.brands.length} брендов · ${snapshot.logoCatalog.placements.length} placements</p></div>${statusBadge(open ? 'review_required' : 'approved')}</header><nav class="wb-subnav" role="tablist">${logoTabs.map((tab) => `<button type="button" role="tab" data-logo-tab="${tab.id}" aria-selected="${logoTab === tab.id}" class="${logoTab === tab.id ? 'is-active' : ''}">${tab.label}</button>`).join('')}</nav>${logoTab === 'assets' ? renderLogoAssets() : logoTab === 'variants' ? renderLogoVariants() : renderLogoPlacements()}</section>`
  }

  const renderMarketingDocuments = (product: WorkspaceProduct): string => {
    const documents = product.documents
    if (!selectedDocumentKind) selectedDocumentKind = documents[0]?.kind ?? ''
    const selected = documents.find((document) => document.kind === selectedDocumentKind) ?? documents[0]
    return `<div class="wb-doc-layout"><nav>${documents.map((document) => `<button type="button" data-document-kind="${escapeHtml(document.kind)}" class="${selected?.kind === document.kind ? 'is-active' : ''}"><strong>${escapeHtml(document.title)}</strong><small>${escapeHtml(document.relativePath)}</small></button>`).join('')}</nav><article class="wb-document">${selected ? markdownToHtml(selected.content) : '<h2>Документы не найдены</h2>'}</article></div>`
  }

  const renderMarketing = (product: WorkspaceProduct): string => {
    const promptCount = product.promptSystem?.recipes.length ?? 0
    const panel = marketingTab === 'flow' ? renderPromptFlow(product) : marketingTab === 'classic' ? renderPromptBuilder(product) : renderMarketingDocuments(product)
    return `<section class="wb-workspace-view is-marketing"><header class="wb-view-header"><div><h1>Marketing</h1><p>Промпты собираются из видимых связей; канонические Markdown-документы остаются read-only.</p></div>${marketingTab === 'documents' ? '<span class="wb-readonly">READ ONLY</span>' : `<span class="wb-marketing-count">${promptCount} RECIPES</span>`}</header><nav class="wb-subnav wb-marketing-tabs" role="tablist" aria-label="Разделы Marketing">${marketingTabs.map((tab) => `<button id="marketing-tab-${tab.id}" type="button" role="tab" data-marketing-tab="${tab.id}" aria-selected="${marketingTab === tab.id}" aria-controls="marketing-panel-${tab.id}" tabindex="${marketingTab === tab.id ? '0' : '-1'}" class="${marketingTab === tab.id ? 'is-active' : ''}">${tab.label}</button>`).join('')}</nav><div id="marketing-panel-${marketingTab}" role="tabpanel" aria-labelledby="marketing-tab-${marketingTab}">${panel}</div></section>`
  }

  const renderTheme = (): string => {
    const values = editableTokens.map((token) => ({ token, value: themeDraft.colors[token] ?? getComputedStyle(document.documentElement).getPropertyValue(token).trim() }))
    const presets = readPresets(deck.slug)
    return `<section class="wb-workspace-view"><header class="wb-view-header"><div><h1>Theme</h1><p>Локальный preview темы ${escapeHtml(deck.title)}. Презентационные файлы не переписываются.</p></div><a class="wb-button" href="/?deck=${encodeURIComponent(deck.slug)}&theme=${themeDraft.theme}&variant=${themeDraft.variant}" target="_blank">${icon('open')}Проверить deck</a></header><div class="wb-theme-layout"><section class="wb-theme-controls"><div class="wb-form-grid"><label>Theme<select data-theme>${themes.map((theme) => `<option value="${theme}" ${themeDraft.theme === theme ? 'selected' : ''}>${theme}</option>`).join('')}</select></label><label>Variant<select data-variant>${variants.map((variant) => `<option value="${variant}" ${themeDraft.variant === variant ? 'selected' : ''}>${variant}</option>`).join('')}</select></label></div><div class="wb-token-editor">${values.map(({ token, value }) => `<label><span><i style="background:${escapeHtml(value)}"></i>${escapeHtml(token.replace('--wb-color-', ''))}</span><input type="text" data-token="${token}" value="${escapeHtml(value)}" /></label>`).join('')}</div><div class="wb-preset-save"><input data-preset-name placeholder="Название локального пресета"/><button class="wb-button is-primary" type="button" data-save-preset>${icon('save')}Сохранить</button></div><div class="wb-preset-list">${presets.map((preset) => `<button type="button" data-load-preset="${preset.id}">${escapeHtml(preset.name)}</button>`).join('') || '<span>Сохранённых пресетов нет</span>'}</div></section><section class="wb-theme-preview"><div><span>${escapeHtml(deck.product.brand)}</span><h2>${escapeHtml(deck.product.model)}</h2><p>Тест контраста, иерархии и акцентного действия на текущих design tokens.</p><button type="button">Primary action</button></div></section></div></section>`
  }

  const renderExport = (product: WorkspaceProduct): string => {
    const gates = (product.photodesign.extensions?.qualityGates ?? {}) as Record<string, boolean>
    const approvedPlacements = snapshot?.logoCatalog.placements.filter((placement) => placement.status === 'approved' && placementIsCompatible(placement, snapshot?.logoCatalog.assets.find((asset) => asset.assetId === placement.assetId))).length ?? 0
    const checks = [
      { key: 'sourceInventory', label: 'Source inventory', passed: Boolean(gates.sourceInventory), detail: `${product.photodesign.assets.length} файлов; подтвердите полноту набора` },
      { key: 'schemaValidation', label: 'JSON schemas', passed: Boolean(gates.schemaValidation), detail: 'Подтвердите после npm.cmd run build и schema validation' },
      { key: 'photoReview', label: 'Photo review', passed: product.photodesign.assets.every((asset) => !['new', 'stale'].includes(asset.status)), detail: `${product.photodesign.assets.filter((asset) => ['new','stale'].includes(asset.status)).length} требуют внимания` },
      { key: 'logoPlacements', label: 'Logo placements', passed: approvedPlacements > 0 && Boolean(gates.logoPlacements), detail: `${approvedPlacements} approved; требуется подтверждение набора` },
      { key: 'pdfArtifact', label: 'PDF artifact', passed: Boolean(gates.pdfArtifact), detail: deck.downloadPath ?? 'Файл не указан' },
      { key: 'visualQa', label: 'Visual QA', passed: Boolean(gates.visualQa), detail: 'Подтвердите после ручной проверки всех страниц' },
    ]
    const passed = checks.filter((check) => check.passed).length
    return `<section class="wb-workspace-view"><header class="wb-view-header"><div><h1>Export / QA</h1><p>Release остаётся review_required, пока обязательные проверки не подтверждены.</p></div>${statusBadge(passed === checks.length ? 'approved' : 'review_required')}</header><div class="wb-export-layout"><section class="wb-checklist"><header><h2>Quality gates</h2><span>${passed}/${checks.length}</span></header>${checks.map((check) => `<label class="wb-gate-row"><input type="checkbox" data-quality-gate="${check.key}" ${check.passed ? 'checked' : ''} ${check.key === 'photoReview' ? 'disabled' : ''}/><span class="wb-check ${check.passed ? 'is-pass' : ''}"></span><div><strong>${escapeHtml(check.label)}</strong><small>${escapeHtml(check.detail)}</small></div><b>${check.passed ? 'PASS' : 'OPEN'}</b></label>`).join('')}<button class="wb-button is-primary" type="button" data-save-gates>${icon('save')}Сохранить ручные подтверждения</button></section><section class="wb-export-actions"><h2>Действия</h2><a class="wb-button is-primary" href="/?deck=${encodeURIComponent(deck.slug)}" target="_blank">${icon('open')}Открыть HTML</a>${deck.downloadPath ? `<a class="wb-button" href="${escapeHtml(deck.downloadPath)}" download>${icon('export')}Скачать PDF</a>` : ''}<button class="wb-button" type="button" data-refresh>${icon('refresh')}Повторить сканирование</button><div class="wb-command"><span>Полная локальная проверка</span><code>npm.cmd run validate:data</code><code>npm.cmd run build</code><code>npm.cmd run export:garlando</code></div></section></div></section>`
  }

  const renderContent = (product: WorkspaceProduct): string => {
    if (activeSection === 'overview') return renderOverview(product)
    if (activeSection === 'slides') return renderSlides()
    if (activeSection === 'photodesign') return renderPhotodesign(product)
    if (activeSection === 'logos') return renderLogos()
    if (activeSection === 'marketing') return renderMarketing(product)
    if (activeSection === 'theme') return renderTheme()
    return renderExport(product)
  }

  const render = (): void => {
    setTheme()
    if (loading) { root.innerHTML = renderLoading(); return }
    if (error || !snapshot) { root.innerHTML = renderError(); return }
    const product = currentProduct()
    if (!product) { root.innerHTML = `<section class="wb-console-state"><h1>Workspace презентации не найден</h1><p>Для ${escapeHtml(deck.title)} ожидается товар <code>${escapeHtml(selectedProductId)}</code>. Garlando не подставлен: проверьте регистрацию пути и канонические документы.</p></section>`; return }
    selectedProductId = product.productId
    document.title = `Console — ${deck.title}`
    root.innerHTML = `<main class="wb-console-shell"><!-- WB-CONSOLE-DIRECTION: THESIS: one calm control room connects local evidence to release and refuses a slide-editor-only layout. OWN-WORLD: near-black graphite fields, warm brass action, crisp hairlines, Diaria headings and dense Inter controls. STORY: see blockers, inspect assets, confirm metadata, open the deck. FIRST VIEWPORT: fixed navigation rail, contextual topbar, pipeline and attention queue. FORM: established-world operator rail; seed established-console-v2. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md --><aside class="wb-app-nav"><a class="wb-app-brand" href="/console?deck=${encodeURIComponent(deck.slug)}"><span>W</span><strong>WEEKEND<br/>BILLIARD</strong></a><nav aria-label="Основная навигация">${sections.map((item) => `<button type="button" data-section="${item.id}" aria-current="${activeSection === item.id ? 'page' : 'false'}" class="${activeSection === item.id ? 'is-active' : ''}">${icon(item.id)}<span>${item.label}</span></button>`).join('')}</nav><footer><span class="wb-connection-dot"></span><div><strong>LOCAL</strong><small>workspace connected</small></div></footer></aside><section class="wb-app-main"><header class="wb-app-topbar"><div class="wb-context-selects"><label>Product<select data-product>${snapshot.products.map((item) => `<option value="${item.productId}" ${item.productId === product.productId ? 'selected' : ''}>${escapeHtml(item.displayName)}</option>`).join('')}</select></label><label>Presentation<select data-deck>${catalog.map((item) => `<option value="${item.slug}" ${item.slug === deck.slug ? 'selected' : ''}>${escapeHtml(item.shortTitle)}</option>`).join('')}</select></label></div><div class="wb-sync-state"><span>Сканирование ${formatDate(snapshot.scannedAt)}</span><button class="wb-icon-button" type="button" data-refresh aria-label="Обновить workspace">${icon('refresh')}</button></div></header><div class="wb-app-content">${renderContent(product)}</div></section><div class="wb-toast" data-toast role="status" ${message ? '' : 'hidden'}>${escapeHtml(message)}</div></main>`
    setLocation()
    requestAnimationFrame(() => {
      fitSlides()
      root.querySelector<HTMLElement>('.wb-app-nav button.is-active')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' })
      if (activeSection === 'marketing' && marketingTab === 'flow') {
        root.querySelector<HTMLElement>('.wb-flow-recipes > button.is-active')?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' })
      }
    })
  }

  const fitSlides = (): void => {
    root.querySelectorAll<HTMLElement>('.wb-slide-stage').forEach((stage) => {
      const canvas = stage.querySelector<HTMLElement>('.wb-slide-canvas')
      if (!canvas) return
      const box = stage.getBoundingClientRect()
      const scale = Math.max(0.05, Math.min(box.width / 1440, box.height / 810))
      canvas.style.setProperty('--wb-console-scale', String(scale))
    })
  }

  const refresh = async (silent = false): Promise<void> => {
    if (flowDirty) {
      if (!silent) guardFlowTransition()
      return
    }
    if (!silent) { loading = true; error = ''; render() }
    try {
      const next = await fetchWorkspace()
      const signature = snapshotSignature(next)
      if (!silent || signature !== lastSignature) {
        snapshot = next
        lastSignature = signature
        selectedProductId = activeCatalogItem.productId
        loading = false; error = ''; render()
      }
    } catch (cause) {
      if (!silent) { loading = false; error = cause instanceof Error ? cause.message : 'Неизвестная ошибка'; render() }
    }
  }

  root.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement
    const sectionButton = target.closest<HTMLButtonElement>('[data-section]')
    if (sectionButton) {
      const nextSection = sectionButton.dataset.section as Section
      if (nextSection !== activeSection && guardFlowTransition()) return
      activeSection = nextSection; selectedPhotoId = ''; selectedLogoId = ''; render(); resetWorkspaceScroll(); return
    }
    const photoTabButton = target.closest<HTMLButtonElement>('[data-photo-tab]')
    if (photoTabButton) {
      const nextTab = photoTabButton.dataset.photoTab as PhotoTab
      if (nextTab !== photoTab && guardFlowTransition()) return
      photoTab = nextTab; render(); resetWorkspaceScroll(); return
    }
    const logoTabButton = target.closest<HTMLButtonElement>('[data-logo-tab]')
    if (logoTabButton) {
      const nextTab = logoTabButton.dataset.logoTab as LogoTab
      if (nextTab !== logoTab && guardFlowTransition()) return
      logoTab = nextTab; selectedLogoId = ''; render(); resetWorkspaceScroll(); return
    }
    const marketingTabButton = target.closest<HTMLButtonElement>('[data-marketing-tab]')
    if (marketingTabButton) {
      const nextTab = marketingTabButton.dataset.marketingTab as MarketingTab
      if (nextTab !== marketingTab && guardFlowTransition()) return
      marketingTab = nextTab; render(); resetWorkspaceScroll(); return
    }
    const photoCard = target.closest<HTMLButtonElement>('[data-photo-id]')
    if (photoCard) { selectedPhotoId = photoCard.dataset.photoId ?? ''; render(); return }
    const logoCard = target.closest<HTMLButtonElement>('[data-logo-id]')
    if (logoCard) { selectedLogoId = logoCard.dataset.logoId ?? ''; render(); return }
    const recipeButton = target.closest<HTMLButtonElement>('[data-recipe-id]')
    if (recipeButton) {
      if (recipeButton.dataset.recipeId !== selectedRecipeId && guardFlowTransition()) return
      selectedRecipeId = recipeButton.dataset.recipeId ?? ''; selectedFlowBlockId = ''; pendingBlockEdits.clear(); render(); return
    }
    const flowNode = target.closest<HTMLButtonElement>('[data-flow-node]')
    if (flowNode) {
      const editor = root.querySelector<HTMLTextAreaElement>('[data-flow-block-editor]')
      if (editor?.dataset.promptBlock) pendingBlockEdits.set(editor.dataset.promptBlock, editor.value)
      selectedFlowBlockId = flowNode.dataset.flowNode ?? ''; render(); return
    }
    if (target.closest('[data-flow-engine-node]')) {
      const select = root.querySelector<HTMLSelectElement>('[data-flow-engine-select]')
      select?.scrollIntoView({ block: 'center', behavior: flowScrollBehavior() }); select?.focus(); return
    }
    if (target.closest('[data-flow-references-node]')) {
      const details = root.querySelector<HTMLDetailsElement>('[data-flow-reference-details]')
      if (details) { details.open = true; details.scrollIntoView({ block: 'center', behavior: flowScrollBehavior() }); details.querySelector<HTMLElement>('summary')?.focus() }
      return
    }
    const documentButton = target.closest<HTMLButtonElement>('[data-document-kind]')
    if (documentButton) { selectedDocumentKind = documentButton.dataset.documentKind ?? ''; render(); return }
    const toneButton = target.closest<HTMLButtonElement>('[data-logo-tone]')
    if (toneButton) { logoTone = toneButton.dataset.logoTone as 'light' | 'dark'; render(); return }
    if (target.closest('[data-close-inspector]')) { selectedPhotoId = ''; selectedLogoId = ''; render(); return }
    if (target.closest('[data-refresh]')) {
      if (guardFlowTransition()) return
      await refresh(); syncMessage('Workspace пересканирован'); return
    }
    if (target.closest('[data-discard-flow]')) {
      pendingBlockEdits.clear(); flowDirty = false; selectedFlowBlockId = ''; await refresh(); syncMessage('Несохранённые изменения сброшены'); return
    }
    if (target.closest('[data-save-photo]')) {
      const product = currentProduct(); const asset = selectedPhoto()
      if (!product || !asset) return
      const previousAsset = structuredClone(asset)
      const status = root.querySelector<HTMLSelectElement>('[data-photo-edit-status]')?.value as PhotoAsset['status']
      const origin = root.querySelector<HTMLSelectElement>('[data-photo-edit-origin]')?.value as PhotoAsset['origin']
      const categories = [...root.querySelectorAll<HTMLInputElement>('[data-photo-category]:checked')].map((input, index) => ({ categoryId: input.value, role: root.querySelector<HTMLSelectElement>(`[data-photo-category-role="${input.value}"]`)?.value as PhotoAsset['categories'][number]['role'], sortOrder: index, confirmedByUser: true }))
      const slideIds = [...root.querySelectorAll<HTMLInputElement>('[data-photo-slide]:checked')].map((input) => input.value)
      const shotSlotIds = [...root.querySelectorAll<HTMLInputElement>('[data-photo-slot]:checked')].map((input) => input.value)
      Object.assign(asset, { status, origin, categories, slideIds, shotSlotIds, reviewedAt: new Date().toISOString() })
      if (await persist(() => savePhotodesign(product.productId, product.photodesign), 'Photodesign сохранён', () => Object.assign(asset, previousAsset))) render()
      return
    }
    if (target.closest('[data-save-logo]')) {
      const asset = selectedLogo(); if (!asset || !snapshot) return
      const previousAsset = structuredClone(asset)
      asset.status = root.querySelector<HTMLSelectElement>('[data-logo-edit-status]')?.value as LogoAsset['status']
      asset.assetType = root.querySelector<HTMLSelectElement>('[data-logo-edit-type]')?.value ?? asset.assetType
      asset.layout = root.querySelector<HTMLSelectElement>('[data-logo-edit-layout]')?.value ?? asset.layout
      asset.colorway = root.querySelector<HTMLSelectElement>('[data-logo-edit-colorway]')?.value ?? asset.colorway
      asset.transformPolicy = root.querySelector<HTMLSelectElement>('[data-logo-edit-transform]')?.value ?? asset.transformPolicy
      asset.backgroundCompatibility = [...root.querySelectorAll<HTMLInputElement>('[data-logo-background]:checked')].map((input) => input.value)
      asset.reviewedAt = new Date().toISOString()
      if (await persist(() => saveLogoCatalog(snapshot!.logoCatalog), 'Logo Library сохранена', () => Object.assign(asset, previousAsset))) render()
      return
    }
    if (target.closest('[data-copy-prompt], [data-copy-flow]')) {
      const value = root.querySelector<HTMLTextAreaElement>('[data-compiled-prompt]')?.value ?? ''
      await navigator.clipboard.writeText(value); syncMessage('Полный промпт скопирован'); return
    }
    if (target.closest('[data-save-prompt], [data-save-flow]')) {
      const product = currentProduct(); const recipe = selectedRecipe(); const system = product?.promptSystem
      if (!product || !recipe || !system) return
      const previousSystem = structuredClone(system)
      const changedBlockIds = new Set<string>()
      const editor = root.querySelector<HTMLTextAreaElement>('[data-flow-block-editor]')
      if (editor?.dataset.promptBlock) pendingBlockEdits.set(editor.dataset.promptBlock, editor.value)
      const edits = new Map(pendingBlockEdits)
      root.querySelectorAll<HTMLTextAreaElement>('[data-prompt-block]').forEach((input) => { if (input.dataset.promptBlock) edits.set(input.dataset.promptBlock, input.value) })
      edits.forEach((draft, blockId) => {
        const block = system.blocks.find((item) => item.blockId === blockId)
        const content = draft.trim()
        if (!block || !content || content === block.content) return
        block.content = content; block.version += 1; changedBlockIds.add(block.blockId)
        const reference = recipe.blockRefs.find((item) => item.blockId === block.blockId)
        if (reference) reference.version = block.version
      })
      recipe.engineProfileId = root.querySelector<HTMLSelectElement>('[data-flow-engine-select]')?.value ?? root.querySelector<HTMLSelectElement>('[data-recipe-engine]')?.value ?? recipe.engineProfileId
      const flowReferences = [...root.querySelectorAll<HTMLInputElement>('[data-flow-reference]:checked')]
      const classicReferences = [...root.querySelectorAll<HTMLInputElement>('[data-recipe-reference]:checked')]
      recipe.referenceAssetIds = (flowReferences.length || root.querySelector('[data-flow-reference]') ? flowReferences : classicReferences).map((input) => input.value)
      const profile = system.engineProfiles.find((item) => item.engineProfileId === recipe.engineProfileId)
      const compiledBlocks = recipe.blockRefs.map((reference) => system.blocks.find((block) => block.blockId === reference.blockId)).filter((block) => block?.enabled).map((block) => block!.content)
      recipe.compiledPrompt = [profile?.prefix, ...compiledBlocks, profile?.suffix]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
        .join('\n\n')
      recipe.updatedAt = new Date().toISOString(); recipe.compiledAt = recipe.updatedAt; recipe.status = 'ready'
      system.recipes.forEach((dependent) => {
        if (dependent.recipeId !== recipe.recipeId && dependent.blockRefs.some((reference) => changedBlockIds.has(reference.blockId))) { dependent.status = 'stale'; dependent.updatedAt = recipe.updatedAt }
      })
      system.updatedAt = recipe.updatedAt
      if (await persist(() => savePromptSystem(product.productId, system), 'Prompt recipe пересобран и сохранён', () => Object.assign(system, previousSystem))) { pendingBlockEdits.clear(); flowDirty = false; render() }
      return
    }
    if (target.closest('[data-link-generation]')) {
      const product = currentProduct(); const system = product?.promptSystem
      const asset = product?.photodesign.assets.find((item) => item.assetId === historyPhotoId)
      const recipe = system?.recipes.find((item) => item.recipeId === historyRecipeId)
      if (!product || !system || !asset || !recipe) return
      const profile = system.engineProfiles.find((item) => item.engineProfileId === recipe.engineProfileId)
      const now = new Date().toISOString()
      const previousAsset = structuredClone(asset)
      const recordId = `gen-${recipe.recipeId}-${asset.assetId}`
      asset.generationRecordId = recordId; asset.origin = 'generated'; asset.shotSlotIds = [...new Set([...asset.shotSlotIds, recipe.shotId])]
      if (!asset.categories.some((item) => item.categoryId === recipe.categoryId)) asset.categories.push({ categoryId: recipe.categoryId, role: 'alternate', sortOrder: asset.categories.length, confirmedByUser: true })
      const record: GenerationRecord = {
        schemaVersion: '1.0', recordId,
        productId: product.photodesign.productId, recipeId: recipe.recipeId, shotId: recipe.shotId,
        createdAt: now, status: 'completed', engine: { name: profile?.engine ?? recipe.engineProfileId, ...(profile?.model ? { model: profile.model } : {}), parameters: profile?.parameters ?? {} },
        promptSnapshot: { text: recipe.compiledPrompt, blockVersions: Object.fromEntries(recipe.blockRefs.map((reference) => [reference.blockId, reference.version])), referenceAssetIds: [...recipe.referenceAssetIds] },
        outputs: [{ assetId: asset.assetId, relativePath: asset.relativePath, status: 'linked' }],
      }
      if (!await persist(() => linkGenerationResult(product.productId, record, product.photodesign), 'Результат связан с prompt snapshot')) { Object.assign(asset, previousAsset); render(); return }
      historyPhotoId = ''; await refresh(); return
    }
    const variantButton = target.closest<HTMLButtonElement>('[data-save-variants]')
    if (variantButton && snapshot) {
      const brand = snapshot.logoCatalog.brands.find((item) => item.brandId === variantButton.dataset.saveVariants)
      const panel = variantButton.closest<HTMLElement>('[data-variant-brand]')
      if (!brand || !panel) return
      const previousBrand = structuredClone(brand)
      const preferred: Record<string, string> = {}
      panel.querySelectorAll<HTMLSelectElement>('[data-preferred-field]').forEach((select) => { if (select.value && select.dataset.preferredField) preferred[select.dataset.preferredField] = select.value })
      brand.preferred = preferred
      if (await persist(() => saveLogoCatalog(snapshot!.logoCatalog), 'Preferred variants сохранены', () => Object.assign(brand, previousBrand))) render()
      return
    }
    if (target.closest('[data-add-placement]') && snapshot) {
      const previousCatalog = structuredClone(snapshot.logoCatalog)
      const assetId = root.querySelector<HTMLSelectElement>('[data-placement-asset]')?.value ?? ''
      const slideId = root.querySelector<HTMLSelectElement>('[data-placement-slide]')?.value ?? ''
      const role = root.querySelector<HTMLSelectElement>('[data-placement-role]')?.value as LogoPlacement['role']
      const background = root.querySelector<HTMLSelectElement>('[data-placement-background]')?.value as LogoPlacement['background']
      const output = root.querySelector<HTMLSelectElement>('[data-placement-output]')?.value as LogoPlacement['output']
      const transform = root.querySelector<HTMLSelectElement>('[data-placement-transform]')?.value as LogoPlacement['transform']
      if (!assetId || !role) return
      snapshot.logoCatalog.placements.push({ placementId: `placement-${deck.slug}-${Date.now()}`, deckId: deck.slug, ...(slideId ? { slideId } : {}), assetId, role, background, output, transform, status: 'draft' })
      if (await persist(() => saveLogoCatalog(snapshot!.logoCatalog), 'Placement добавлен как draft', () => Object.assign(snapshot!.logoCatalog, previousCatalog))) render()
      return
    }
    const placementButton = target.closest<HTMLButtonElement>('[data-save-placement]')
    if (placementButton && snapshot) {
      const placement = snapshot.logoCatalog.placements.find((item) => item.placementId === placementButton.dataset.savePlacement)
      const row = placementButton.closest<HTMLElement>('[data-placement-id]')
      if (!placement || !row) return
      const previousPlacement = structuredClone(placement)
      const nextStatus = row.querySelector<HTMLSelectElement>('[data-placement-status]')?.value as LogoPlacement['status']
      const asset = snapshot.logoCatalog.assets.find((item) => item.assetId === placement.assetId)
      if (nextStatus === 'approved' && !placementIsCompatible(placement, asset)) { syncMessage('Нельзя утвердить: logo asset или placement несовместимы'); return }
      placement.status = nextStatus
      if (await persist(() => saveLogoCatalog(snapshot!.logoCatalog), 'Placement сохранён', () => Object.assign(placement, previousPlacement))) render()
      return
    }
    if (target.closest('[data-save-gates]')) {
      const product = currentProduct(); if (!product) return
      const previousExtensions = structuredClone(product.photodesign.extensions ?? {})
      const qualityGates: Record<string, boolean> = {}
      root.querySelectorAll<HTMLInputElement>('[data-quality-gate]').forEach((input) => { if (!input.disabled && input.dataset.qualityGate) qualityGates[input.dataset.qualityGate] = input.checked })
      product.photodesign.extensions = { ...(product.photodesign.extensions ?? {}), qualityGates }
      if (await persist(() => savePhotodesign(product.productId, product.photodesign), 'Quality gates сохранены', () => { product.photodesign.extensions = previousExtensions })) render()
      return
    }
    if (target.closest('[data-save-preset]')) {
      const name = root.querySelector<HTMLInputElement>('[data-preset-name]')?.value ?? ''
      savePreset(deck.slug, name, themeDraft); render(); syncMessage('Локальный пресет сохранён'); return
    }
    const presetButton = target.closest<HTMLButtonElement>('[data-load-preset]')
    if (presetButton) {
      const preset = readPresets(deck.slug).find((item) => item.id === presetButton.dataset.loadPreset)
      if (preset) { Object.assign(themeDraft, { theme: preset.theme, variant: preset.variant, colors: { ...preset.colors }, positions: { ...preset.positions } }); writeDraft(deck.slug, themeDraft); render() }
    }
  })

  root.addEventListener('keydown', (event) => {
    const currentTab = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-marketing-tab]')
    if (!currentTab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const currentIndex = marketingTabs.findIndex((tab) => tab.id === currentTab.dataset.marketingTab)
    const nextIndex = event.key === 'Home' ? 0
      : event.key === 'End' ? marketingTabs.length - 1
      : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + marketingTabs.length) % marketingTabs.length
    const nextTab = marketingTabs[nextIndex].id
    if (nextTab !== marketingTab && guardFlowTransition()) return
    marketingTab = nextTab
    render(); resetWorkspaceScroll()
    requestAnimationFrame(() => root.querySelector<HTMLButtonElement>(`[data-marketing-tab="${nextTab}"]`)?.focus())
  })

  root.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement | HTMLSelectElement
    if (target.matches('[data-product]')) {
      if (target.value !== selectedProductId && guardFlowTransition()) { target.value = selectedProductId; return }
      const productDeck = catalog.find((item) => item.productId === target.value)
      if (!productDeck) { target.value = selectedProductId; syncMessage('Для этого товара не зарегистрирована презентация.'); return }
      const next = new URL(window.location.href)
      next.searchParams.set('deck', productDeck.slug)
      next.searchParams.set('product', productDeck.productId)
      window.location.assign(next)
      return
    }
    if (target.matches('[data-deck]')) {
      if (target.value !== deck.slug && guardFlowTransition()) { target.value = deck.slug; return }
      const nextDeck = catalog.find((item) => item.slug === target.value)
      if (!nextDeck) { target.value = deck.slug; syncMessage('Неизвестная презентация.'); return }
      const next = new URL(window.location.href)
      next.searchParams.set('deck', nextDeck.slug)
      next.searchParams.set('product', nextDeck.productId)
      window.location.assign(next)
      return
    }
    if (target.matches('[data-photo-status-filter]')) { photoStatusFilter = target.value; render() }
    if (target.matches('[data-photo-category-filter]')) { photoCategoryFilter = target.value; render() }
    if (target.matches('[data-logo-brand-filter]')) { logoBrandFilter = target.value; render() }
    if (target.matches('[data-logo-status-filter]')) { logoStatusFilter = target.value; render() }
    if (target.matches('[data-logo-background-filter]')) { logoBackgroundFilter = target.value; render() }
    if (target.matches('[data-history-photo]')) { historyPhotoId = target.value }
    if (target.matches('[data-history-recipe]')) { historyRecipeId = target.value }
    if (target.matches('[data-flow-engine-select]')) {
      const recipe = selectedRecipe(); if (!recipe) return
      recipe.engineProfileId = target.value; flowDirty = true; render(); return
    }
    if (target.matches('[data-flow-block-toggle]')) {
      const product = currentProduct(); const recipe = selectedRecipe(); const system = product?.promptSystem
      if (!recipe || !system) return
      const selected = new Set(recipe.blockRefs.map((reference) => reference.blockId))
      if ((target as HTMLInputElement).checked) selected.add(target.value); else selected.delete(target.value)
      const rank: Record<PromptBlock['scope'], number> = { product: 0, category: 1, shot: 2, global: 3, negative: 4, engine: 5 }
      recipe.blockRefs = system.blocks.filter((block) => selected.has(block.blockId)).sort((a, b) => rank[a.scope] - rank[b.scope] || system.blocks.indexOf(a) - system.blocks.indexOf(b)).map((block) => ({ blockId: block.blockId, version: block.version }))
      if (!recipe.blockRefs.some((reference) => reference.blockId === selectedFlowBlockId)) selectedFlowBlockId = recipe.blockRefs[0]?.blockId ?? ''
      flowDirty = true; render(); return
    }
    if (target.matches('[data-flow-reference]')) {
      const recipe = selectedRecipe(); if (!recipe) return
      recipe.referenceAssetIds = [...root.querySelectorAll<HTMLInputElement>('[data-flow-reference]:checked')].map((input) => input.value)
      flowDirty = true
      const discard = root.querySelector<HTMLButtonElement>('[data-discard-flow]'); if (discard) discard.disabled = false
      return
    }
    if (target.matches('[data-theme]')) { themeDraft.theme = target.value as WbTheme; writeDraft(deck.slug, themeDraft); render() }
    if (target.matches('[data-variant]')) { themeDraft.variant = target.value as WbVariant; writeDraft(deck.slug, themeDraft); render() }
  })

  root.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement
    if (target.matches('[data-flow-block-editor]')) {
      const blockId = target.dataset.promptBlock
      if (blockId) pendingBlockEdits.set(blockId, target.value)
      flowDirty = true
      const discard = root.querySelector<HTMLButtonElement>('[data-discard-flow]'); if (discard) discard.disabled = false
      const product = currentProduct(); const recipe = selectedRecipe(); const system = product?.promptSystem
      const output = root.querySelector<HTMLTextAreaElement>('[data-compiled-prompt]')
      if (system && recipe && output) {
        output.value = compileRecipePreview(system, recipe)
        const meta = root.querySelector<HTMLElement>('[data-flow-output-meta]')
        if (meta) meta.textContent = `${output.value.length} знаков · несохранённая пересборка`
      }
      return
    }
    const token = target.dataset.token as EditableToken | undefined
    if (!token) return
    const value = target.value.trim()
    if (value) themeDraft.colors[token] = value; else delete themeDraft.colors[token]
    writeDraft(deck.slug, themeDraft); setTheme()
    const preview = root.querySelector<HTMLElement>('.wb-theme-preview')
    if (preview) preview.style.setProperty(token, value)
  })

  window.addEventListener('beforeunload', (event) => {
    if (!flowDirty) return
    event.preventDefault()
    event.returnValue = ''
  })

  setTheme()
  render()
  void refresh()
  window.setInterval(() => { if (!document.hidden) void refresh(true) }, 15_000)
  new ResizeObserver(() => fitSlides()).observe(root)
}
