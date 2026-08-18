import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveProductRoot, workspaceRoot } from './workspace-data.mjs'

const productId = process.argv[2] || 'garlando'
const productRoot = resolveProductRoot(productId)
const marketingRoot = path.join(productRoot, 'MARKETING')

const readJson = async (filePath) => JSON.parse(await readFile(filePath, 'utf8'))
const promptSystem = await readJson(path.join(marketingRoot, 'prompt_system.json'))
const photodesign = await readJson(path.join(productRoot, 'photodesign.json'))
const assetsById = new Map(photodesign.assets.map((asset) => [asset.assetId, asset.relativePath]))
const blocksById = new Map(promptSystem.blocks.map((block) => [block.blockId, block]))

const sourceDocument = promptSystem.extensions?.sourceDocument || `MARKETING/${productId}_Generation_Prompts.md`
const outputPath = path.join(productRoot, sourceDocument.replace(/^MARKETING[\\/]/, 'MARKETING/'))
const temporaryPath = `${outputPath}.tmp`
const lines = [
  `# Комплект промптов для ${productId}`,
  '',
  '> Этот файл автоматически экспортирован из `MARKETING/prompt_system.json`. Редактируемый source of truth — узлы и recipes в Prompt Flow.',
  '',
  `Обновлено: ${promptSystem.updatedAt}. Рецептов: ${promptSystem.recipes.length}.`,
  '',
  '## Как читать рецепт',
  '',
  'Каждый полный prompt собирается в порядке: Product Core → Category Master → Lighting / Environment → Shot Brief → Quality → Negative → Engine Adapter. Reference files перечислены отдельно и прикладываются к генератору вместе с текстом.',
  '',
]

for (const [index, recipe] of promptSystem.recipes.entries()) {
  const profile = promptSystem.engineProfiles.find((item) => item.engineProfileId === recipe.engineProfileId)
  const blockList = recipe.blockRefs.map((reference) => {
    const block = blocksById.get(reference.blockId)
    return `- ${block?.title || reference.blockId} — ${block?.scope || 'unknown'}, v${reference.version}`
  })
  const references = recipe.referenceAssetIds.map((assetId) => `- \`${assetsById.get(assetId) || assetId}\``)
  lines.push(
    `## ${String(index + 1).padStart(2, '0')}. ${recipe.title}`,
    '',
    `- Recipe: \`${recipe.recipeId}\``,
    `- Shot: \`${recipe.shotId}\``,
    `- Category: \`${recipe.categoryId}\``,
    `- Status: \`${recipe.status}\``,
    `- Engine: ${profile?.label || recipe.engineProfileId}`,
    '',
    '### Узлы',
    '',
    ...blockList,
    '',
    '### Reference files',
    '',
    ...(references.length ? references : ['- Референсы не выбраны.']),
    '',
    '### Full prompt',
    '',
    '```text',
    recipe.compiledPrompt.trim(),
    '```',
    '',
  )
}

await writeFile(temporaryPath, `${lines.join('\n')}\n`, 'utf8')
await rename(temporaryPath, outputPath)
console.log(`Exported ${promptSystem.recipes.length} prompts to ${path.relative(workspaceRoot, outputPath)}`)
