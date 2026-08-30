import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const dist = path.resolve('dist')
const assetsDir = path.join(dist, 'assets')
const html = await readFile(path.join(dist, 'index.html'), 'utf8')
const files = (await readdir(assetsDir)).filter((file) => file.endsWith('.js'))
const entryMatch = html.match(/<script[^>]+src="\/assets\/([^"]+\.js)"/)
if (!entryMatch) throw new Error('Unable to locate the client entry bundle in dist/index.html')

const sizes = []
for (const file of files) {
  const content = await readFile(path.join(assetsDir, file))
  sizes.push({ file, raw: content.length, gzip: gzipSync(content).length })
}

sizes.sort((a, b) => b.gzip - a.gzip)
const entry = sizes.find((item) => item.file === entryMatch[1])
if (!entry) throw new Error(`Entry bundle ${entryMatch[1]} was not found in dist/assets`)

const totalGzip = sizes.reduce((sum, item) => sum + item.gzip, 0)
const largest = sizes[0]
const limits = {
  entryGzip: 90 * 1024,
  largestChunkGzip: 120 * 1024,
  totalGzip: 220 * 1024,
}

const failures = []
if (entry.gzip > limits.entryGzip) failures.push(`entry gzip ${entry.gzip} exceeds ${limits.entryGzip}`)
if (largest.gzip > limits.largestChunkGzip) failures.push(`largest chunk ${largest.file} gzip ${largest.gzip} exceeds ${limits.largestChunkGzip}`)
if (totalGzip > limits.totalGzip) failures.push(`total JS gzip ${totalGzip} exceeds ${limits.totalGzip}`)

console.log(`Entry JS: ${(entry.gzip / 1024).toFixed(1)} KiB gzip (${entry.file})`)
console.log(`Largest JS chunk: ${(largest.gzip / 1024).toFixed(1)} KiB gzip (${largest.file})`)
console.log(`Total JS: ${(totalGzip / 1024).toFixed(1)} KiB gzip across ${sizes.length} chunks`)

if (failures.length) {
  console.error('Bundle budget failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('PASS bundle budgets')
