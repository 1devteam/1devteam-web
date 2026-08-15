import { Link } from 'react-router-dom'
import { workItems } from '@/data/site'
import { AjendaCommandCenter } from '@/components/product/AjendaCommandCenter'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${iso}T00:00:00Z`))
}

export function WorkPreview() {
  const [featured, ...rest] = workItems

  return (
    <section className="section-pad">
      <div className="container-site">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Work & evidence"
            title="Proof before polish"
            description="We publish build journals, product notes, and systems patterns early — inspectable evidence, not wait-for-the-case-study silence."
          />
          <Button asChild variant="outline" className="shrink-0 self-start md:self-auto">
            <Link to="/work">View all work</Link>
          </Button>
        </div>

        <article className="mt-10 grid gap-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 md:grid-cols-2 md:p-8">
          <AjendaCommandCenter caption="Local Ajenda command center, 31 July 2026." />
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{featured.type}</Badge>
              <Badge variant="brand">{featured.status}</Badge>
              {featured.date && (
                <time
                  dateTime={featured.date}
                  className="text-xs font-medium text-[var(--text-muted)]"
                >
                  {formatDate(featured.date)}
                </time>
              )}
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">
              <Link
                to={`/work#${featured.slug}`}
                className="hover:text-[var(--brand)]"
                data-analytics="work-card-click"
              >
                {featured.title}
              </Link>
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-muted)]">
              {featured.summary}
            </p>
            <div className="mt-5">
              <Button asChild variant="outline">
                <Link to={featured.href ?? `/work#${featured.slug}`}>
                  Open the journal
                </Link>
              </Button>
            </div>
          </div>
        </article>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {rest.map((item) => (
            <Card key={item.slug} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.type}</Badge>
                  <Badge variant="default">{item.status}</Badge>
                </div>
                <CardTitle>
                  <Link
                    to={`/work#${item.slug}`}
                    className="hover:text-[var(--brand)]"
                    data-analytics="work-card-click"
                  >
                    {item.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">
                  {item.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
