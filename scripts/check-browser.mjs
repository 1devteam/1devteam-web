import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const manifest = JSON.parse(await readFile('shared/route-manifest.json', 'utf8'))
const knownPaths = new Set(manifest.map((route) => route.path))
const origin = 'http://127.0.0.1:4173'
const server = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
  stdio: ['ignore', 'pipe', 'pipe'],
})
let serverOutput = ''
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString() })
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString() })

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(origin)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(`Preview server did not start.\n${serverOutput}`)
}

const failures = []
let browser

try {
  await waitForServer()
  browser = await chromium.launch({ headless: true })

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport })

    for (const route of manifest) {
      const page = await context.newPage()
      const runtimeErrors = []
      page.on('pageerror', (error) => runtimeErrors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text())
      })

      try {
        await page.goto(`${origin}${route.path}`, { waitUntil: 'networkidle' })
        const result = await page.evaluate(({ expectedTitle, known }) => {
          const labelsControl = (control) => {
            if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return true
            if (control.id && document.querySelector(`label[for="${CSS.escape(control.id)}"]`)) return true
            return Boolean(control.closest('label'))
          }
          const internalLinks = [...document.querySelectorAll('a[href]')]
            .map((anchor) => anchor.getAttribute('href'))
            .filter(Boolean)
            .filter((href) => href.startsWith('/'))
            .map((href) => new URL(href, location.origin).pathname)
          return {
            titleMatches: document.title === expectedTitle,
            mainCount: document.querySelectorAll('main#main').length,
            h1Count: document.querySelectorAll('main h1').length,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            imagesMissingAlt: [...document.querySelectorAll('img')].filter((image) => !image.hasAttribute('alt')).length,
            unlabeledControls: [...document.querySelectorAll('input, select, textarea')].filter((control) => !labelsControl(control)).length,
            unknownLinks: [...new Set(internalLinks.filter((pathname) => !known.includes(pathname)))],
          }
        }, { expectedTitle: route.title, known: [...knownPaths] })

        if (!result.titleMatches) failures.push(`${viewport.name} ${route.path}: document title does not match route manifest`)
        if (result.mainCount !== 1) failures.push(`${viewport.name} ${route.path}: expected one main#main, found ${result.mainCount}`)
        if (result.h1Count < 1) failures.push(`${viewport.name} ${route.path}: no H1 found in main content`)
        if (result.overflow > 1) failures.push(`${viewport.name} ${route.path}: horizontal overflow of ${result.overflow}px`)
        if (result.imagesMissingAlt) failures.push(`${viewport.name} ${route.path}: ${result.imagesMissingAlt} image(s) missing alt attributes`)
        if (result.unlabeledControls) failures.push(`${viewport.name} ${route.path}: ${result.unlabeledControls} form control(s) lack labels`)
        if (result.unknownLinks.length) failures.push(`${viewport.name} ${route.path}: unknown internal route link(s): ${result.unknownLinks.join(', ')}`)
        if (runtimeErrors.length) failures.push(`${viewport.name} ${route.path}: runtime console/page errors: ${runtimeErrors.join(' | ')}`)
      } catch (error) {
        failures.push(`${viewport.name} ${route.path}: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        await page.close()
      }
    }

    await context.close()
  }
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
}

if (failures.length) {
  console.error('Browser regression audit failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`PASS browser regression audit across ${manifest.length} routes at desktop and mobile viewports`)
