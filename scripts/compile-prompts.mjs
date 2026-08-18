import { readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { resolveProductRoot } from './workspace-data.mjs'

const productId = process.argv[2] || 'garlando'
const promptSystemPath = path.join(resolveProductRoot(productId), 'MARKETING', 'prompt_system.json')
const temporaryPath = `${promptSystemPath}.tmp`
const promptSystem = JSON.parse(await readFile(promptSystemPath, 'utf8'))
const blocksById = new Map(promptSystem.blocks.map((block) => [block.blockId, block]))
const profilesById = new Map(promptSystem.engineProfiles.map((profile) => [profile.engineProfileId, profile]))

const compileRecipe = (recipe) => {
  const profile = profilesById.get(recipe.engineProfileId)
  const blocks = recipe.blockRefs
    .map((reference) => blocksById.get(reference.blockId))
    .filter((block) => block?.enabled)
    .map((block) => block.content)
  return [profile?.prefix, ...blocks, profile?.suffix]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join('\n\n')
}

const changed = promptSystem.recipes.filter((recipe) => recipe.compiledPrompt !== compileRecipe(recipe))
if (changed.length) {
  const now = new Date().toISOString()
  for (const recipe of changed) {
    recipe.compiledPrompt = compileRecipe(recipe)
    recipe.compiledAt = now
    recipe.updatedAt = now
  }
  promptSystem.updatedAt = now
  await writeFile(temporaryPath, `${JSON.stringify(promptSystem, null, 2)}\n`, 'utf8')
  await rename(temporaryPath, promptSystemPath)
}

console.log(`Compiled ${promptSystem.recipes.length} recipes; normalized ${changed.length}.`)
