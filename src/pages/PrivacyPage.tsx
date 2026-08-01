import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { siteConfig } from '@/data/site'

export function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy"
        description="Privacy policy for 1devteam — how we handle contact information and site analytics."
        path="/privacy"
      />
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        description="How we handle information when you use this website or contact us."
      />
      <section className="section-pad">
        <div className="container-site prose-measure space-y-6 text-[16px] leading-relaxed text-[var(--text-muted)]">
          <p>
            <strong className="text-[var(--text)]">Last updated:</strong> July 14,
            2026
          </p>
          <p>
            {siteConfig.name} (“we”, “us”) operates this website. This page
            describes what we collect and why. We keep the policy readable on
            purpose.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Information you provide
          </h2>
          <p>
            When you use the contact form or email us, we receive the details you
            submit — typically name, work email, company or role, project
            interest, and any context you share. We use that information to
            respond and evaluate fit. We do not sell personal information.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">Analytics</h2>
          <p>
            We may use privacy-first analytics (for example Cloudflare Web
            Analytics) to understand aggregate pageviews, referrers, and
            performance. If we add session replay or richer behavioral tools, we
            will update this page and apply masking and disclosure appropriate to
            those tools.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">Cookies</h2>
          <p>
            Essential cookies may be required for basic site operation. Analytics
            cookies, if any, will be documented here when enabled.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">Contact</h2>
          <p>
            Privacy questions:{' '}
            <a
              href={`mailto:${siteConfig.email}`}
              className="font-medium text-[var(--brand)] hover:underline"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>
      </section>
    </>
  )
}
