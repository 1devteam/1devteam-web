import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { wikiCategories, wikiEntries, type WikiCategory } from '@/data/wiki'

const allCategories = ['All', ...wikiCategories] as const

type CategoryFilter = 'All' | WikiCategory

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
        description="Canonical definitions for 1DevTeam software, development systems, architecture concepts, research terminology, and technical artifacts. Implemented behavior, development objectives, research hypotheses, and unresolved questions remain explicitly separated."
      />

      <section className="border-b border-[var(--border)] bg-white py-8">
        <div className="container-site">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
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

            <div className="flex flex-wrap gap-2" aria-label="Wiki categories">
              {allCategories.map((item) => {
                const active = category === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                        : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--text)]'
                    }`}
                    aria-pressed={active}
                  >
                    {item}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-subtle)]">
            <span><strong className="text-[var(--text)]">{wikiEntries.length}</strong> canonical entries</span>
            <span><strong className="text-[var(--text)]">{filtered.length}</strong> shown</span>
            <span>Systems · Architecture · Research · Glossary</span>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.26fr_0.74fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Index</p>
            <nav className="mt-4 max-h-[68vh] space-y-1 overflow-auto pr-2" aria-label="Wiki entry index">
              {filtered.map((entry) => (
                <a
                  key={entry.id}
                  href={`#${entry.id}`}
                  className="block border-l border-transparent py-2 pl-3 text-sm text-[var(--text-muted)] hover:border-[var(--brand)] hover:text-[var(--text)]"
                >
                  <span className="block font-medium text-[var(--text)]">{entry.title}</span>
                  <span className="mt-0.5 block text-xs text-[var(--text-subtle)]">{entry.category}</span>
                </a>
              ))}
            </nav>
          </aside>

          <div className="max-w-4xl">
            {filtered.length === 0 ? (
              <div className="border-l-4 border-[var(--border)] pl-6 py-2">
                <h2 className="text-xl font-semibold">No matching wiki entry</h2>
                <p className="mt-2 text-base leading-relaxed text-[var(--text-muted)]">
                  Change the search term or select a different category. The wiki only returns concepts currently defined in the reference set.
                </p>
              </div>
            ) : (
              <div>
                {filtered.map((entry) => (
                  <article
                    key={entry.id}
                    id={entry.id}
                    className="scroll-mt-24 border-t border-[var(--border)] py-10"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">{entry.category}</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{entry.title}</h2>
                      </div>
                      {entry.status && <span className="text-xs font-medium text-[var(--text-subtle)]">{entry.status}</span>}
                    </div>

                    <p className="mt-5 text-lg font-medium leading-relaxed text-[var(--text)]">{entry.summary}</p>
                    <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">{entry.detail}</p>

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
                  </article>
                ))}
              </div>
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
        </div>
      </section>
    </>
  )
}
