import type * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--surface-strong)] text-[var(--text)]',
        brand:
          'border-transparent bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand-hover)]',
        outline: 'border-[var(--border)] text-[var(--text-muted)] bg-transparent',
        success:
          'border-transparent bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
