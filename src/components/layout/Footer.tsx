import { Link } from 'react-router-dom'
import { footerLinks, siteConfig } from '@/data/site'
import { Separator } from '@/components/ui/separator'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--navy-950)] text-white">
      <div className="container-site section-pad !pb-10 !pt-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-3" aria-label="1DevTeam home">
              <img src="/brand/1devteam-mark.svg" alt="" aria-hidden="true" className="h-11 w-11" />
              <span className="font-brand text-base font-bold tracking-[0.16em]">1DEVTEAM</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-300">
              Software development and applied R&amp;D conducted alongside AI.
            </p>
            <div className="mt-4 flex gap-4 text-sm">
              <a href={siteConfig.social.github} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">GitHub</a>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">LinkedIn</a>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">Company</h2>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => <li key={link.href}><Link to={link.href} className="text-sm text-slate-300 hover:text-white">{link.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Build</h2>
            <ul className="space-y-2">
              {footerLinks.offerings.map((link) => <li key={link.href}><Link to={link.href} className="text-sm text-slate-300 hover:text-white">{link.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Trust &amp; legal</h2>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => <li key={link.href}><Link to={link.href} className="text-sm text-slate-300 hover:text-white">{link.label}</Link></li>)}
            </ul>
            <div className="mt-4 space-y-1 text-sm text-slate-400">
              <p>{siteConfig.legalName}</p>
              <p>General <a href={`mailto:${siteConfig.email}`} className="hover:text-white">{siteConfig.email}</a></p>
              <p>Privacy <a href={`mailto:${siteConfig.privacyEmail}`} className="hover:text-white">{siteConfig.privacyEmail}</a></p>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />
        <p className="text-sm text-slate-400">© {year} {siteConfig.legalName}. All rights reserved.</p>
      </div>
    </footer>
  )
}
