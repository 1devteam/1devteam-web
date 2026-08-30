import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-bright)] disabled:pointer-events-none disabled:opacity-50 min-h-11 min-w-11 px-5 py-2.5',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--brand-action)] text-[var(--brand-ink)] hover:bg-[var(--brand-hover)] shadow-sm',
        secondary:
          'bg-[var(--surface-strong)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border-control)]',
        outline:
          'border border-[var(--border-control)] bg-transparent text-[var(--text)] hover:bg-[var(--surface)]',
        ghost: 'text-[var(--text)] hover:bg-[var(--surface)]',
        link: 'text-[var(--brand-text)] underline-offset-4 hover:underline min-h-0 min-w-0 px-0 py-0',
      },
      size: {
        default: 'min-h-11 px-5 py-2.5',
        sm: 'min-h-10 px-3.5 text-sm',
        lg: 'min-h-12 px-6 text-base',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
