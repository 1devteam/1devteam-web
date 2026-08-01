import { Link } from 'react-router-dom'
import { footerLinks, siteConfig } from '@/data/site'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--navy-950)] text-white">
      <div className="container-site section-pad !pb-10 !pt-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5 font-semibold">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--brand)] text-sm font-bold"
                aria-hidden
              >
                1
              </span>
              <span>{siteConfig.name}</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-300">
              AI product studio and systems builder. Governed systems that move
              businesses from goals to execution.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-white">
              Company
            </h2>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-white">
              Offerings
            </h2>
            <ul className="space-y-2">
              {footerLinks.offerings.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-white">
              Trust & legal
            </h2>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-slate-300 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-400">
              <a
                href={`mailto:${siteConfig.email}`}
                className="transition-colors hover:text-white"
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <p className="text-slate-500">
            Built as a proof-backed technical company site — not a brochure.
          </p>
        </div>
      </div>
    </footer>
  )
}
