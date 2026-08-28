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
        description="This section presents software, tooling, architecture artifacts, and development evidence according to their current state. The objective is to make the underlying work inspectable without converting development artifacts into unsupported maturity claims."
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
                    <div className="mb-6 max-w-3xl">
                      <AjendaCommandCenter caption="Ajenda AI · development product surface. Local command-center interface captured during active development." />
                    </div>
                  )}
                  {item.slug === 'snapshot' && (
                    <figure className="mb-6 max-w-3xl overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[#214b83]">
                      <img src="/artifacts/snapshot-v10.svg" alt="Snapshot v10 execution in the Ajenda development shell" className="w-full" />
                      <figcaption className="border-t border-white/10 bg-[#0a1120] px-5 py-4 text-sm leading-relaxed text-slate-200">
                        <strong className="text-white">Snapshot v10.0 · execution artifact.</strong> Snapshot executed against the Ajenda repository. The captured run indexed 1,376 files and 2,451 routes, reported zero Python parse errors, recorded active Git state, and operated with project writes disabled.
                      </figcaption>
                    </figure>
                  )}
                  {item.slug === 'architectural-graph' && (
                    <figure className="mb-6 max-w-3xl overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-white">
                      <img src="/artifacts/mission-composition-graph.svg" alt="Selected decision functions from the Ajenda canonical graph" className="w-full" />
                      <figcaption className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-muted)]">
                        <strong className="text-[var(--text)]">Ajenda Architectural Graph · architecture artifact.</strong> Deterministic rendering from canonical CI graph data: schema 1.2 · 1,202 nodes · 3,600 edges.
                      </figcaption>
                    </figure>
                  )}
                  <p className="max-w-3xl text-[17px] leading-relaxed text-[var(--text-muted)]">{item.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">{tag}</span>
                    ))}
                  </div>
                  {item.slug === 'ajenda-ai' && <div className="mt-6"><Button asChild variant="outline"><Link to="/products/ajenda">View Ajenda AI</Link></Button></div>}
                  {item.slug === 'pride-protocol' && <div className="mt-6"><Button asChild variant="outline"><Link to="/method">View methodology</Link></Button></div>}
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
