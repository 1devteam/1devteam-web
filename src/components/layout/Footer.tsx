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
            <Link to="/" className="mb-4 inline-flex" aria-label="1devteam home">
              <img
                src={siteConfig.brand.companyOnDark}
                alt="1devteam"
                className="h-11 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-300">
              AI product studio and systems builder. Governed systems that move
              businesses from goals to execution.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 transition-colors hover:text-white"
              >
                GitHub
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 transition-colors hover:text-white"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold tracking-wide text-white">
              Company
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/research"
                  className="text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Research & Development
                </Link>
              </li>
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
            <div className="mt-4 space-y-1 text-sm text-slate-400">
              <p>
                Studio{' '}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="transition-colors hover:text-white"
                >
                  {siteConfig.email}
                </a>
              </p>
              <p>
                Ajenda{' '}
                <a
                  href={`mailto:${siteConfig.productEmail}`}
                  className="transition-colors hover:text-white"
                >
                  {siteConfig.productEmail}
                </a>
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col gap-3 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <p className="text-slate-400">
            Built as a proof-backed technical company site — not a brochure.
          </p>
        </div>
      </div>
    </footer>
  )
}
