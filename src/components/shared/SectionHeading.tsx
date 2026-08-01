import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <Badge variant="brand" className="mb-4">
          {eyebrow}
        </Badge>
      )}
      <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-[17px] leading-relaxed text-[var(--text-muted)]',
            align === 'center' && 'mx-auto prose-measure',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
