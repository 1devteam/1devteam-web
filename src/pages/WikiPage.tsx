import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { wikiCategories, wikiEntries, type WikiCategory } from '@/data/wiki'

const allCategories = ['All', ...wikiCategories] as const

type CategoryFilter = 'All' | WikiCategory

const chapterIntroductions: Record<WikiCategory, string> = {
  Systems:
    'The systems chapter describes the software, development mechanisms, and R&D outputs that exist because different parts of the development problem require different forms of structure. Read these entries together: PRIDE addresses process discipline, Snapshot addresses project-context transfer, and the Architectural Graph externalizes architecture for reasoning and proof.',
  Architecture:
    'The architecture chapter defines the relationships used to reason beyond the file being edited. These terms describe ownership, dependencies, invariants, blast radius, graph relationships, and the proof surface required when a local change can affect a larger system.',
  Research:
    'The research chapter defines the units used in 1DevTeam R&D Program #1. These entries separate what is being measured from what is merely observed, preserve the graph intervention boundary, and prevent preliminary patterns from being presented as settled findings.',
  Glossary:
    'The glossary collects supporting terms used across Ajenda, the development method, architecture work, and the research program. They are included so a reader can move through the site without needing to infer specialized meanings from context alone.',
}

const siteReferences: Partial<Record<string, readonly { label: string; href: string }[]>> = {
  'pride-protocol': [
    { label: 'View the preserved PRIDE working artifact', href: '/#pride-protocol' },
    { label: 'Read the development method', href: '/method' },
  ],
  snapshot: [{ label: 'Inspect Snapshot execution and structured output', href: '/#snapshot' }],
  'architectural-graph': [{ label: 'Inspect the canonical interactive Architectural Graph', href: '/#architecture-graph' }],
  'ajenda-ai': [{ label: 'Explore Ajenda AI', href: '/products/ajenda' }],
  'grafted-plus': [{ label: 'Read the R&D program', href: '/research' }],
  'grafted-first': [{ label: 'Read the R&D program', href: '/research' }],
  'architectural-blast-radius': [{ label: 'Read the R&D program', href: '/research' }],
  'pr-cascade': [{ label: 'Read the R&D program', href: '/research' }],
  'reasoning-scope': [{ label: 'Read the R&D program', href: '/research' }],
  'change-scope': [{ label: 'Read the R&D program', href: '/research' }],
}

