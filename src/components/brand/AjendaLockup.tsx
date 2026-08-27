import { siteConfig } from '@/data/site'
import { cn } from '@/lib/utils'

type AjendaLockupProps = {
  tone?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'text-[1.45rem]',
  md: 'text-[1.9rem]',
  lg: 'text-[2.55rem]',
} as const

export function AjendaLockup({
  tone = 'light',
  size = 'md',
  className,
}: AjendaLockupProps) {
  return (
    <span
      role="img"
      aria-label="Ajenda AI"
      className={cn(
        'inline-flex items-center gap-[0.24em] whitespace-nowrap leading-none',
        sizeClasses[size],
        className,
      )}
    >
      <img
        src={siteConfig.brand.productMark}
        alt=""
        aria-hidden="true"
        className="h-[1em] w-[1em] shrink-0"
      />
      <span
        className={cn(
          'font-medium tracking-[-0.045em]',
          tone === 'dark' ? 'text-[#F7F6F2]' : 'text-[#0B1220]',
        )}
        style={{ fontFamily: 'Outfit, Inter, ui-sans-serif, sans-serif' }}
      >
        ajenda-ai
      </span>
    </span>
  )
}
