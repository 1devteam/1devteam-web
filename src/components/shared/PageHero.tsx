import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  eyebrow?: string
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'border-b border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--bg)_100%)]',
        className,
      )}
    >
      <div className="container-site py-14 md:py-20">
        {eyebrow && (
          <Badge variant="brand" className="mb-4">
            {eyebrow}
          </Badge>
        )}
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  )
}
