import { spawn, spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'

const root = resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const deckArgIndex = args.indexOf('--deck')
const deckSlug = deckArgIndex >= 0 ? args[deckArgIndex + 1] : 'rasson-victory-ii-plus-white'
if (!deckSlug || !/^[a-z0-9-]+$/.test(deckSlug)) throw new Error('Pass a valid deck slug after --deck.')
if (!existsSync(resolve(root, 'content', 'decks', deckSlug, 'deck.json'))) throw new Error(`Unknown deck: ${deckSlug}`)
const vite = resolve(root, 'node_modules', 'vite', 'bin', 'vite.js')
const renderDir = resolve(root, '.pdf-render')
const printedPdf = resolve(renderDir, 'printed.pdf')
const output = resolve(root, 'public', 'downloads', `${deckSlug}.pdf`)
const python = process.env.PDF_PYTHON || 'python'
const browser = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean).find((candidate) => existsSync(candidate))

if (!browser) throw new Error('Chrome or Microsoft Edge was not found. Set CHROME_PATH and run the command again.')
mkdirSync(renderDir, { recursive: true })
mkdirSync(resolve(root, 'public', 'downloads'), { recursive: true })
rmSync(printedPdf, { force: true })
rmSync(output, { force: true })

const server = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { cwd: root, stdio: 'ignore' })
try {
  await wait(1200)
  const result = spawnSync(browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${printedPdf}`, `http://127.0.0.1:4174/?pdf=1&deck=${encodeURIComponent(deckSlug)}`], { encoding: 'utf8', timeout: 120000 })
  if (result.status !== 0 || !existsSync(printedPdf)) throw new Error(result.stderr || 'Browser did not create the PDF.')
  if (process.env.PDF_OPTIMIZE_IMAGES === '1') {
    const optimized = spawnSync(python, [resolve(root, 'scripts', 'optimize-pdf.py'), printedPdf, output], { encoding: 'utf8', timeout: 120000 })
    if (optimized.status !== 0 || !existsSync(output)) throw new Error(optimized.stderr || 'Could not optimize PDF images.')
  } else {
    copyFileSync(printedPdf, output)
  }
  console.log(`PDF created: ${output}`)
} finally {
  server.kill()
  rmSync(renderDir, { recursive: true, force: true })
}
