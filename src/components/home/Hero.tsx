import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { siteConfig } from '@/data/site'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(165deg,var(--surface)_0%,var(--bg)_55%,#fff_100%)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--brand) 18%, transparent) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
        }}
      />
      <div className="container-site relative py-16 md:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <Badge variant="brand" className="mb-5">
              AI product studio · Systems builder
            </Badge>
            <h1 className="max-w-2xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {siteConfig.tagline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-muted)]">
              We design and ship governed AI systems, SaaS tools, and business
              operations infrastructure — with clear ownership, human oversight,
              and product proof you can inspect.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" data-analytics="hero-primary-cta">
                <Link to="/work">
                  See what we build
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                data-analytics="hero-secondary-cta"
              >
                <Link to="/contact">Discuss a project</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-[var(--text-muted)]">
              Self-serve research first. Human help when you need it.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-5 shadow-[0_24px_60px_-28px_rgba(8,20,38,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  System surface
                </span>
                <span className="rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--success)]">
                  Governed
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Goal', value: 'Ship Q3 ops automation' },
                  { label: 'Plan', value: '4 workstreams · 12 tasks' },
                  { label: 'Controls', value: 'Human review on external actions' },
                  { label: 'Status', value: '3/12 complete · on track' },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-start justify-between gap-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3"
                  >
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      {row.label}
                    </span>
                    <span className="text-right text-sm font-medium text-[var(--text)]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-[var(--radius-sm)] border border-dashed border-[var(--border)] bg-[var(--bg)] px-3.5 py-3 text-sm text-[var(--text-muted)]">
                Product UI over abstract “AI” visuals — clarity is the trust
                signal.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
