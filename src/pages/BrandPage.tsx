import { AjendaLockup } from '@/components/brand/AjendaLockup'
import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { siteConfig } from '@/data/site'

const companyColors = [
  { name: 'Electric Blue', hex: '#0066FF' },
  { name: 'Deep Blue', hex: '#0047B3' },
  { name: 'Midnight', hex: '#0A1120' },
  { name: 'Slate', hex: '#667085' },
  { name: 'Silver', hex: '#D1D5DB' },
  { name: 'White', hex: '#FFFFFF' },
]

const ajendaColors = [
  { name: 'Midnight Navy', hex: '#0B1220' },
  { name: 'Electric Blue', hex: '#2563FF' },
  { name: 'Cornflower', hex: '#60A5FA' },
  { name: 'Warm Off-White', hex: '#F7F6F2' },
  { name: 'Crimson', hex: '#E0243B' },
  { name: 'Signal Green', hex: '#35D68A' },
]

function Swatch({ name, hex }: { name: string; hex: string }) {
  const border = hex.toUpperCase() === '#FFFFFF' || hex.toUpperCase() === '#F7F6F2'
  return (
    <div>
      <div
        className="h-16 rounded-[var(--radius-sm)] border"
        style={{ background: hex, borderColor: border ? 'var(--border)' : hex }}
      />
      <p className="mt-2 text-sm font-medium">{name}</p>
      <p className="font-mono text-xs text-[var(--text-muted)]">{hex}</p>
    </div>
  )
}

export function BrandPage() {
  return (
    <>
      <Seo
        title="Brand schema"
        description="Approved 1DevTeam and Ajenda AI brand assets, naming conventions, colors, and usage guidance."
        path="/brand"
        robots="noindex, follow"
      />
      <PageHero
        eyebrow="Brand"
        title="1DevTeam brand assets"
        description="This page provides approved 1DevTeam and Ajenda brand assets, naming conventions, and usage guidance. Brand assets should be reproduced from approved source material without modifying proportions, typography, marks, or intended color relationships."
      />

      <section className="section-pad">
        <div className="container-site space-y-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Company · 1DevTeam</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Company identity</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
              <strong className="text-[var(--text)]">Company name:</strong> 1DevTeam<br />
              <strong className="text-[var(--text)]">Legal entity:</strong> 1DevTeam L.L.C.<br />
              <strong className="text-[var(--text)]">Brand-board line:</strong> Building Intelligent Solutions
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
                <img src="/brand/1devteam-mark-dark.svg" alt="1DevTeam mark" className="h-16 w-auto" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">Company mark · light field</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--navy-950)] p-6">
                <img src="/brand/1devteam-logo-light.svg" alt="1DevTeam logo" className="h-12 w-auto" />
                <p className="mt-4 text-sm text-slate-300">Horizontal lockup · dark field</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--navy-950)] p-6">
                <img src="/brand/1devteam-profile.svg" alt="1DevTeam profile mark" className="h-28 w-28" />
                <p className="mt-4 text-sm text-slate-300">Profile asset · 1:1</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {companyColors.map((c) => <Swatch key={c.hex} {...c} />)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF]">Product · Ajenda AI</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Product identity</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
              <strong className="text-[var(--text)]">Product:</strong> Ajenda AI. The Ajenda product identity uses its own approved mark, lowercase wordmark, product palette, and brand typography. It remains visually related to 1DevTeam without being treated as the company identity.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
                <img src="/brand/ajenda-mark.svg" alt="Ajenda mark" className="h-20 w-20" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">Icon / mark</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
                <AjendaLockup size="md" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">Logo · light field</p>
              </div>
              <div className="flex items-center justify-center rounded-[var(--radius-md)] bg-[#0B1220] p-6">
                <img src="/brand/ajenda-icon-navy.svg" alt="Ajenda app icon" className="h-20 w-20" />
              </div>
              <div className="flex items-center justify-center rounded-[var(--radius-md)] bg-[#2563FF] p-6">
                <img src="/brand/ajenda-icon-blue.svg" alt="Ajenda on blue" className="h-20 w-20" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {ajendaColors.map((c) => <Swatch key={c.hex} {...c} />)}
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <h2 className="text-xl font-semibold">Inboxes and domains</h2>
            <ul className="mt-4 space-y-2 text-base text-[var(--text-muted)]">
              <li>Company: <a className="text-[var(--brand)] hover:underline" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
              <li>Ajenda: <a className="text-[var(--brand)] hover:underline" href={`mailto:${siteConfig.productEmail}`}>{siteConfig.productEmail}</a></li>
              <li>Company site: 1devteam.com</li>
              <li>Product site: ajenda-ai.com</li>
            </ul>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Company and product assets retain their respective marks and color systems. Do not substitute one identity for the other.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
