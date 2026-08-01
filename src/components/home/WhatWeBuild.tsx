import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { buildAreas } from '@/data/site'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WhatWeBuild() {
  return (
    <section className="section-pad">
      <div className="container-site">
        <SectionHeading
          eyebrow="What 1devteam builds"
          title="Working systems — not transformation theater"
          description="We position as a disciplined builder of AI systems, SaaS tools, and operations infrastructure. Concrete categories. Inspectable claims. Outcomes buyers can defend internally."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {buildAreas.map((area) => (
            <Card
              key={area.title}
              className="group transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3">
                  <span>{area.title}</span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--brand)]"
                    aria-hidden
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[15px] leading-relaxed text-[var(--text-muted)]">
                  {area.description}
                </p>
                <Link
                  to={area.href}
                  className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  Explore
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
