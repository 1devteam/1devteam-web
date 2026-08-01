import { Link } from 'react-router-dom'
import { workItems } from '@/data/site'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WorkPage() {
  return (
    <>
      <Seo
        title="Work"
        description="Build journals, product notes, and systems evidence from 1devteam — inspectable proof of how we design and ship."
        path="/work"
      />
      <PageHero
        eyebrow="Work"
        title="Evidence of systems that ship"
        description="We do not wait for polished case studies to show our work. Build journals, architecture notes, and product milestones create information scent technical buyers actually trust."
      >
        <Button asChild>
          <Link to="/contact">Discuss a project</Link>
        </Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-6">
          {workItems.map((item) => (
            <article key={item.slug} id={item.slug} className="scroll-mt-24">
              <Card>
                <CardHeader>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant="brand">{item.status}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-3xl text-[17px] leading-relaxed text-[var(--text-muted)]">
                    {item.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {item.slug === 'ajenda-ai' && (
                    <div className="mt-6">
                      <Button asChild variant="outline">
                        <Link to="/products/ajenda">View Ajenda AI</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
