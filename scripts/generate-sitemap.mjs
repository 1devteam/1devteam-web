import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(root, 'shared', 'route-manifest.json')
const outputPath = path.join(root, 'public', 'sitemap.xml')
const siteOrigin = 'https://1devteam.com'
const checkOnly = process.argv.includes('--check')

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

const routes = JSON.parse(await readFile(manifestPath, 'utf8'))
const sitemapRoutes = routes.filter((route) => route.sitemap && route.robots.startsWith('index'))

const body = sitemapRoutes
  .map((route) => {
    const loc = route.path === '/' ? `${siteOrigin}/` : `${siteOrigin}${route.path}`
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(route.lastmod)}</lastmod>\n  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

if (checkOnly) {
  const current = await readFile(outputPath, 'utf8')
  if (current !== xml) {
    console.error('public/sitemap.xml is out of sync with shared/route-manifest.json')
    process.exit(1)
  }
  console.log(`PASS sitemap matches route manifest (${sitemapRoutes.length} indexed URLs)`)
} else {
  await writeFile(outputPath, xml, 'utf8')
  console.log(`Wrote ${sitemapRoutes.length} indexed URLs to public/sitemap.xml`)
}
