import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Scale, Server } from 'lucide-react'

const pillars = [
  {
    icon: Shield,
    title: 'Human oversight',
    body: 'High-risk actions in the systems we build are designed with review gates and clear ownership — not unbounded autonomy.',
  },
  {
    icon: Eye,
    title: 'Inspectability',
    body: 'We favor architectures, product notes, and operating models that buyers and operators can examine and challenge.',
  },
  {
    icon: Scale,
    title: 'Accountability',
    body: 'Governance is part of delivery: evaluation, failure handling, and decision rights are first-class design inputs.',
  },
  {
    icon: Server,
    title: 'Operational security',
    body: 'Production systems use least-privilege access patterns, secure defaults, and documented operational practices appropriate to the engagement.',
  },
]

export function TrustPage() {
  return (
    <>
      <Seo
        title="Trust & Security"
        description="How 1devteam approaches AI governance, human oversight, inspectability, and security for production systems."
        path="/trust"
      />
      <PageHero
        eyebrow="Trust"
        title="Trust is calibrated, not claimed"
        description="Professional design is table stakes. Buyers need disclosure, current evidence, and systems that show where humans stay in control. This page is our lightweight trust layer."
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
                <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">
                  {pillar.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] section-pad">
        <div className="container-site max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-tight">
            What this page is — and is not
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]">
            This is not a compliance certificate dump. It is an honest signal of
            how we think about risk when AI systems act in real businesses. For
            engagement-specific security questionnaires, data processing terms,
            or architecture reviews, contact us.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/contact">Security / trust inquiry</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/method">Read our method</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
