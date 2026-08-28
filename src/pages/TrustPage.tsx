import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Scale, Server } from 'lucide-react'

const pillars = [
  {
    icon: Shield,
    title: 'Authority boundaries',
    body: 'Security-sensitive actions require explicit capability and authority boundaries appropriate to the system rather than implicit permission derived from interpretation alone.',
  },
  {
    icon: Eye,
    title: 'Inspectability',
    body: 'System behavior, state transitions, approvals, controls, and relevant execution evidence should be inspectable where the architecture and risk model require it.',
  },
  {
    icon: Scale,
    title: 'Failure handling',
    body: 'Review paths, recovery behavior, failure states, and decision ownership are treated as architecture concerns rather than post-implementation additions.',
  },
  {
    icon: Server,
    title: 'Operational security',
    body: 'Access control, secure defaults, least privilege, data boundaries, configuration, and operational practices are applied according to the implementation and deployment context.',
  },
]

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
        <div className="container-site grid gap-5 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <Card key={pillar.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand)]">
                    <pillar.icon className="h-5 w-5" aria-hidden />
                  </span>
                  {pillar.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-relaxed text-[var(--text-muted)]">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">Evidence boundary</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
            Public documentation describes controls and development practices only to the extent supported by the current implementation and operating environment. Security-sensitive implementation details, credentials, private configuration, and confidential system information are not published as proof material.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild><Link to="/contact">Security / trust inquiry</Link></Button>
            <Button asChild variant="outline"><Link to="/method">Development method</Link></Button>
          </div>
        </div>
      </section>
    </>
  )
}
