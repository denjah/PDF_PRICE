import { createHash } from 'node:crypto'
import { readFile, readdir, rename, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
export const systemRoot = path.resolve(scriptDir, '..')
export const workspaceRoot = path.resolve(systemRoot, '..')
export const photoRoot = path.join(workspaceRoot, 'PHOTOBASE')
export const logoRoot = path.join(workspaceRoot, 'LOGO')

const registeredProducts = [
  {
    productId: 'garlando',
    displayName: 'GARLANDO Image',
    productFolder: 'PHOTOBASE/GARLANDO',
    rootPath: path.join(photoRoot, 'GARLANDO'),
    photodesignSchema: '../../PRESENTATION SYSTEM/schemas/photodesign.schema.json',
    documents: {
      presentationTexts: 'MARKETING/GARLANDO_Image_Presentation_Texts.md',
      generationPrompts: 'MARKETING/GARLANDO_Image_Generation_Prompts.md',
    },
  },
  {
    productId: 'rasson-victory-ii-plus-white',
    displayName: 'RASSON Victory II Plus White',
    productFolder: 'PHOTOBASE/RASSON/Victory 2_white',
    rootPath: path.join(photoRoot, 'RASSON', 'Victory 2_white'),
    photodesignSchema: '../../../PRESENTATION SYSTEM/schemas/photodesign.schema.json',
    documents: {
      presentationTexts: 'MARKETING/Rasson_Victory_II_Plus_Presentation_Texts.md',
      generationPrompts: 'MARKETING/Rasson_Victory_II_Plus_Generation_Prompts.md',
    },
  },
]

const registeredProductById = new Map(registeredProducts.flatMap((product) => [
  [product.productId, product],
  [product.productFolder, product],
]))
export const resolveProductRoot = (productId) => {
  const product = registeredProductById.get(productId)
  if (!product) throw new Error(`Unknown workspace product: ${productId}`)
  return product.rootPath
}

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.psd', '.pdf'])
const logoExtensions = new Set(['.svg', '.png', '.pdf', '.ai', '.eps', '.cdr', '.psd', '.tif', '.tiff', '.jpg', '.jpeg'])
const mimeTypes = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.tif': 'image/tiff', '.tiff': 'image/tiff', '.pdf': 'application/pdf',
  '.psd': 'image/vnd.adobe.photoshop', '.ai': 'application/illustrator', '.eps': 'application/postscript',
  '.cdr': 'application/vnd.corel-draw',
}

const posix = (value) => value.split(path.sep).join('/')
const slug = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'asset'
const fingerprintCache = new Map()
const fingerprint = async (file) => {
  const state = await stat(file)
  const signature = `${state.size}:${state.mtimeMs}`
  const cached = fingerprintCache.get(file)
  if (cached?.signature === signature) return cached.hash
  const hash = createHash('sha256').update(await readFile(file)).digest('hex')
  fingerprintCache.set(file, { signature, hash })
  return hash
}
const readJson = async (file, fallback = null) => {
  try { return JSON.parse(await readFile(file, 'utf8')) } catch { return fallback }
}
const writeJsonAtomic = async (file, data) => {
  const temporary = `${file}.tmp`
  await writeFile(temporary, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  await rename(temporary, file)
}

const listFiles = async (root, extensions, excluded = new Set()) => {
  const result = []
  const walk = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || excluded.has(entry.name.toLowerCase())) continue
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) await walk(absolute)
      else if (extensions.has(path.extname(entry.name).toLowerCase())) result.push(absolute)
    }
  }
  await walk(root)
  return result.sort((a, b) => a.localeCompare(b, 'ru'))
}

const jpegSize = (buffer) => {
  let offset = 2
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue }
    const marker = buffer[offset + 1]
    const size = buffer.readUInt16BE(offset + 2)
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) }
    }
    if (size < 2) break
    offset += size + 2
  }
  return {}
}

