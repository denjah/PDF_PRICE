import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { logoRoot, resolveProductRoot } from './workspace-data.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const systemRoot = path.resolve(scriptDir, '..')
const workspaceRoot = path.resolve(systemRoot, '..')
const ajv = new Ajv2020({ allErrors: true, strict: false })
addFormats(ajv)

const productIds = ['garlando', 'rasson-victory-ii-plus-white']
const contracts = [['logo-catalog.schema.json', path.join(logoRoot, 'logo_catalog.json')]]
const deckFiles = [path.join(systemRoot, 'content', 'decks', 'garlando-image', 'deck.json')]
const generationSchema = JSON.parse(await readFile(path.join(systemRoot, 'schemas', 'generation-record.schema.json'), 'utf8'))
const validateGenerationRecord = ajv.compile(generationSchema)
for (const productId of productIds) {
  const productRoot = resolveProductRoot(productId)
  contracts.push(
    ['photodesign.schema.json', path.join(productRoot, 'photodesign.json')],
    ['shot-plan.schema.json', path.join(productRoot, 'MARKETING', 'shot_plan.json')],
    ['prompt-system.schema.json', path.join(productRoot, 'MARKETING', 'prompt_system.json')],
  )
}

const compileRecipe = (promptSystem, recipe) => {
  const profile = promptSystem.engineProfiles.find((item) => item.engineProfileId === recipe.engineProfileId)
  const blocks = recipe.blockRefs
    .map((reference) => promptSystem.blocks.find((block) => block.blockId === reference.blockId))
    .filter((block) => block?.enabled)
    .map((block) => block.content)
  return [profile?.prefix, ...blocks, profile?.suffix]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join('\n\n')
}

let failures = 0
const validators = new Map()
for (const deckFile of deckFiles) {
  const deck = JSON.parse(await readFile(deckFile, 'utf8'))
  const forbidden = deck.slides.flatMap((slide) => slide.media ?? []).filter((asset) => /(^|[\\/])ИСХОДНИКИ([\\/]|$)/iu.test(asset.sourcePath ?? ''))
  if (forbidden.length) {
    failures += forbidden.length
    console.error(`FAIL console-only photo leaked into deck (${path.basename(path.dirname(deckFile))}) → ${forbidden.map((asset) => asset.id).join(', ')}`)
  } else console.log(`PASS console-only photo exclusion → ${path.relative(workspaceRoot, deckFile)}`)
}
for (const [schemaName, dataFile] of contracts) {
  const data = JSON.parse(await readFile(dataFile, 'utf8'))
  let validate = validators.get(schemaName)
  if (!validate) {
    const schema = JSON.parse(await readFile(path.join(systemRoot, 'schemas', schemaName), 'utf8'))
    validate = ajv.compile(schema)
    validators.set(schemaName, validate)
  }
  if (validate(data)) console.log(`PASS ${schemaName} → ${path.relative(workspaceRoot, dataFile)}`)
  else { failures += 1; console.error(`FAIL ${schemaName}`, validate.errors) }
}

for (const productId of productIds) {
  const productRoot = resolveProductRoot(productId)
  const promptSystemFile = path.join(productRoot, 'MARKETING', 'prompt_system.json')
  const promptSystem = JSON.parse(await readFile(promptSystemFile, 'utf8'))
  const driftedRecipes = promptSystem.recipes.filter((recipe) => recipe.compiledPrompt !== compileRecipe(promptSystem, recipe))
  if (driftedRecipes.length) {
    failures += driftedRecipes.length
    console.error(`FAIL prompt compiler drift (${productId}) → ${driftedRecipes.map((recipe) => recipe.recipeId).join(', ')}`)
  } else console.log(`PASS prompt compiler (${productId}) → ${promptSystem.recipes.length} reproducible recipes`)

  const historyFile = path.join(productRoot, 'MARKETING', 'generation_history.jsonl')
  try {
    const lines = (await readFile(historyFile, 'utf8')).split(/\r?\n/).filter(Boolean)
    lines.forEach((line, index) => {
      try {
        const valid = validateGenerationRecord(JSON.parse(line))
        if (!valid) { failures += 1; console.error(`FAIL ${productId}/generation_history.jsonl:${index + 1}`, validateGenerationRecord.errors) }
      } catch (error) { failures += 1; console.error(`FAIL ${productId}/generation_history.jsonl:${index + 1}`, error) }
    })
    console.log(`PASS generation_history.jsonl (${productId}) → ${lines.length} records`)
  } catch (error) {
    if (error?.code !== 'ENOENT') { failures += 1; console.error(`FAIL generation_history.jsonl (${productId})`, error) }
    else console.log(`PASS generation_history.jsonl (${productId}) → not created yet`)
  }
}

if (failures) process.exitCode = 1
else console.log('Workspace schema validation passed.')
