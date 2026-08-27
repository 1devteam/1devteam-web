import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { navLinks, siteConfig } from '@/data/site'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const primaryNavLinks = [
  { label: 'R&D', href: '/research' },
  ...navLinks,
] as const

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md">
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center"
          aria-label="1devteam home"
          onClick={() => setOpen(false)}
        >
          <img
            src={siteConfig.brand.companyOnLight}
            alt="1devteam"
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {primaryNavLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]',
                  isActive && 'bg-[var(--surface)] text-[var(--text)]',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="outline" size="sm">
            <Link to="/work">See what we build</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/contact">Discuss a project</Link>
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-[var(--border)] bg-[var(--bg)] lg:hidden"
        >
          <nav className="container-site flex flex-col gap-1 py-4" aria-label="Mobile">
            {primaryNavLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-[var(--radius-sm)] px-3 py-3 text-base font-medium text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]',
                    isActive && 'bg-[var(--surface)] text-[var(--text)]',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/work" onClick={() => setOpen(false)}>
                  See what we build
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  Discuss a project
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