export function WikiPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('All')

  const idByTitle = useMemo(
    () => new Map(wikiEntries.map((entry) => [entry.title, entry.id])),
    [],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    return wikiEntries.filter((entry) => {
      if (category !== 'All' && entry.category !== category) return false
      if (!normalized) return true

      return [
        entry.title,
        entry.category,
        entry.summary,
        entry.detail,
        entry.status ?? '',
        ...entry.related,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
    })
  }, [category, query])

  const grouped = useMemo(
    () =>
      wikiCategories
        .map((group) => ({
          category: group,
          entries: filtered.filter((entry) => entry.category === group),
        }))
        .filter((group) => group.entries.length > 0),
    [filtered],
  )

  const searching = query.trim().length > 0 || category !== 'All'

  return (
    <>
      <Seo
        title="Technical Wiki"
        description="Reference documentation for 1DevTeam software, development systems, architecture, terminology, and applied R&D."
        path="/wiki"
      />

      <PageHero
        eyebrow="Technical Wiki"
        title="Reference documentation for the systems behind the work"
        description="A connected technical reference for people building software alongside AI. The wiki defines the systems, architecture, research language, and technical concepts used across 1DevTeam while keeping implemented behavior, development objectives, hypotheses, and unresolved questions explicitly separate."
      />

      <section className="section-pad border-b border-[var(--border)]">
        <div className="container-site max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">How to read the reference</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">Follow the relationships, not just the definitions.</h2>
          <div className="mt-6 max-w-4xl space-y-5 text-[17px] leading-relaxed text-[var(--text-muted)]">
            <p>
              This wiki is structured as a companion to the technical narrative across the rest of the site. Individual definitions are useful on their own, but the larger value comes from following how one concept leads into another: process discipline leads to context transfer, context transfer exposes the need for persistent architecture, architecture changes how blast radius and proof can be reasoned about, and those changes become measurable inside the research program.
            </p>
            <p>
              A useful first reading path is <a href="#pride-protocol" className="font-medium text-[var(--brand)] hover:underline">PRIDE Protocol</a> → <a href="#snapshot" className="font-medium text-[var(--brand)] hover:underline">Snapshot</a> → <a href="#architectural-graph" className="font-medium text-[var(--brand)] hover:underline">Architectural Graph</a> → <a href="#architectural-blast-radius" className="font-medium text-[var(--brand)] hover:underline">Architectural blast radius</a> → <a href="#reasoning-scope" className="font-medium text-[var(--brand)] hover:underline">Reasoning scope</a> → <a href="#pr-cascade" className="font-medium text-[var(--brand)] hover:underline">Corrective PR cascade</a>.
            </p>
            <p>
              The preserved PRIDE artifact, Snapshot execution and JSON excerpt, and live Architectural Graph remain on the homepage as canonical figures. Wiki entries cross-reference those figures rather than duplicating them.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-8">
        <div className="container-site">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block max-w-2xl">
              <span className="sr-only">Search the technical wiki</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-subtle)]" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search systems, architecture, research, or terminology"
                className="h-12 w-full rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white pl-12 pr-4 text-base text-[var(--text)] shadow-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_18%,transparent)]"
              />
            </label>

            <div className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Wiki categories">
              {allCategories.map((item) => {
                const active = category === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`border-b-2 py-1 text-sm font-semibold transition ${
                      active
                        ? 'border-[var(--brand)] text-[var(--text)]'
                        : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text)]'
                    }`}
                    aria-pressed={active}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="mt-5 text-sm text-[var(--text-subtle)]">
            <strong className="text-[var(--text)]">{filtered.length}</strong> of {wikiEntries.length} canonical entries
            {searching ? ' match the current reference view.' : ' are available across Systems, Architecture, Research, and Glossary.'}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.27fr_0.73fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">On this page</p>
            <nav className="mt-5 max-h-[70vh] space-y-7 overflow-auto pr-3" aria-label="Wiki entry index">
              {grouped.map((group) => (
                <div key={group.category}>
                  <a href={`#chapter-${group.category.toLowerCase()}`} className="text-sm font-semibold text-[var(--text)] hover:text-[var(--brand)]">
                    {group.category}
                  </a>
                  <div className="mt-2 border-l border-[var(--border)] pl-3">
                    {group.entries.map((entry) => (
                      <a
                        key={entry.id}
                        href={`#${entry.id}`}
                        className="block py-1.5 text-sm leading-snug text-[var(--text-muted)] hover:text-[var(--brand)]"
                      >
                        {entry.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 max-w-4xl">
            {filtered.length === 0 ? (
              <div className="border-l-4 border-[var(--border)] py-2 pl-6">
                <h2 className="text-xl font-semibold">No matching wiki entry</h2>
                <p className="mt-2 text-base leading-relaxed text-[var(--text-muted)]">
                  Change the search term or select a different category. The wiki only returns concepts currently defined in the reference set.
                </p>
              </div>
            ) : (
              grouped.map((group, groupIndex) => (
                <section
                  key={group.category}
                  id={`chapter-${group.category.toLowerCase()}`}
                  className={`scroll-mt-24 ${groupIndex > 0 ? 'mt-20 border-t border-[var(--border)] pt-14' : ''}`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">Reference chapter</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{group.category}</h2>
                  <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-[var(--text-muted)]">
                    {chapterIntroductions[group.category]}
                  </p>

                  <div className="mt-10">
                    {group.entries.map((entry, entryIndex) => {
                      const references = siteReferences[entry.id]
                      return (
                        <article
                          key={entry.id}
                          id={entry.id}
                          className={`scroll-mt-24 py-10 ${entryIndex > 0 ? 'border-t border-[var(--border)]' : 'border-t-2 border-[var(--text)]'}`}
                        >
                          <div className="grid gap-5 md:grid-cols-[0.23fr_0.77fr]">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{entry.category}</p>
                              {entry.status && <p className="mt-2 text-xs leading-relaxed text-[var(--text-subtle)]">{entry.status}</p>}
                            </div>

                            <div>
                              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{entry.title}</h3>
                              <p className="mt-4 text-lg font-medium leading-relaxed text-[var(--text)]">{entry.summary}</p>
                              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">{entry.detail}</p>

                              {references && (
                                <div className="mt-5 space-y-1.5 text-sm">
                                  {references.map((reference) => (
                                    <a key={reference.href + reference.label} href={reference.href} className="block font-semibold text-[var(--brand)] hover:underline">
                                      {reference.label} →
                                    </a>
                                  ))}
                                </div>
                              )}

                              <div className="mt-6 text-sm leading-relaxed text-[var(--text-subtle)]">
                                <span className="font-semibold uppercase tracking-wide">Related: </span>
                                {entry.related.map((related, index) => {
                                  const relatedId = idByTitle.get(related)
                                  return (
                                    <span key={related}>
                                      {index > 0 && <span aria-hidden> · </span>}
                                      {relatedId ? (
                                        <a href={`#${relatedId}`} className="font-medium text-[var(--brand)] hover:underline">{related}</a>
                                      ) : (
                                        <span>{related}</span>
                                      )}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--navy-950)] py-12 text-white">
        <div className="container-site max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Evidence boundary</p>
          <p className="mt-3 text-xl font-semibold leading-relaxed">
            Implemented behavior is described as implemented. Development objectives remain objectives. Research hypotheses remain hypotheses. Unknowns remain unresolved until evidence supports a stronger classification.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-300">
            The wiki is a reference layer for the work, not a substitute for the underlying artifacts, repository evidence, study records, or implementation itself.
          </p>
        </div>
      </section>
    </>
  )
}
