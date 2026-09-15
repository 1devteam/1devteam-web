import { Link } from 'react-router-dom'
import { graftGuideIntro, graftGuideSections, graftRelatedSystems } from '@/data/graftGuide'

export function GraftUserGuide() {
  return (
    <div>
      <section id="guide" className="border-b border-[var(--border)] bg-[var(--surface)] py-8 scroll-mt-24">
        <div className="container-site max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">{graftGuideIntro.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{graftGuideIntro.title}</h2>
          <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-[var(--text-muted)]">{graftGuideIntro.lede}</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.28fr_0.72fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">On this guide</p>
            <nav
              className="mt-5 max-h-[70vh] space-y-2 overflow-auto pr-3"
              aria-label="G.R.A.F.T.+ guide"
              tabIndex={0}
            >
              {graftGuideSections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block py-1.5 text-sm leading-snug text-[var(--text-muted)] hover:text-[var(--brand)]"
                >
                  {section.title}
                </a>
              ))}
              <a href="#related-systems" className="block py-1.5 text-sm leading-snug text-[var(--text-muted)] hover:text-[var(--brand)]">
                Related systems
              </a>
              <a href="#term-index" className="block py-1.5 text-sm leading-snug text-[var(--text-muted)] hover:text-[var(--brand)]">
                Term index
              </a>
            </nav>
          </aside>

          <div className="min-w-0 max-w-4xl">
            {graftGuideSections.map((section, index) => (
              <article
                key={section.id}
                id={section.id}
                className={`scroll-mt-24 py-10 ${index > 0 ? 'border-t border-[var(--border)]' : 'border-t-2 border-[var(--text)]'}`}
              >
                <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">{section.title}</h3>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                    {paragraph}
                  </p>
                ))}
                {section.facts && (
                  <dl className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                    {section.facts.map((fact) => (
                      <div key={fact.term} className="grid gap-2 py-4 md:grid-cols-[0.28fr_0.72fr]">
                        <dt className="text-sm font-semibold text-[var(--text)]">{fact.term}</dt>
                        <dd className="text-[17px] leading-relaxed text-[var(--text-muted)]">{fact.meaning}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {section.steps && (
                  <ol className="mt-6 space-y-5">
                    {section.steps.map((step, stepIndex) => (
                      <li key={step.label} className="grid gap-2 md:grid-cols-[2.5rem_1fr]">
                        <span className="font-mono text-sm font-semibold text-[var(--brand)]">
                          {String(stepIndex + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="text-base font-semibold text-[var(--text)]">{step.label}</p>
                          <p className="mt-1 text-[17px] leading-relaxed text-[var(--text-muted)]">{step.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            ))}

            <section id="related-systems" className="scroll-mt-24 border-t border-[var(--border)] py-10">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">Related systems</h3>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                Expanded references remain on dedicated pages. They are not the G.R.A.F.T.+ prototype; they are the surrounding development systems the reconstruction is meant to serve.
              </p>
              <ul className="mt-6 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {graftRelatedSystems.map((item) => (
                  <li key={item.id} className="py-4">
                    <Link to={item.href} className="text-base font-semibold text-[var(--brand)] hover:underline">
                      {item.label}
                    </Link>
                    <p className="mt-1 text-[17px] leading-relaxed text-[var(--text-muted)]">{item.note}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section id="term-index" className="scroll-mt-24 border-t border-[var(--border)] py-10">
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">Term index</h3>
              <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
                Definitions for PRIDE, Snapshot, blast radius, proof selection, and related study terms live on the term index. They are surrounding development vocabulary, not the G.R.A.F.T.+ prototype.
              </p>
              <p className="mt-4">
                <Link to="/wiki" className="text-base font-semibold text-[var(--brand)] hover:underline">
                  Open the term index →
                </Link>
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  )
}
