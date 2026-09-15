import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { wikiCategories, wikiEntries } from '@/data/wiki'
import { featuredWikiIds } from '@/data/wikiFeatured'

export function WikiPage() {
  return (
    <>
      <Seo path="/wiki" />

      <PageHero
        eyebrow="Term index"
        title="Reference terms used across 1DevTeam systems and research"
        description="Short definitions for process, architecture, and study vocabulary. Expanded articles exist where a term has a dedicated reference page. G.R.A.F.T.+ is the reconstruction workbench; it is not this index."
      >
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/graft">Open G.R.A.F.T.+</Link>
          </Button>
        </div>
      </PageHero>

      <section className="section-pad">
        <div className="container-site space-y-14">
          {wikiCategories.map((category) => {
            const entries = wikiEntries.filter((entry) => entry.category === category)
            return (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{category}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{category}</h2>
                <dl className="mt-6">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      id={entry.id}
                      className="scroll-mt-24 grid gap-2 border-t border-[var(--border)] py-5 md:grid-cols-[0.32fr_0.68fr]"
                    >
                      <dt>
                        <p className="text-base font-semibold text-[var(--text)]">{entry.title}</p>
                        {entry.status ? (
                          <p className="mt-1 text-xs font-medium text-[var(--text-subtle)]">{entry.status}</p>
                        ) : null}
                      </dt>
                      <dd>
                        <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">{entry.summary}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                          {entry.id === 'grafted-plus' ? (
                            <Link to="/graft" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline">
                              Open G.R.A.F.T.+ <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                          ) : null}
                          {featuredWikiIds.has(entry.id) ? (
                            <Link to={`/wiki/${entry.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline">
                              Read expanded reference <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                          ) : null}
                        </div>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
