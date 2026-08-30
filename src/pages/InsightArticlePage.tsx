import { Link, useParams, Navigate } from 'react-router-dom'
import { insights, siteConfig } from '@/data/site'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { articleBodies } from '@/content/insights/bodies'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function InsightArticlePage() {
  const { slug } = useParams()
  const post = insights.find((p) => p.slug === slug)

  if (!post) return <Navigate to="/insights" replace />

  const body = articleBodies[post.slug] ?? []
  const articleUrl = `${siteConfig.url}/insights/${post.slug}`
  const articleImage = `${siteConfig.url}${siteConfig.ogImage}`

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/insights/${post.slug}`}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          url: articleUrl,
          mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
          image: articleImage,
          datePublished: post.date,
          dateModified: post.date,
          author: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
          publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
        }}
      />
      <article>
        <header className="border-b border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--bg)_100%)]">
          <div className="container-site py-14 md:py-20">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="brand">{post.category}</Badge>
              <span className="text-sm text-[var(--text-muted)]">{post.readTime}</span>
            </div>
            <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">{post.title}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">{post.excerpt}</p>
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text)]">{siteConfig.name}</span>
              {' · '}
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {' · '}
              Last revised {formatDate(post.date)}
            </p>
          </div>
        </header>

        <div className="section-pad">
          <div className="container-site">
            <div className="prose-measure mx-auto space-y-5 text-[17px] leading-relaxed text-[var(--text)]">
              {body.map((paragraph, i) => <p key={i} className="text-[var(--text-muted)]">{paragraph}</p>)}
            </div>

            <div className="prose-measure mx-auto mt-12 border-t border-[var(--border)] pt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild><Link to="/contact">Discuss a project</Link></Button>
                <Button asChild variant="outline"><Link to="/insights">More insights</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
