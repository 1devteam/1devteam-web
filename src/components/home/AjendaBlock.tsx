import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { AjendaLockup } from '@/components/brand/AjendaLockup'

const differentiators = [
  'Goals become plans, tasks, and accountable progress',
  'Human review gates on high-risk actions',
  'Structured work surface — not another chatbot',
  'Built by 1devteam as the flagship of a broader systems practice',
]

export function AjendaBlock() {
  return (
    <section className="section-pad border-y border-[var(--border)] bg-[var(--surface)]">
      <div className="container-site">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <AjendaLockup className="mb-5" size="md" />
            <SectionHeading
              eyebrow="Flagship product"
              title="Ajenda AI"
              description="Ajenda turns business goals into governed execution. It is designed for operators who need structure, oversight, and progress — not open-ended generation."
            />
            <ul className="mt-8 space-y-3">
              {differentiators.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild data-analytics="ajenda-cta">
                <Link to="/products/ajenda">Explore Ajenda AI</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/products">All products</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge variant="brand">Product</Badge>
              <Badge variant="outline">Governed execution</Badge>
            </div>
            <h3 className="text-xl font-semibold tracking-tight">
              Why Ajenda is not “ChatGPT for work”
            </h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Chat-first tools
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">
                  Ephemeral answers. Weak ownership. Hard to audit. Easy to demo,
                  hard to operate.
                </p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-[var(--brand)]/30 bg-[color-mix(in_srgb,var(--brand)_6%,white)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-hover)]">
                  Ajenda execution model
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text)]">
                  Durable plans, task ownership, control gates, and progress you
                  can defend to a team — not just a prompt history.
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-[var(--text-muted)]">
              Ajenda is prominent because it proves the studio. The company site
              still frames 1devteam as the builder behind Ajenda and future
              systems.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
