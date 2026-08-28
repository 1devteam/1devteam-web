import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'

const pillars = [
  {
    title: 'Authority boundaries',
    body: 'Security-sensitive actions require explicit capability and authority boundaries appropriate to the system rather than implicit permission derived from interpretation alone.',
  },
  {
    title: 'Inspectability',
    body: 'System behavior, state transitions, approvals, controls, and relevant execution evidence should be inspectable where the architecture and risk model require it.',
  },
  {
    title: 'Failure handling',
    body: 'Review paths, recovery behavior, failure states, and decision ownership are treated as architecture concerns rather than post-implementation additions.',
  },
  {
    title: 'Operational security',
    body: 'Access control, secure defaults, least privilege, data boundaries, configuration, and operational practices are applied according to the implementation and deployment context.',
  },
] as const

export function TrustPage() {
  return (
    <>
      <Seo
        title="Trust & Security"
        description="1DevTeam treats security, authority, data access, external actions, state transitions, failure handling, and auditability as architecture concerns."
        path="/trust"
      />
      <PageHero
        eyebrow="Trust & Security"
        title="Security and system trust require explicit boundaries."
        description="1DevTeam treats security, authority, data access, external actions, state transitions, failure handling, and auditability as architecture concerns rather than presentation-layer claims."
      />

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-[0.34fr_0.66fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Trust model</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Trust comes from system behavior that can be bounded and inspected</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
              Confidence language is not a substitute for architecture. The relevant question is whether authority, state, evidence, failure handling, and operational boundaries are represented clearly enough to verify what the system can and cannot do.
            </p>
          </div>

          <div className="max-w-4xl">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="border-t border-[var(--border)] py-7">
                <h3 className="text-xl font-semibold">{pillar.title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-[var(--text-muted)]">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[0.34fr_0.66fr]">
          <h2 className="text-2xl font-semibold tracking-tight">Evidence boundary</h2>
          <div className="max-w-4xl">
            <p className="text-[17px] leading-relaxed text-[var(--text-muted)]">
              Public documentation describes controls and development practices only to the extent supported by the current implementation and operating environment. Security-sensitive implementation details, credentials, private configuration, and confidential system information are not published as proof material.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild><Link to="/contact">Security / trust inquiry</Link></Button>
              <Button asChild variant="outline"><Link to="/method">Development method</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
