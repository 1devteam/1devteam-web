import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AjendaCommandCenter } from '@/components/product/AjendaCommandCenter'
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

          <AjendaCommandCenter />
        </div>
      </div>
    </section>
  )
}
