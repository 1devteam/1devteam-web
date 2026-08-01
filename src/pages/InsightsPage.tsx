import { Link } from 'react-router-dom'
import { insights } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function InsightsPage() {
  return (
    <>
      <Seo
        title="Insights"
        description="Product notes, governance thinking, and build journals from 1devteam — entity-rich content for humans and AI-mediated discovery."
        path="/insights"
      />
      <PageHero
        eyebrow="Insights"
        title="Notes from building real systems"
        description="Source-worthy pages: dated updates, clear claims, and practical reasoning. Built for self-serve research, SEO, and citation-friendly structure."
      />

      <section className="section-pad">
        <div className="container-site">
          <ul className="divide-y divide-[var(--border)] rounded-[var(--radius-md)] border border-[var(--border)] bg-white">
            {insights.map((post) => (
              <li key={post.slug}>
                <Link
                  to={`/insights/${post.slug}`}
                  className="block p-6 transition-colors hover:bg-[var(--surface)] md:p-8"
                  data-analytics="insights-open"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-xs text-[var(--text-muted)]">
                      {post.readTime} · {formatDate(post.date)}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-[var(--text-muted)]">
                    {post.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
