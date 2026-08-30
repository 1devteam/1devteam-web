import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { featuredWikiEntry } from '@/data/wikiFeatured'
import { siteConfig } from '@/data/site'

export function WikiEntryPage() {
  const { id } = useParams()
  const entry = featuredWikiEntry(id)
  if (!entry) return <Navigate to="/wiki" replace />

  const path = `/wiki/${entry.id}`
  const url = `${siteConfig.url}${path}`

  return (
    <>
      <Seo
        title={entry.title}
        description={entry.description}
        path={path}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: entry.title,
          description: entry.description,
          url,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
          author: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
          publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
          about: { '@type': 'DefinedTerm', name: entry.title, description: entry.description },
        }}
      />

      <PageHero eyebrow={`Technical Wiki · ${entry.category}`} title={entry.title} description={entry.description}>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/wiki"><ArrowLeft className="h-4 w-4" aria-hidden /> Wiki index</Link></Button>
          {entry.status && <Badge variant="brand" className="self-center">{entry.status}</Badge>}
        </div>
      </PageHero>

      <article className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">On this reference</p>
            <nav className="mt-4 border-l border-[var(--border)] pl-4" aria-label={`${entry.title} sections`}>
              {entry.sections.map((section, index) => (
                <a key={section.heading} href={`#section-${index + 1}`} className="block py-1.5 text-sm leading-snug text-[var(--text-muted)] hover:text-[var(--brand)]">
                  {section.heading}
                </a>
              ))}
              <a href="#evidence-boundary" className="block py-1.5 text-sm leading-snug text-[var(--text-muted)] hover:text-[var(--brand)]">Evidence boundary</a>
            </nav>
          </aside>

          <div className="min-w-0 max-w-4xl">
            {entry.sections.map((section, index) => (
              <section key={section.heading} id={`section-${index + 1}`} className={`scroll-mt-24 py-9 ${index === 0 ? 'border-t-2 border-[var(--text)]' : 'border-t border-[var(--border)]'}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{String(index + 1).padStart(2, '0')}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{section.heading}</h2>
                <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">{section.body}</p>
              </section>
            ))}

            <section id="evidence-boundary" className="scroll-mt-24 border-t border-[var(--border)] py-9">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Evidence boundary</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">What this entry supports</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">{entry.evidence}</p>
            </section>

            <section className="border-t border-[var(--border)] pt-9">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Related material</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {entry.related.map((related) => (
                  <Link key={related.href + related.label} to={related.href} className="flex items-center justify-between gap-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--brand)] hover:text-[var(--brand)]">
                    {related.label}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </>
  )
}
