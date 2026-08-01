import { Link } from 'react-router-dom'
import { insights } from '@/data/site'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function InsightsPreview() {
  return (
    <section className="section-pad border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Insights"
            title="Source-worthy thinking"
            description="Technical notes, product reasoning, and operating discipline — written so humans and search systems can both use them."
          />
          <Button asChild variant="outline" className="shrink-0 self-start md:self-auto">
            <Link to="/insights">All insights</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {insights.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{post.category}</Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  {post.readTime}
                </span>
              </div>
              <h3 className="text-lg font-semibold leading-snug tracking-tight">
                <Link
                  to={`/insights/${post.slug}`}
                  className="hover:text-[var(--brand)]"
                  data-analytics="insights-open"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-[var(--text-muted)]">
                {post.excerpt}
              </p>
              <time
                dateTime={post.date}
                className="mt-5 text-sm text-[var(--text-muted)]"
              >
                {formatDate(post.date)}
              </time>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
