import routeManifest from '../shared/route-manifest.json'

type RouteMeta = {
  path: string
  title: string
  description: string
  robots: string
  type: 'website' | 'article'
}

type AssetEnv = {
  ASSETS: Fetcher
}

type AssetContext = EventContext<AssetEnv, string, unknown>

const siteOrigin = 'https://1devteam.com'
const routes = routeManifest as RouteMeta[]
const routesByPath = new Map(routes.map((route) => [route.path, route]))

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

function metadataRewriter(meta: RouteMeta, pageUrl: string, canonical: string | null) {
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
    .on('link[rel="canonical"]', {
      element(element) {
        element.remove()
      },
    })
    .on('head', {
      element(element) {
        if (canonical) {
          element.append(`<link rel="canonical" href="${canonical}" />`, { html: true })
        }
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
  const indexUrl = new URL('/index.html', requestUrl)
  const assetResponse = await context.env.ASSETS.fetch(indexUrl)
  const headers = new Headers(assetResponse.headers)

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

  return metadataRewriter(meta, pageUrl, canonical).transform(response)
}

/** Serve the SPA with route-correct metadata and real HTTP 404s. */
export const onRequest: PagesFunction<AssetEnv> = async (context) => {
  const requestUrl = new URL(context.request.url)
  const normalizedPath = normalizePath(requestUrl.pathname)

  if (requestUrl.pathname.includes('.') || requestUrl.pathname.startsWith('/assets/')) {
    return context.next()
  }

  if (normalizedPath !== requestUrl.pathname) {
    const redirectUrl = new URL(requestUrl)
    redirectUrl.pathname = normalizedPath
    return Response.redirect(redirectUrl.toString(), 308)
  }

  const route = routesByPath.get(normalizedPath)
  if (!route) {
    return spaDocument(context, notFoundMeta, 404, null)
  }

  return spaDocument(context, route, 200, canonicalUrl(route.path))
}
