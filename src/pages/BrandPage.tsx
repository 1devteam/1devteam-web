import { useEffect } from 'react'
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
        style={{
          background: hex,
          borderColor: border ? 'var(--border)' : hex,
        }}
      />
      <p className="mt-2 text-sm font-medium">{name}</p>
      <p className="font-mono text-xs text-[var(--text-muted)]">{hex}</p>
    </div>
  )
}

export function BrandPage() {
  useEffect(() => {
    const id = 'outfit-font'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap'
    document.head.appendChild(link)
  }, [])

  return (
    <>
      <Seo
        title="Brand schema"
        description="Official 1devteam and Ajenda AI brand systems — marks, color, type, and usage."
        path="/brand"
      />
      <PageHero
        eyebrow="Brand"
        title="Two systems, one company"
        description="1devteam is the studio. Ajenda AI is the product. They share a family but they are not the same identity."
      />

      <section className="section-pad">
        <div className="container-site space-y-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              Company · 1devteam
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Studio system</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-muted)]">
              Vectorized from the 9 July 2026 company kit. Tagline stays{' '}
              <span className="font-medium text-[var(--text)]">
                Building Intelligent Solutions
              </span>
              . Line mark on banners is <span className="font-medium text-[var(--text)]">P2iE</span>.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
                <img src="/brand/1devteam-mark-dark.svg" alt="1D mark" className="h-16 w-auto" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">1D mark · light field</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--navy-950)] p-6">
                <img src="/brand/1devteam-logo-light.svg" alt="1devteam logo" className="h-12 w-auto" />
                <p className="mt-4 text-sm text-slate-400">Horizontal lockup · dark field</p>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--navy-950)] p-6">
                <img src="/brand/1devteam-profile.svg" alt="1devteam profile" className="h-28 w-28" />
                <p className="mt-4 text-sm text-slate-400">Profile 1:1 · 400×400</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {companyColors.map((c) => (
                <Swatch key={c.hex} {...c} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF]">
              Product · Ajenda AI
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Product system</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--text-muted)]">
              From the Ajenda brand board. Forward-moving <span className="font-medium text-[var(--text)]">a</span> mark
              (direction, alignment, clarity). Wordmark is lowercase{' '}
              <span className="font-medium text-[var(--text)]">ajenda-ai</span>. Typeface:{' '}
              <span className="font-medium text-[var(--text)]">Outfit</span> for brand, Inter for UI.
            </p>
            <p
              className="mt-4 max-w-xl text-lg font-medium"
              style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
            >
              The intelligent mission operating system that turns business intent into governed
              action.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
                <img src="/brand/ajenda-mark.svg" alt="Ajenda mark" className="h-20 w-20" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">Icon / mark</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6">
                <img src="/brand/ajenda-logo-dark.svg" alt="Ajenda logo" className="h-12 w-auto" />
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
              {ajendaColors.map((c) => (
                <Swatch key={c.hex} {...c} />
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
            <h2 className="text-xl font-semibold">Inboxes and domains</h2>
            <ul className="mt-4 space-y-2 text-[15px] text-[var(--text-muted)]">
              <li>
                Studio:{' '}
                <a className="text-[var(--brand)] hover:underline" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
              </li>
              <li>
                Ajenda:{' '}
                <a
                  className="text-[var(--brand)] hover:underline"
                  href={`mailto:${siteConfig.productEmail}`}
                >
                  {siteConfig.productEmail}
                </a>
              </li>
              <li>Company site: 1devteam.com</li>
              <li>Product site: ajenda-ai.com</li>
            </ul>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Do not put Ajenda crimson on 1devteam chrome. Do not put the 1D mark on Ajenda
              product UI.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
