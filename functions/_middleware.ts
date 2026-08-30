import routeManifest from '../shared/route-manifest.json'

type RouteMeta = {
  path: string
  title: string
  description: string
  robots: string
  type: 'website' | 'article'
  image?: string
}

type AssetEnv = {
  ASSETS: Fetcher
}

type AssetContext = EventContext<AssetEnv, string, unknown>

const siteOrigin = 'https://1devteam.com'
const defaultImage = '/og.png'
const routes = routeManifest as RouteMeta[]
const routesByPath = new Map(routes.map((route) => [route.path, route]))
const legacyRedirects = new Map([
  ['/insights/build-journals-over-case-study-theater', '/insights/architectural-scope-and-corrective-repair'],
])

const notFoundMeta: RouteMeta = {
  path: '/404',
  title: 'Page not found · 1DevTeam',
  description: 'The page you requested does not exist.',
  robots: 'noindex, nofollow',
  type: 'website',
}

function normalizePath(pathname: string) {
  if (pathname !== '/' && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

function canonicalUrl(pathname: string) {
  return pathname === '/' ? `${siteOrigin}/` : `${siteOrigin}${pathname}`
}

function prerenderAssetPath(pathname: string) {
  if (pathname === '/') return '/__prerender/index.html'
  if (pathname === '/404') return '/__prerender/404.html'
  return `/__prerender${pathname}.html`
}

function csp(nonce: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `script-src 'self' 'nonce-${nonce}' https://static.cloudflareinsights.com`,
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com",
    "form-action 'self' mailto:",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
  ].join('; ')
}

function metadataRewriter(meta: RouteMeta, pageUrl: string, canonical: string | null, nonce: string) {
  const image = `${siteOrigin}${meta.image ?? defaultImage}`
  return new HTMLRewriter()
    .on('title', {
      element(element) {
        element.setInnerContent(meta.title)
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute('content', meta.description)
      },
    })
    .on('meta[name="robots"]', {
      element(element) {
        element.setAttribute('content', meta.robots)
      },
    })
    .on('meta[property="og:title"]', {
      element(element) {
        element.setAttribute('content', meta.title)
      },
    })
    .on('meta[property="og:description"]', {
      element(element) {
        element.setAttribute('content', meta.description)
      },
    })
    .on('meta[property="og:type"]', {
      element(element) {
        element.setAttribute('content', meta.type)
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute('content', pageUrl)
      },
    })
    .on('meta[property="og:image"]', {
      element(element) {
        element.setAttribute('content', image)
      },
    })
    .on('meta[name="twitter:title"]', {
      element(element) {
        element.setAttribute('content', meta.title)
      },
    })
    .on('meta[name="twitter:description"]', {
      element(element) {
        element.setAttribute('content', meta.description)
      },
    })
    .on('meta[name="twitter:image"]', {
      element(element) {
        element.setAttribute('content', image)
      },
    })
    .on('link[rel="canonical"]', {
      element(element) {
        element.remove()
      },
    })
    .on('script', {
      element(element) {
        element.setAttribute('nonce', nonce)
      },
    })
    .on('head', {
      element(element) {
        element.append(`<meta name="csp-nonce" content="${nonce}" />`, { html: true })
        if (canonical) element.append(`<link rel="canonical" href="${canonical}" />`, { html: true })
      },
    })
}

async function spaDocument(
  context: AssetContext,
  meta: RouteMeta,
  status: number,
  canonical: string | null,
) {
  const requestUrl = new URL(context.request.url)
  const assetUrl = new URL(prerenderAssetPath(meta.path), requestUrl)
  const assetResponse = await context.env.ASSETS.fetch(assetUrl)
  const headers = new Headers(assetResponse.headers)
  const nonce = crypto.randomUUID().replaceAll('-', '')

  headers.set('Content-Security-Policy', csp(nonce))
  headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  if (status === 404) {
    headers.set('Cache-Control', 'no-cache')
    headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  const response = new Response(assetResponse.body, {
    status,
    statusText: status === 404 ? 'Not Found' : assetResponse.statusText,
    headers,
  })
  const pageUrl = canonical ?? `${siteOrigin}${requestUrl.pathname}`

  return metadataRewriter(meta, pageUrl, canonical, nonce).transform(response)
}

/** Serve prerendered public routes with route-correct metadata, CSP, redirects, and real HTTP 404s. */
export const onRequest: PagesFunction<AssetEnv> = async (context) => {
  const requestUrl = new URL(context.request.url)

  if (requestUrl.pathname.startsWith('/__prerender/')) {
    return new Response('Not found', {
      status: 404,
      headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' },
    })
  }

  if (requestUrl.pathname === '/index.html') {
    const redirectUrl = new URL(requestUrl)
    redirectUrl.pathname = '/'
    return Response.redirect(redirectUrl.toString(), 308)
  }

  const legacyDestination = legacyRedirects.get(normalizePath(requestUrl.pathname))
  if (legacyDestination) {
    const redirectUrl = new URL(requestUrl)
    redirectUrl.pathname = legacyDestination
    return Response.redirect(redirectUrl.toString(), 308)
  }

  if (requestUrl.pathname.includes('.') || requestUrl.pathname.startsWith('/assets/')) {
    return context.next()
  }

  const normalizedPath = normalizePath(requestUrl.pathname)
  if (normalizedPath !== requestUrl.pathname) {
    const redirectUrl = new URL(requestUrl)
    redirectUrl.pathname = normalizedPath
    return Response.redirect(redirectUrl.toString(), 308)
  }

  const route = routesByPath.get(normalizedPath)
  if (!route) return spaDocument(context, notFoundMeta, 404, null)

  return spaDocument(context, route, 200, canonicalUrl(route.path))
}
