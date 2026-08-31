import { readFile } from 'node:fs/promises'
import path from 'node:path'

const manifest = JSON.parse(await readFile('shared/route-manifest.json', 'utf8'))
const failures = []
const origin = 'https://1devteam.com'

function fileFor(routePath) {
  if (routePath === '/') return path.join('dist', '__prerender', 'index.html')
  return path.join('dist', '__prerender', `${routePath.slice(1)}.html`)
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

for (const route of manifest) {
  const html = await readFile(fileFor(route.path), 'utf8')
  const canonical = route.path === '/' ? `${origin}/` : `${origin}${route.path}`

  if (!html.includes(`<title>${route.title.replaceAll('&', '&amp;')}</title>`) && !html.includes(`<title>${route.title}</title>`)) {
    failures.push(`${route.path}: prerendered title does not match manifest`)
  }
  if (!new RegExp(`<link\\s+rel="canonical"\\s+href="${escapeRegExp(canonical)}"\\s*/?>`, 'i').test(html)) {
    failures.push(`${route.path}: prerendered canonical is missing or incorrect`)
  }
  if (!html.includes(`content="${route.robots}"`)) failures.push(`${route.path}: robots metadata is missing`)
  if (!html.includes('id="root">') || !/<main\b[^>]*id="main"/i.test(html)) failures.push(`${route.path}: rendered main content is missing`)
  if (!/<h1\b/i.test(html)) failures.push(`${route.path}: prerendered H1 is missing`)

  if (route.path.startsWith('/wiki/')) {
    if (!html.includes('"@type":"TechArticle"')) failures.push(`${route.path}: prerendered TechArticle JSON-LD is missing`)
    if (!html.includes('"@type":"DefinedTerm"')) failures.push(`${route.path}: prerendered DefinedTerm JSON-LD is missing`)
  }
  if (route.path.startsWith('/insights/')) {
    if (!html.includes('"@type":"Article"')) failures.push(`${route.path}: prerendered Article JSON-LD is missing`)
  }
  if (route.path === '/products/ajenda' && !html.includes('"@type":"SoftwareApplication"')) {
    failures.push(`${route.path}: prerendered SoftwareApplication JSON-LD is missing`)
  }
}

const notFound = await readFile(path.join('dist', '__prerender', '404.html'), 'utf8')
if (!notFound.includes('noindex, nofollow')) failures.push('/404: noindex metadata is missing')
if (/rel="canonical"/i.test(notFound)) failures.push('/404: canonical must not be emitted')

if (failures.length) {
  console.error('Prerender audit failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`PASS prerender audit across ${manifest.length} public routes plus the 404 surface`)
