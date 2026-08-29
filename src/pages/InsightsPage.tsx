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
        <div className="container-site grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Reading index</p>
            <p className="mt-3 text-base leading-relaxed text-[var(--text-muted)]">
              Notes are organized as technical reading rather than case-study marketing. Each entry should make the distinction between implemented behavior, interpretation, and unresolved questions visible in the writing itself.
            </p>
          </div>

          <ul className="max-w-4xl">
            {insights.map((post) => (
              <li key={post.slug} className="border-t border-[var(--border)]">
                <Link
                  to={`/insights/${post.slug}`}
                  className="block py-8"
                  data-analytics="insights-open"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{post.category}</Badge>
                    <span className="text-xs text-[var(--text-subtle)]">{post.readTime} · {formatDate(post.date)}</span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{post.title}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">{post.excerpt}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-[var(--brand)]">Read note →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