const numericSvgValue = (value) => value ? Number.parseFloat(value.replace(/[^0-9.+-]/g, '')) : undefined
const imageInfo = async (file) => {
  const extension = path.extname(file).toLowerCase()
  const buffer = await readFile(file)
  if (extension === '.png' && buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
    return {
      width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20),
      transparency: [4, 6].includes(buffer[25]) ? 'yes' : 'unknown',
    }
  }
  if (extension === '.jpg' || extension === '.jpeg') return { ...jpegSize(buffer), transparency: 'no' }
  if (extension === '.svg') {
    const text = buffer.toString('utf8')
    const tag = text.match(/<svg\b[^>]*>/i)?.[0] ?? ''
    const width = numericSvgValue(tag.match(/\bwidth=["']([^"']+)/i)?.[1])
    const height = numericSvgValue(tag.match(/\bheight=["']([^"']+)/i)?.[1])
    const viewBox = tag.match(/\bviewBox=["']([^"']+)/i)?.[1]?.trim().split(/[ ,]+/).map(Number)
    return {
      width: width || (viewBox?.length === 4 ? viewBox[2] : undefined),
      height: height || (viewBox?.length === 4 ? viewBox[3] : undefined),
      transparency: 'yes',
      svgText: text,
    }
  }
  return { transparency: 'unknown' }
}

const layoutFrom = (width, height, fallback = 'unknown') => {
  if (!width || !height) return fallback
  const ratio = width / height
  if (ratio > 2.15) return 'horizontal'
  if (ratio < 0.72) return 'vertical'
  if (ratio > 0.88 && ratio < 1.14) return 'square'
  return 'freeform'
}

const brandDefinitions = {
  'european-pocket-billiard': { displayName: 'EPBF', kind: 'federation', aliases: ['European Pocket Billiard Federation'] },
  garlando: { displayName: 'Garlando', kind: 'manufacturer', aliases: ['Garlando S.p.A.'] },
  klematch: { displayName: 'Klematch', kind: 'technology-partner', aliases: ['KLEMATCH®'] },
  rasson: { displayName: 'Rasson', kind: 'manufacturer', aliases: ['Rasson Billiards'] },
  weekend: { displayName: 'Weekend Billiard', kind: 'house-brand', aliases: ['Weekend', 'Weekend Billiard Company'] },
  wpa: { displayName: 'WPA', kind: 'federation', aliases: ['World Pool Association'] },
  rodina: { displayName: 'РОДИНА Grand Hotel & SPA', kind: 'venue', aliases: ['РОДИНА'] },
  uglich: { displayName: 'Санаторий «Углич»', kind: 'venue', aliases: ['Углич санаторий'] },
  fbsr: { displayName: 'ФБСР', kind: 'federation', aliases: ['Федерация бильярдного спорта России'] },
}

const brandIdFor = (relativePath) => {
  const folder = relativePath.split('/')[0].toLowerCase()
  if (folder.includes('european')) return 'european-pocket-billiard'
  if (folder.includes('garlando')) return 'garlando'
  if (folder.includes('klematch')) return 'klematch'
  if (folder.includes('rasson')) return 'rasson'
  if (folder.includes('weekend')) return 'weekend'
  if (folder.includes('world pool')) return 'wpa'
  if (folder.includes('родина')) return 'rodina'
  if (folder.includes('углич')) return 'uglich'
  if (folder.includes('фбср')) return 'fbsr'
  return 'unknown-brand'
}

const logoSemantics = (relativePath, info) => {
  const lower = relativePath.toLowerCase()
  const brandId = brandIdFor(relativePath)
  const extension = path.extname(relativePath).slice(1).toLowerCase()
  const federation = ['european-pocket-billiard', 'wpa', 'fbsr'].includes(brandId)
  let assetType = federation ? 'certification' : brandId === 'klematch' ? 'badge' : 'lockup'
  if (brandId === 'weekend' && /ico/.test(lower)) assetType = 'symbol'
  if (/dsgn|design|codesign|codsgn/.test(lower)) assetType = 'subbrand'
  if (brandId === 'rasson' && /rasson_logo\.svg$/.test(lower)) assetType = 'wordmark'
  let colorway = federation || brandId === 'klematch' ? 'full-color' : 'dark'
  if (/white|бел|weekwnd logo/.test(lower)) colorway = 'mono-white'
  else if (/blue|gradient|фон/.test(lower)) colorway = 'brand-color'
  const backgroundCompatibility = colorway === 'mono-white'
    ? ['dark', 'photographic']
    : colorway === 'full-color'
      ? ['light', 'photographic']
      : ['light']
  const isSource = ['psd', 'cdr', 'ai', 'eps'].includes(extension)
  const usage = federation
    ? ['certification', 'partner-grid', 'web', 'pdf', 'print']
    : brandId === 'klematch'
      ? ['technical', 'partner-grid', 'web', 'pdf', 'print']
      : ['hero', 'header', 'footer', 'web', 'pdf', 'print']
  if (isSource) usage.push('reference-only')
  const transformPolicy = /rasson_logo\.svg$|weekend_logo\.svg$/i.test(relativePath)
    ? 'recolor-approved'
    : isSource ? 'convert-only' : 'forbidden'
  const descriptionByBrand = {
    garlando: 'Горизонтальный фирменный знак Garlando с символом и дескриптором Leader in pool and football tables.',
    klematch: 'Фирменный бейдж Klematch Made in France для материалов о профессиональной бортовой резине.',
    rasson: 'Фирменный знак Rasson / Rasson Billiards.',
    weekend: 'Вариант фирменной системы Weekend Billiard.',
    'european-pocket-billiard': 'Официальный круглый знак EPBF для блока спортивной сертификации.',
    wpa: 'Официальный знак World Pool Association для блока спортивного признания.',
    fbsr: 'Официальный знак Федерации бильярдного спорта России.',
    rodina: 'Логотип партнёрского объекта РОДИНА Grand Hotel & SPA.',
    uglich: 'Логотип санатория «Углич» с доступными светлой и тёмной композициями в исходниках.',
  }
  const auditedOverride = {
    'Garlando/Garlando_black.svg': {
      assetType: 'lockup', layout: 'horizontal', colorway: 'dark',
      backgroundCompatibility: ['light'], transformPolicy: 'forbidden',
      description: 'Чёрный горизонтальный знак Garlando: символ и леттеринг на прозрачном фоне.',
    },
    'Garlando/Garlando_red.svg': {
      assetType: 'lockup', layout: 'horizontal', colorway: 'brand-color',
      backgroundCompatibility: ['light'], transformPolicy: 'forbidden',
      description: 'Красный горизонтальный знак Garlando с русским дескриптором «Лидер в производстве футбольных и бильярдных столов».',
    },
    'Garlando/Garlando_orig_site.png': {
      assetType: 'lockup', layout: 'horizontal', colorway: 'mono-white',
      backgroundCompatibility: ['dark', 'photographic'], transformPolicy: 'forbidden',
      description: 'Белый горизонтальный знак Garlando на прозрачном фоне; растровый web-вариант 250×58 px.',
    },
    'Garlando/Garlando.ai': {
      assetType: 'lockup', layout: 'unknown', colorway: 'unknown',
      backgroundCompatibility: ['unknown'], transformPolicy: 'convert-only',
      description: 'Редактируемый Adobe Illustrator master Garlando; визуальная версия требует экспорта и ручной проверки.',
    },
  }[relativePath]
  return {
    brandId, format: extension === 'tif' ? 'tif' : extension, isVector: ['svg', 'pdf', 'ai', 'eps', 'cdr'].includes(extension),
    assetType, layout: layoutFrom(info.width, info.height, federation ? 'round' : 'unknown'), colorway,
    backgroundCompatibility, usage: [...new Set(usage)], transformPolicy,
    description: descriptionByBrand[brandId] ?? 'Неидентифицированный бренд-ассет.',
    ...(auditedOverride ?? {}),
  }
}

const preferredNames = {
  weekend: { light: 'WEEKEND_LOGO_BASEVERSION.svg', dark: 'Weekwnd logo.svg', print: 'WEEKEND_LOGO.svg' },
  rasson: { light: 'Rasson_logo.svg', dark: 'Rasson_logo.svg', print: 'Rasson_logo.svg' },
  garlando: { light: 'Garlando_black.svg', dark: 'Garlando_orig_site.png', print: 'Garlando_black.svg' },
  'european-pocket-billiard': { light: 'European pocket billiard.svg', dark: 'European pocket billiard.png', print: 'European pocket billiard.svg' },
  wpa: { light: 'World_Pool_Association_idCsjZKm0e_0.png', dark: 'World_Pool_Association_idCsjZKm0e_0.png', print: 'World_Pool_Association_idCsjZKm0e_0.png' },
  klematch: { light: 'Klematch_logo.svg', dark: 'Klematch_logo.png', print: 'Klematch_logo.svg' },
  fbsr: { light: 'ФБСР_logo.svg', dark: 'ФБСР_logo.svg', print: 'ФБСР_logo.svg' },
  uglich: { light: 'Безымянный-1.svg', dark: 'Безымянный-1.svg', print: 'Безымянный-1.svg' },
  rodina: { light: 'logo.pdf', dark: 'logo.pdf', print: 'logo.pdf' },
}

export const auditLogoLibrary = async () => {
  const catalogPath = path.join(logoRoot, 'logo_catalog.json')
  const previous = await readJson(catalogPath, { assets: [], placements: [] })
  const previousByPath = new Map((previous.assets ?? []).map((asset) => [asset.relativePath, asset]))
  const previousByFingerprint = new Map()
  for (const asset of previous.assets ?? []) {
    const hash = asset.fileState?.fingerprint
    if (!hash) continue
    const matches = previousByFingerprint.get(hash) ?? []
    matches.push(asset)
    previousByFingerprint.set(hash, matches)
  }
  const files = await listFiles(logoRoot, logoExtensions, new Set(['cache', 'previews']))
  const currentFingerprints = new Map()
  const currentFingerprintCounts = new Map()
  for (const file of files) {
    const hash = await fingerprint(file)
    currentFingerprints.set(file, hash)
    currentFingerprintCounts.set(hash, (currentFingerprintCounts.get(hash) ?? 0) + 1)
  }
  const consumedAssetIds = new Set()
  const assets = []
  for (const file of files) {
    const relativePath = posix(path.relative(logoRoot, file))
    const state = await stat(file)
    const hash = currentFingerprints.get(file)
    const info = await imageInfo(file)
    const fingerprintMatches = previousByFingerprint.get(hash) ?? []
    const moveCandidate = currentFingerprintCounts.get(hash) === 1 && fingerprintMatches.length === 1 && !consumedAssetIds.has(fingerprintMatches[0].assetId) ? fingerprintMatches[0] : undefined
    const previousAsset = previousByPath.get(relativePath) ?? moveCandidate
    if (previousAsset) consumedAssetIds.add(previousAsset.assetId)
    const semantics = logoSemantics(relativePath, info)
    const changed = previousAsset && previousAsset.fileState?.fingerprint !== hash
    const status = changed && previousAsset.status === 'approved' ? 'stale' : previousAsset?.status ?? 'new'
    assets.push({
      assetId: previousAsset?.assetId ?? `logo-${semantics.brandId}-${slug(path.basename(relativePath, path.extname(relativePath)))}-${hash.slice(0, 8)}`,
      relativePath, brandId: semantics.brandId, status,
      detectedAt: previousAsset?.detectedAt ?? state.birthtime.toISOString(),
      ...(previousAsset?.reviewedAt ? { reviewedAt: previousAsset.reviewedAt } : {}),
      fileState: {
        sizeBytes: state.size, modifiedAt: state.mtime.toISOString(), fingerprint: hash,
        ...(info.width ? { width: info.width } : {}), ...(info.height ? { height: info.height } : {}),
        mimeType: mimeTypes[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      },
      format: semantics.format, isVector: semantics.isVector, transparency: info.transparency,
      assetType: previousAsset?.assetType ?? semantics.assetType,
      layout: previousAsset?.layout ?? semantics.layout,
      colorway: previousAsset?.colorway ?? semantics.colorway,
      backgroundCompatibility: previousAsset?.backgroundCompatibility ?? semantics.backgroundCompatibility,
      usage: previousAsset?.usage ?? semantics.usage,
      transformPolicy: previousAsset?.transformPolicy ?? semantics.transformPolicy,
      description: previousAsset?.description ?? semantics.description,
      ...(previousAsset?.notes ? { notes: previousAsset.notes } : {}),
      extensions: { auditBasis: 'technical-scan-and-visual-catalog', requiresUserApproval: status !== 'approved' },
    })
  }
  const approvedAssetByBrandAndName = new Map(assets
    .filter((asset) => asset.status === 'approved')
    .map((asset) => [`${asset.brandId}:${path.basename(asset.relativePath).toLowerCase()}`, asset.assetId]))
  const brands = Object.entries(brandDefinitions).map(([brandId, definition]) => {
    const assetIds = assets.filter((asset) => asset.brandId === brandId).map((asset) => asset.assetId)
    const names = preferredNames[brandId]
    const preferred = names ? {
      lightBackgroundAssetId: approvedAssetByBrandAndName.get(`${brandId}:${names.light.toLowerCase()}`),
      darkBackgroundAssetId: approvedAssetByBrandAndName.get(`${brandId}:${names.dark.toLowerCase()}`),
      printAssetId: approvedAssetByBrandAndName.get(`${brandId}:${names.print.toLowerCase()}`),
      fallbackAssetId: assets.find((asset) => asset.brandId === brandId && asset.status === 'approved')?.assetId,
    } : { fallbackAssetId: assets.find((asset) => asset.brandId === brandId && asset.status === 'approved')?.assetId }
    return { brandId, ...definition, assetIds, preferred: Object.fromEntries(Object.entries(preferred).filter(([, value]) => value)) }
  }).filter((brand) => brand.assetIds.length)
  return {
    $schema: '../PRESENTATION SYSTEM/schemas/logo-catalog.schema.json', schemaVersion: '1.0',
    libraryId: 'weekend-logo-library', rootFolder: 'LOGO', updatedAt: new Date().toISOString(),
    brands, assets, placements: previous.placements ?? [], extensions: { auditStatus: 'review-required', assetCount: assets.length },
  }
}

const auditedPhotos = {
  'ИСХОДНИКИ/source_product_white_full.jpg': { origin: 'source', categories: ['studio-white', 'hero-cover'], summary: 'Низкокачественный референс стола целиком на белом фоне.' },
  'ИСХОДНИКИ/source_lifestyle_classic_room.jpg': { origin: 'source', categories: ['interior', 'in-use', 'lifestyle'], summary: 'Низкокачественный lifestyle-референс масштаба и отражений.' },
  'ИСХОДНИКИ/source_detail_cabinet_goal.jpg': { origin: 'source', categories: ['detail-macro', 'technical'], summary: 'Низкокачественный референс углового узла, корпуса и рукояток.' },
  'ИСХОДНИКИ/source_detail_players_springs.jpg': { origin: 'source', categories: ['detail-macro', 'technical'], summary: 'Низкокачественный референс игрового поля, фигурок и пружин.' },
  'ИСХОДНИКИ/source_detail_playfield_overhead.jpg': { origin: 'source', categories: ['technical', 'detail-macro'], summary: 'Низкокачественный верхний обзор поля и конструкции.' },
  'ИСХОДНИКИ/source_detail_handle_bearing.jpg': { origin: 'source', categories: ['detail-macro'], summary: 'Низкокачественный референс рукоятки и подшипниковой розетки.' },
}

const readPhotoAudit = async (productPath) => {
  try {
    const content = await readFile(path.join(productPath, 'photos_description.md'), 'utf8')
    const result = new Map()
    const headingPattern = /^###\s+📷\s+`([^`]+)`(?:\s+[—-]\s+(.+))?$/gm
    for (const match of content.matchAll(headingPattern)) {
      result.set(match[1], { heading: `📷 ${match[1]}`, summary: match[2]?.trim() ?? 'Описание доступно в photos_description.md.' })
    }
    return result
  } catch { return new Map() }
}

export const scanProduct = async (product) => {
  const productPath = product.rootPath
  const catalogPath = path.join(productPath, 'photodesign.json')
  const previous = await readJson(catalogPath, { assets: [], collections: [] })
  const documentedAudits = await readPhotoAudit(productPath)
  const previousByPath = new Map((previous.assets ?? []).map((asset) => [asset.relativePath, asset]))
  const previousByFingerprint = new Map()
  for (const asset of previous.assets ?? []) {
    const hash = asset.fileState?.fingerprint
    if (!hash) continue
    const matches = previousByFingerprint.get(hash) ?? []
    matches.push(asset)
    previousByFingerprint.set(hash, matches)
  }
  const files = await listFiles(productPath, imageExtensions, new Set(['marketing', 'cache', 'previews']))
  const currentFingerprints = new Map()
  const currentFingerprintCounts = new Map()
  for (const file of files) {
    const hash = await fingerprint(file)
    currentFingerprints.set(file, hash)
    currentFingerprintCounts.set(hash, (currentFingerprintCounts.get(hash) ?? 0) + 1)
  }
  const consumedAssetIds = new Set()
  const assets = []
  for (const file of files) {
    const relativePath = posix(path.relative(productPath, file))
    const state = await stat(file)
    const hash = currentFingerprints.get(file)
    const info = await imageInfo(file)
    const fingerprintMatches = previousByFingerprint.get(hash) ?? []
    const moveCandidate = currentFingerprintCounts.get(hash) === 1 && fingerprintMatches.length === 1 && !consumedAssetIds.has(fingerprintMatches[0].assetId) ? fingerprintMatches[0] : undefined
    const prior = previousByPath.get(relativePath) ?? moveCandidate
    if (prior) consumedAssetIds.add(prior.assetId)
    const legacyAudit = auditedPhotos[relativePath]
    const documentedAudit = documentedAudits.get(relativePath)
    const changed = prior && prior.fileState?.fingerprint !== hash
    const consoleOnly = relativePath.toLocaleLowerCase('ru-RU').startsWith('исходники/')
    const categories = consoleOnly
      ? (prior?.categories ?? []).map((item) => ({ ...item, role: 'reference-only', confirmedByUser: true }))
      : prior?.categories ?? []
    assets.push({
      assetId: prior?.assetId ?? `photo-${product.productId}-${slug(path.basename(relativePath, path.extname(relativePath)))}-${hash.slice(0, 8)}`,
      relativePath, origin: consoleOnly ? 'source' : prior?.origin ?? 'unclassified',
      status: consoleOnly ? 'review' : changed && prior.status === 'approved' ? 'stale' : prior?.status ?? 'new',
      detectedAt: prior?.detectedAt ?? state.birthtime.toISOString(),
      ...(prior?.reviewedAt ? { reviewedAt: prior.reviewedAt } : {}),
      fileState: {
        sizeBytes: state.size, modifiedAt: state.mtime.toISOString(), fingerprint: hash,
        ...(info.width ? { width: info.width } : {}), ...(info.height ? { height: info.height } : {}),
        mimeType: mimeTypes[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
      },
      categories,
      ...(documentedAudit ? { audit: { document: 'photos_description.md', ...documentedAudit } } : prior?.audit ? { audit: prior.audit } : {}),
      shotSlotIds: prior?.shotSlotIds ?? [], slideIds: prior?.slideIds ?? [], collectionIds: prior?.collectionIds ?? [],
      ...(prior?.generationRecordId ? { generationRecordId: prior.generationRecordId } : {}),
      ...(prior?.notes ? { notes: prior.notes } : {}),
      extensions: {
        ...(prior?.extensions ?? {}),
        suggestedCategories: legacyAudit?.categories ?? [],
        requiresUserConfirmation: consoleOnly ? false : true,
        presentationEligible: !consoleOnly,
        consoleOnly,
      },
    })
  }
  return {
    $schema: product.photodesignSchema, schemaVersion: '1.0',
    productId: product.productId, productFolder: product.productFolder,
    updatedAt: new Date().toISOString(), assets, collections: previous.collections ?? [], extensions: previous.extensions ?? {},
  }
}

const findProductFolders = async () => {
  const result = []
  const walk = async (directory, depth = 0) => {
    if (depth > 4) return
    const entries = await readdir(directory, { withFileTypes: true })
    const names = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name.toLowerCase()))
    if (names.has('specification.md') || names.has('photos_description.md')) {
      result.push(posix(path.relative(photoRoot, directory)))
      return
    }
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name.toLowerCase() !== 'marketing') {
        await walk(path.join(directory, entry.name), depth + 1)
      }
    }
  }
  await walk(photoRoot)
  return result.sort((a, b) => a.localeCompare(b, 'ru'))
}

const readProductDocuments = async (product) => {
  const productPath = product.rootPath
  const candidates = [
    ['specification', 'specification.md'], ['photo-audit', 'photos_description.md'],
    ['product-analysis', 'MARKETING/product_analysis.md'],
  ]
  if (product.documents?.presentationTexts) candidates.push(['presentation-texts', product.documents.presentationTexts])
  if (product.documents?.generationPrompts) candidates.push(['generation-prompts', product.documents.generationPrompts])
  const marketing = path.join(productPath, 'MARKETING')
  try {
    for (const entry of await readdir(marketing, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue
      if (/presentation_texts/i.test(entry.name)) candidates.push(['presentation-texts', `MARKETING/${entry.name}`])
      if (/generation_prompts/i.test(entry.name)) candidates.push(['generation-prompts', `MARKETING/${entry.name}`])
    }
  } catch { /* no marketing folder */ }
  const seen = new Set()
  const documents = []
  for (const [kind, relativePath] of candidates) {
    if (seen.has(kind)) continue
    try {
      const content = await readFile(path.join(productPath, relativePath), 'utf8')
      documents.push({ kind, relativePath: posix(relativePath), title: content.match(/^#\s+(.+)$/m)?.[1] ?? relativePath, content })
      seen.add(kind)
    } catch { /* optional document */ }
  }
  return documents
}

const readGenerationHistory = async (product) => {
  const file = path.join(product.rootPath, 'MARKETING', 'generation_history.jsonl')
  try {
    const content = await readFile(file, 'utf8')
    const records = []
    const issues = []
    content.split(/\r?\n/).forEach((line, index) => {
      if (!line) return
      try { records.push(JSON.parse(line)) }
      catch (error) { issues.push({ line: index + 1, message: error instanceof Error ? error.message : 'Invalid JSONL record' }) }
    })
    return { records, issues }
  } catch { return { records: [], issues: [] } }
}

export const buildWorkspaceSnapshot = async () => {
  const logoCatalog = await auditLogoLibrary()
  const products = []
  for (const product of registeredProducts) {
    const photodesign = await scanProduct(product)
    const productPath = product.rootPath
    const generationHistory = await readGenerationHistory(product)
    products.push({
      productId: photodesign.productId, displayName: product.displayName, productFolder: product.productFolder,
      photodesign, documents: await readProductDocuments(product),
      shotPlan: await readJson(path.join(productPath, 'MARKETING', 'shot_plan.json'), null),
      promptSystem: await readJson(path.join(productPath, 'MARKETING', 'prompt_system.json'), null),
      generationHistory: generationHistory.records,
      generationHistoryIssues: generationHistory.issues,
      generationHistoryExists: generationHistory.records.length > 0,
    })
  }
  return { schemaVersion: '1.0', scannedAt: new Date().toISOString(), products, logoCatalog }
}

export const writeLogoCatalog = async (catalog) => writeJsonAtomic(path.join(logoRoot, 'logo_catalog.json'), catalog)
export const writePhotodesign = async (productId, value) => writeJsonAtomic(path.join(resolveProductRoot(productId), 'photodesign.json'), value)
export const writePromptSystem = async (productId, value) => writeJsonAtomic(path.join(resolveProductRoot(productId), 'MARKETING', 'prompt_system.json'), value)

if (process.argv.includes('--write')) {
  const logoCatalog = await auditLogoLibrary()
  await writeLogoCatalog(logoCatalog)
  for (const product of registeredProducts) await writePhotodesign(product.productId, await scanProduct(product))
  const snapshot = await buildWorkspaceSnapshot()
  console.log(`Indexed ${snapshot.logoCatalog.assets.length} logo assets and ${snapshot.products.reduce((sum, item) => sum + item.photodesign.assets.length, 0)} product images across ${snapshot.products.length} product folders.`)
}
