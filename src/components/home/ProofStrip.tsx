import { proofPoints } from '@/data/site'
import { ShieldCheck, Boxes, Rocket, Cpu } from 'lucide-react'

const icons = [ShieldCheck, Cpu, Boxes, Rocket]

export function ProofStrip() {
  return (
    <section
      className="border-b border-[var(--border)] bg-white"
      aria-label="Trust signals"
    >
      <div className="container-site py-8 md:py-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proofPoints.map((point, i) => {
            const Icon = icons[i] ?? ShieldCheck
            return (
              <li
                key={point.title}
                className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]/60 p-4"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {point.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                    {point.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
