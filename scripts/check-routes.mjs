import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(await readFile(path.join(root, 'shared', 'route-manifest.json'), 'utf8'))
const appSource = await readFile(path.join(root, 'src', 'App.tsx'), 'utf8')
const prerenderSource = await readFile(path.join(root, 'src', 'prerender-entry.tsx'), 'utf8')
const siteSource = await readFile(path.join(root, 'src', 'data', 'site.ts'), 'utf8')
const featuredWikiSource = await readFile(path.join(root, 'src', 'data', 'wikiFeatured.ts'), 'utf8')

const failures = []
const paths = manifest.map((route) => route.path)
const pathSet = new Set(paths)

if (pathSet.size !== paths.length) failures.push('route manifest contains duplicate paths')

for (const route of manifest) {
  for (const field of ['path', 'title', 'description', 'robots', 'type', 'lastmod', 'sitemap']) {
    if (!(field in route)) failures.push(`${route.path ?? '<unknown>'} is missing ${field}`)
  }
  if (!route.path.startsWith('/')) failures.push(`${route.path} must start with /`)
  if (route.path !== '/' && route.path.endsWith('/')) failures.push(`${route.path} must not end with /`)
  if (!['website', 'article'].includes(route.type)) failures.push(`${route.path} has invalid type ${route.type}`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(route.lastmod)) failures.push(`${route.path} has invalid lastmod ${route.lastmod}`)
  if (route.robots.startsWith('noindex') && route.sitemap) failures.push(`${route.path} is noindex but included in the sitemap`)
  if (route.image) {
    if (!route.image.startsWith('/')) failures.push(`${route.path} image must be root-relative`)
    else {
      try {
        await access(path.join(root, 'public', route.image.slice(1)))
      } catch {
        failures.push(`${route.path} image does not exist: ${route.image}`)
      }
    }
  }
}

const titleSet = new Set(manifest.map((route) => route.title))
if (titleSet.size !== manifest.length) failures.push('route manifest contains duplicate page titles')

function routeCoverage(source, label) {
  const routePaths = [...source.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1])
  const staticPaths = new Set(['/'])
  const dynamicPatterns = []
  for (const routePath of routePaths) {
    if (routePath === '*') continue
    if (routePath.includes(':')) dynamicPatterns.push(new RegExp(`^/${routePath.replace(/:[^/]+/g, '[^/]+')}$`))
    else staticPaths.add(`/${routePath}`)
  }
  for (const appPath of staticPaths) {
    if (!pathSet.has(appPath)) failures.push(`${label} route ${appPath} is missing from the route manifest`)
  }
  for (const manifestPath of pathSet) {
    const represented = staticPaths.has(manifestPath) || dynamicPatterns.some((pattern) => pattern.test(manifestPath))
    if (!represented) failures.push(`Manifest route ${manifestPath} is not represented by ${label}`)
  }
}

routeCoverage(appSource, 'App.tsx')
routeCoverage(prerenderSource, 'prerender-entry.tsx')

const insightsBlock = siteSource.match(/export const insights = \[(.*?)\]\s+as const/s)?.[1]
if (!insightsBlock) {
  failures.push('could not locate insights in src/data/site.ts')
} else {
  const insightSlugs = [...insightsBlock.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])
  const expectedInsightPaths = new Set(insightSlugs.map((slug) => `/insights/${slug}`))
  const manifestInsightPaths = new Set(paths.filter((routePath) => routePath.startsWith('/insights/')))
  for (const expectedPath of expectedInsightPaths) {
    if (!manifestInsightPaths.has(expectedPath)) failures.push(`Insight ${expectedPath} is missing from the route manifest`)
  }
  for (const manifestPath of manifestInsightPaths) {
    if (!expectedInsightPaths.has(manifestPath)) failures.push(`Manifest article ${manifestPath} has no matching insight slug`)
  }
}

const featuredBlock = featuredWikiSource.match(/export const featuredWikiEntries:[\s\S]*?= \[(.*?)\]\s+as const/s)?.[1]
if (!featuredBlock) {
  failures.push('could not locate featuredWikiEntries in src/data/wikiFeatured.ts')
} else {
  const featuredIds = [...featuredBlock.matchAll(/\n\s+id:\s*'([^']+)'/g)].map((match) => match[1])
  const expectedWikiPaths = new Set(featuredIds.map((id) => `/wiki/${id}`))
  const manifestWikiDetailPaths = new Set(paths.filter((routePath) => routePath.startsWith('/wiki/')))
  for (const expectedPath of expectedWikiPaths) {
    if (!manifestWikiDetailPaths.has(expectedPath)) failures.push(`Featured wiki entry ${expectedPath} is missing from the route manifest`)
  }
  for (const manifestPath of manifestWikiDetailPaths) {
    if (!expectedWikiPaths.has(manifestPath)) failures.push(`Manifest wiki reference ${manifestPath} has no matching featured entry`)
  }
}

if (failures.length) {
  console.error('SEO route audit failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`PASS route manifest covers ${manifest.length} public routes, prerender coverage, route images, insights, and featured wiki references`)
