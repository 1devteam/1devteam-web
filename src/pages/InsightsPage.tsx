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
        description="Technical notes from 1DevTeam on software architecture, AI-assisted development, system control, development tooling, research methods, and product engineering."
        path="/insights"
      />
      <PageHero
        eyebrow="Technical Notes"
        title="Development, architecture, AI, and applied R&D"
        description="Technical writing from 1DevTeam covers software architecture, AI-assisted development, system control, development tooling, research methods, and product engineering. The same distinction between evidence, interpretation, and unresolved questions used in the development work applies here."
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
                    <span className="text-xs text-[var(--text-subtle)]">{post.readTime} · {formatDate(post.date)}</span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{post.title}</h2>
                  <p className="mt-2 max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
