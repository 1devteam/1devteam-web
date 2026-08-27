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
      <Seo title="Work" description="An inspectable record of 1DevTeam development: products, developer tooling, architecture work, and technical artifacts." path="/work" />
      <PageHero
        eyebrow="Work"
        title="Work, systems, and technical evidence"
        description="An inspectable record of 1DevTeam development. Each item is labeled according to what its current evidence supports rather than being presented as a polished case study."
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
                  {item.slug === 'ajenda-ai' && <div className="mb-6 max-w-3xl"><AjendaCommandCenter caption="Local Ajenda command center captured 31 July 2026." /></div>}
                  {item.slug === 'snapshot' && (
                    <figure className="mb-6 max-w-3xl overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[#214b83]">
                      <img src="/artifacts/snapshot-v10.svg" alt="Snapshot v10 execution in the Ajenda development shell" className="w-full" />
                    </figure>
                  )}
                  {item.slug === 'architectural-graph' && (
                    <figure className="mb-6 max-w-3xl overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white">
                      <img src="/artifacts/mission-composition-graph.svg" alt="Selected decision functions from the Ajenda canonical graph" className="w-full" />
                    </figure>
                  )}
                  <p className="max-w-3xl text-[17px] leading-relaxed text-[var(--text-muted)]">{item.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">{tag}</span>)}</div>
                  {item.slug === 'ajenda-ai' && <div className="mt-6"><Button asChild variant="outline"><Link to="/products/ajenda">View Ajenda AI</Link></Button></div>}
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
