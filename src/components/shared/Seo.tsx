import { useEffect } from 'react'
import routeManifest from '../../../shared/route-manifest.json'
import { siteConfig } from '@/data/site'

interface SeoProps {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  robots?: string
  canonical?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

type RouteMeta = {
  path: string
  title: string
  description: string
  robots: string
  type: 'website' | 'article'
  image?: string
}

const routes = routeManifest as RouteMeta[]

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

function removeLink(rel: string) {
  document.head.querySelector(`link[rel="${rel}"]`)?.remove()
}

export function Seo({
  title,
  description = siteConfig.description,
  path = '/',
  type = 'website',
  robots = 'index, follow',
  canonical = true,
  jsonLd,
}: SeoProps) {
  const manifestMeta = routes.find((route) => route.path === path)
  const fullTitle = manifestMeta?.title ?? (title ? `${title} · ${siteConfig.name}` : siteConfig.title)
  const resolvedDescription = manifestMeta?.description ?? description
  const resolvedType = manifestMeta?.type ?? type
  const resolvedRobots = manifestMeta?.robots ?? robots
  const url = `${siteConfig.url}${path}`
  const image = `${siteConfig.url}${manifestMeta?.image ?? siteConfig.ogImage}`

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', resolvedDescription)
    upsertMeta('name', 'robots', resolvedRobots)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', resolvedDescription)
    upsertMeta('property', 'og:type', resolvedType)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)
    upsertMeta('property', 'og:site_name', siteConfig.name)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', resolvedDescription)
    upsertMeta('name', 'twitter:image', image)

    if (canonical) upsertLink('canonical', url)
    else removeLink('canonical')

    const scriptId = 'json-ld-primary'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.type = 'application/ld+json'
        const nonce = document.head.querySelector('meta[name="csp-nonce"]')?.getAttribute('content')
        if (nonce) script.nonce = nonce
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [
    canonical,
    fullTitle,
    resolvedDescription,
    resolvedType,
    resolvedRobots,
    url,
    image,
    jsonLd,
  ])

  return null
}
