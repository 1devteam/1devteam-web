import { Link } from 'react-router-dom'
import { workItems } from '@/data/site'
import { AjendaCommandCenter } from '@/components/product/AjendaCommandCenter'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T00:00:00Z`))
}

export function WorkPage() {
  return (
    <>
      <Seo
        title="Work"
        description="Software, tooling, architecture artifacts, and development evidence from 1DevTeam, presented according to the state supported by current evidence."
        path="/work"
      />
      <PageHero
        eyebrow="Technical Evidence"
        title="Work, systems, and development artifacts"
        description="Software, tooling, architecture artifacts, and development evidence are presented according to the state supported by current evidence. Maturity labels describe what exists now rather than what a product or system is intended to become."
      >
        <Button asChild><Link to="/contact">Discuss a project</Link></Button>
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
                    {item.date && <time dateTime={item.date} className="text-xs font-medium text-[var(--text-subtle)]">{formatDate(item.date)}</time>}
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.slug === 'ajenda-ai' && (
                    <div className="mb-6 max-w-3xl"><AjendaCommandCenter /></div>
                  )}

                  <p className="max-w-3xl text-[17px] leading-relaxed text-[var(--text-muted)]">{item.summary}</p>

                  {item.slug === 'snapshot' && (
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-subtle)]">Public evidence includes the recorded Snapshot v10 execution against Ajenda and a reviewed, public-safe excerpt from the structured output.</p>
                  )}
                  {item.slug === 'architectural-graph' && (
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-subtle)]">Public evidence includes a reviewed interactive projection derived from Ajenda&apos;s canonical development graph artifact.</p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">{tag}</span>)}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {item.slug === 'ajenda-ai' && <Button asChild variant="outline"><Link to="/products/ajenda">View Ajenda AI</Link></Button>}
                    {item.slug === 'snapshot' && <Button asChild variant="outline"><a href="/#snapshot">Inspect Snapshot evidence</a></Button>}
                    {item.slug === 'architectural-graph' && <Button asChild variant="outline"><a href="/#architecture-graph">Inspect graph evidence</a></Button>}
                    {item.slug === 'pride-protocol' && <Button asChild variant="outline"><a href="/#pride-protocol">View PRIDE artifact</a></Button>}
                    {item.slug === 'pride-protocol' && <Button asChild variant="outline"><Link to="/method">Read the method</Link></Button>}
                  </div>
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
