import { useEffect } from 'react'
import { siteConfig } from '@/data/site'

interface SeoProps {
  title?: string
  description?: string
  path?: string
  type?: 'website' | 'article'
  robots?: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

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

export function Seo({
  title,
  description = siteConfig.description,
  path = '/',
  type = 'website',
  robots = 'index, follow',
  jsonLd,
}: SeoProps) {
  const fullTitle = title ? `${title} · ${siteConfig.name}` : siteConfig.title
  const url = `${siteConfig.url}${path}`
  const image = `${siteConfig.url}${siteConfig.ogImage}`

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', robots)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', image)
    upsertMeta('property', 'og:site_name', siteConfig.name)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', image)
    upsertLink('canonical', url)

    const scriptId = 'json-ld-primary'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.id = scriptId
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else if (script) {
      script.remove()
    }
  }, [fullTitle, description, url, image, type, robots, jsonLd])

  return null
}
