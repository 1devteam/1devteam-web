import { Link } from 'react-router-dom'
import { workItems } from '@/data/site'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WorkPreview() {
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
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {workItems.slice(0, 4).map((item) => (
            <Card
              key={item.slug}
              className="transition-shadow hover:shadow-md"
            >
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
