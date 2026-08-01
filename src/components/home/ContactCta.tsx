import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function ContactCta() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--navy-900)] px-6 py-12 text-white md:px-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Ready to discuss a system worth building?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300 md:text-lg">
              Explore the work on your own, or talk with us about a project.
              Short form. Clear next step. No transformation pitch deck.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="bg-[var(--brand)] hover:bg-[var(--brand-hover)]"
              >
                <Link to="/contact" data-analytics="contact-cta">
                  Discuss a project
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Link to="/work">See what we build</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
