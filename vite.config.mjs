import { appendFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'vite'
import {
  buildWorkspaceSnapshot,
  logoRoot,
  resolveProductRoot,
  writeLogoCatalog,
  writePhotodesign,
  writePromptSystem,
} from './scripts/workspace-data.mjs'

const contentType = (file) => ({
  '.svg': 'image/svg+xml; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.tif': 'image/tiff', '.tiff': 'image/tiff', '.pdf': 'application/pdf', '.psd': 'image/vnd.adobe.photoshop',
}[path.extname(file).toLowerCase()] ?? 'application/octet-stream')

const json = (response, status, value) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(value))
}

const readBody = async (request) => {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > 5_000_000) throw new Error('Request body is too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

const safeResolve = (root, relativePath) => {
  if (!relativePath || path.isAbsolute(relativePath)) throw new Error('A safe relative path is required')
  const resolved = path.resolve(root, relativePath)
  const prefix = `${path.resolve(root)}${path.sep}`.toLowerCase()
  if (!`${resolved}${path.sep}`.toLowerCase().startsWith(prefix)) throw new Error('Path escapes the allowed workspace root')
  return resolved
}

const validateApprovedPlacements = (catalog) => {
  const assets = new Map(catalog.assets.map((asset) => [asset.assetId, asset]))
  for (const placement of catalog.placements) {
    if (!placement.background || !placement.output || !placement.transform) throw new Error(`Placement ${placement.placementId} lacks compatibility data`)
    if (placement.status !== 'approved') continue
    const asset = assets.get(placement.assetId)
    const backgroundOk = asset?.backgroundCompatibility?.some((value) => value === placement.background || value === 'any')
    const outputOk = asset?.usage?.includes(placement.output)
    const transformOk = placement.transform === 'none' || (placement.transform === 'recolor' && asset?.transformPolicy === 'recolor-approved') || (placement.transform === 'convert' && ['convert-only', 'recolor-approved'].includes(asset?.transformPolicy))
    const roleOk = (placement.role !== 'certification' || ['certification', 'badge'].includes(asset?.assetType)) && (!['primary-brand', 'manufacturer'].includes(placement.role) || asset?.assetType !== 'certification')
    if (!asset || asset.status !== 'approved' || !backgroundOk || !outputOk || !transformOk || !roleOk) throw new Error(`Approved placement ${placement.placementId} references an unapproved or incompatible asset`)
  }
}

const workspaceApi = () => ({
  name: 'weekend-workspace-api',
  configureServer(server) {
    server.middlewares.use(async (request, response, next) => {
      if (!request.url?.startsWith('/api/')) return next()
      try {
        const url = new URL(request.url, 'http://127.0.0.1')
        if (request.method === 'GET' && url.pathname === '/api/health') {
          return json(response, 200, { ok: true, mode: 'local-workspace', time: new Date().toISOString() })
        }
        if (request.method === 'GET' && url.pathname === '/api/workspace') {
          return json(response, 200, await buildWorkspaceSnapshot())
        }
        if (request.method === 'GET' && url.pathname === '/api/asset') {
          const scope = url.searchParams.get('scope')
          const relativePath = url.searchParams.get('path')
          const product = url.searchParams.get('product')
          const base = scope === 'logo' ? logoRoot : product ? resolveProductRoot(product) : null
          if (!base) return json(response, 400, { error: 'Unknown asset scope' })
          const file = safeResolve(base, relativePath)
          response.statusCode = 200
          response.setHeader('Content-Type', contentType(file))
          response.setHeader('Cache-Control', 'no-cache')
          response.end(await readFile(file))
          return
        }
        if (request.method === 'POST' && url.pathname === '/api/logo-catalog') {
          const body = await readBody(request)
          if (body?.schemaVersion !== '1.0' || !Array.isArray(body.assets) || !Array.isArray(body.brands)) throw new Error('Invalid logo catalog payload')
          validateApprovedPlacements(body)
          body.updatedAt = new Date().toISOString()
          await writeLogoCatalog(body)
          return json(response, 200, { ok: true, updatedAt: body.updatedAt })
        }
        if (request.method === 'POST' && url.pathname === '/api/photodesign') {
          const product = url.searchParams.get('product')
          if (!product) throw new Error('Product id is required')
          resolveProductRoot(product)
          const body = await readBody(request)
          if (body?.schemaVersion !== '1.0' || !Array.isArray(body.assets)) throw new Error('Invalid photodesign payload')
          body.updatedAt = new Date().toISOString()
          await writePhotodesign(product, body)
          return json(response, 200, { ok: true, updatedAt: body.updatedAt })
        }
        if (request.method === 'POST' && url.pathname === '/api/prompt-system') {
          const product = url.searchParams.get('product')
          if (!product) throw new Error('Product id is required')
          resolveProductRoot(product)
          const body = await readBody(request)
          if (body?.schemaVersion !== '1.0' || !Array.isArray(body.blocks) || !Array.isArray(body.recipes)) throw new Error('Invalid prompt-system payload')
          body.updatedAt = new Date().toISOString()
          await writePromptSystem(product, body)
          return json(response, 200, { ok: true, updatedAt: body.updatedAt })
        }
        if (request.method === 'POST' && url.pathname === '/api/link-generation') {
          const product = url.searchParams.get('product')
          if (!product) throw new Error('Product id is required')
          const productPath = resolveProductRoot(product)
          const payload = await readBody(request)
          const body = payload?.record
          const photodesign = payload?.photodesign
          if (body?.schemaVersion !== '1.0' || !body.recordId || !body.recipeId || !body.promptSnapshot || !Array.isArray(body.outputs)) throw new Error('Invalid generation record payload')
          if (photodesign?.schemaVersion !== '1.0' || !Array.isArray(photodesign.assets)) throw new Error('Invalid photodesign payload')
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.recordId)) throw new Error('Invalid generation record id')
          const output = body.outputs[0]
          const linkedAsset = output && photodesign.assets.find((asset) => asset.assetId === output.assetId)
          if (!linkedAsset || linkedAsset.generationRecordId !== body.recordId || linkedAsset.origin !== 'generated') throw new Error('Photodesign link does not match generation record')
          const historyFile = safeResolve(productPath, 'MARKETING/generation_history.jsonl')
          const existing = await readFile(historyFile, 'utf8').catch(() => '')
          const existingRecord = existing.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line)).find((record) => record.recordId === body.recordId)
          if (existingRecord && (existingRecord.recipeId !== body.recipeId || existingRecord.outputs?.[0]?.assetId !== output.assetId)) throw new Error('Generation record id conflicts with another link')
          if (!existingRecord) await appendFile(historyFile, `${JSON.stringify(body)}\n`, 'utf8')
          photodesign.updatedAt = new Date().toISOString()
          await writePhotodesign(product, photodesign)
          return json(response, 200, { ok: true, recordId: body.recordId })
        }
        return json(response, 404, { error: 'Unknown workspace endpoint' })
      } catch (error) {
        console.error('[workspace-api]', error)
        return json(response, 400, { error: error instanceof Error ? error.message : 'Workspace API error' })
      }
    })
  },
})

export default defineConfig({
  plugins: [workspaceApi()],
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4174, strictPort: true },
})
