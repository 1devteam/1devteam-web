import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { navLinks } from '@/data/site'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const primaryNavLinks = [...navLinks, { label: 'R&D', href: '/research' }] as const

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] backdrop-blur-md">
      <div className="container-site flex min-h-16 items-center justify-between gap-4 py-2">
        <Link to="/" className="flex items-center gap-3" aria-label="1DevTeam home" onClick={() => setOpen(false)}>
          <img src="/brand/1devteam-mark.svg" alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
          <span className="font-brand text-[15px] font-bold tracking-[0.16em] text-[var(--text)] sm:text-base">1DEVTEAM</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {primaryNavLinks.map((link) => (
            <NavLink key={link.href} to={link.href} className={({ isActive }) => cn('rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]', isActive && 'bg-[var(--surface)] text-[var(--text)]')}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex"><Button asChild size="sm"><Link to="/contact">Discuss a project</Link></Button></div>

        <Button type="button" variant="outline" size="icon" className="lg:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--bg)] lg:hidden">
          <nav className="container-site flex flex-col gap-1 py-4" aria-label="Mobile">
            {primaryNavLinks.map((link) => (
              <NavLink key={link.href} to={link.href} onClick={() => setOpen(false)} className={({ isActive }) => cn('rounded-[var(--radius-sm)] px-3 py-3 text-base font-medium text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]', isActive && 'bg-[var(--surface)] text-[var(--text)]')}>
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 border-t border-[var(--border)] pt-4"><Button asChild className="w-full"><Link to="/contact" onClick={() => setOpen(false)}>Discuss a project</Link></Button></div>
          </nav>
        </div>
      )}
    </header>
  )
}
