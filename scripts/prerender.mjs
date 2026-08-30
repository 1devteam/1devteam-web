import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const dist = path.join(root, 'dist')
const ssrEntry = path.join(root, 'dist-ssr', 'prerender-entry.js')
const template = await readFile(path.join(dist, 'index.html'), 'utf8')
const manifest = JSON.parse(await readFile(path.join(root, 'shared', 'route-manifest.json'), 'utf8'))
const { render } = await import(`${pathToFileURL(ssrEntry).href}?v=${Date.now()}`)
const siteOrigin = 'https://1devteam.com'
const defaultImage = '/og.png'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function replaceMeta(html, attr, key, value) {
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, 'i')
  return html.replace(pattern, (tag) => {
    const safe = escapeHtml(value)
    if (/content="[^"]*"/i.test(tag)) return tag.replace(/content="[^"]*"/i, `content="${safe}"`)
    return tag.replace(/\s*\/?>(\s*)$/, ` content="${safe}" />$1`)
  })
}

function routeUrl(routePath) {
  return routePath === '/' ? `${siteOrigin}/` : `${siteOrigin}${routePath}`
}

function withHead(html, route) {
  const url = routeUrl(route.path)
  const image = `${siteOrigin}${route.image ?? defaultImage}`
  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`)
  output = replaceMeta(output, 'name', 'description', route.description)
  output = replaceMeta(output, 'name', 'robots', route.robots)
  output = replaceMeta(output, 'property', 'og:title', route.title)
  output = replaceMeta(output, 'property', 'og:description', route.description)
  output = replaceMeta(output, 'property', 'og:type', route.type)
  output = replaceMeta(output, 'property', 'og:url', url)
  output = replaceMeta(output, 'property', 'og:image', image)
  output = replaceMeta(output, 'name', 'twitter:title', route.title)
  output = replaceMeta(output, 'name', 'twitter:description', route.description)
  output = replaceMeta(output, 'name', 'twitter:image', image)
  output = output.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '')
  return output.replace('</head>', `    <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`)
}

function outputPath(routePath) {
  if (routePath === '/') return path.join(dist, '__prerender', 'index.html')
  return path.join(dist, '__prerender', `${routePath.slice(1)}.html`)
}

async function writeRoute(route, pathname = route.path) {
  const markup = render(pathname)
  let html = template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
  html = withHead(html, route)
  const destination = outputPath(route.path)
  await mkdir(path.dirname(destination), { recursive: true })
  await writeFile(destination, html)
}

for (const route of manifest) await writeRoute(route)

const notFound = {
  path: '/404',
  title: 'Page not found · 1DevTeam',
  description: 'The page you requested does not exist.',
  robots: 'noindex, nofollow',
  type: 'website',
}
await writeRoute(notFound, '/__prerender-not-found__')
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`PASS prerendered ${manifest.length} public routes plus the 404 surface`)
