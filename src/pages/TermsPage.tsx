import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { siteConfig } from '@/data/site'

export function TermsPage() {
  return (
    <>
      <Seo
        title="Terms"
        description="Terms of use for the 1devteam website."
        path="/terms"
      />
      <PageHero
        eyebrow="Legal"
        title="Terms of use"
        description="Ground rules for using this website and its content."
      />
      <section className="section-pad">
        <div className="container-site prose-measure space-y-6 text-[16px] leading-relaxed text-[var(--text-muted)]">
          <p>
            <strong className="text-[var(--text)]">Last updated:</strong> July 14,
            2026
          </p>
          <p>
            By using {siteConfig.name}’s website, you agree to these terms. If
            you do not agree, do not use the site.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Site content
          </h2>
          <p>
            Content is provided for general information about our company,
            products, and services. It is not a binding offer unless we enter a
            separate written agreement. Product features and availability may
            change.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Acceptable use
          </h2>
          <p>
            Do not misuse the site, attempt unauthorized access, scrape in ways
            that degrade service, or use content to misrepresent affiliation with{' '}
            {siteConfig.name}.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            No warranty
          </h2>
          <p>
            The site is provided “as is.” To the fullest extent permitted by law,
            we disclaim warranties regarding accuracy, availability, and fitness
            for a particular purpose.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">Contact</h2>
          <p>
            Questions:{' '}
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
