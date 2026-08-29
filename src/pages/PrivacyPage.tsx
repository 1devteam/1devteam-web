import { PageHero } from '@/components/shared/PageHero'
import { Seo } from '@/components/shared/Seo'
import { siteConfig } from '@/data/site'

export function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy"
        description="Privacy policy for 1devteam L.L.C., including website information and data received through LinkedIn integrations."
        path="/privacy"
      />
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        description="How 1devteam L.L.C. handles website, contact, and authorized LinkedIn integration data."
      />
      <section className="section-pad">
        <div className="container-site prose-measure space-y-6 text-[16px] leading-relaxed text-[var(--text-muted)]">
          <p>
            <strong className="text-[var(--text)]">Last updated:</strong> August 29,
            2026
          </p>
          <p>
            {siteConfig.legalName} (“1devteam”, “we”, “us”, or “our”) operates
            this website and is the developer and data controller for the
            1devteam LinkedIn integration described below.
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
          <h2 className="text-xl font-semibold text-[var(--text)]">
            LinkedIn integration data
          </h2>
          <p>
            If an authorized administrator connects a LinkedIn account or
            organization Page to a 1devteam application, LinkedIn may provide us
            with the administrator's LinkedIn member identifier and basic account
            information, organization identifiers and Page metadata, granted
            permissions, access-token and authorization metadata, content the
            administrator asks the application to publish or manage, and API
            response or error information needed to operate and secure the
            integration. The exact data received depends on the LinkedIn products
            and permissions approved for the application.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            How we use LinkedIn data
          </h2>
          <p>
            We use LinkedIn data only to authenticate an authorized administrator,
            verify the organizations they are permitted to manage, publish or
            manage organization content at their direction, display integration
            status, prevent abuse, troubleshoot failures, and maintain security
            and audit records. We do not use LinkedIn data for advertising
            profiles, unrelated analytics, data brokerage, resale, or scraping.
            We do not post, edit, or delete LinkedIn content without an action
            initiated or configured by an authorized administrator.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Data and content ownership
          </h2>
          <p>
            LinkedIn and its licensors retain all rights in LinkedIn and data
            supplied through its platform. Administrators and their organizations
            retain their rights in content they provide or direct us to publish,
            subject to LinkedIn's terms. {siteConfig.legalName} does not claim
            ownership of LinkedIn member data, organization data, or customer
            content. We own our application software and our independently created
            operational and security records. No LinkedIn data is sold or licensed
            as a standalone asset.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Sharing and service providers
          </h2>
          <p>
            We disclose LinkedIn data only to LinkedIn as required to perform the
            requested API action; to infrastructure and security providers acting
            for us under appropriate restrictions; when required by law; or to
            protect users, the public, or our legal rights. We do not share
            LinkedIn data with independent third parties for their own marketing.
          </p>
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Retention, revocation, and deletion
          </h2>
          <p>
            We retain LinkedIn data only while the integration is connected and
            as reasonably necessary to provide the requested function, maintain
            security and audit records, resolve disputes, or meet legal
            obligations. Access credentials are removed or rendered unusable when
            access is revoked, expires, or is no longer required. An administrator
            may revoke access through LinkedIn settings and may request deletion
            of LinkedIn-derived data by emailing us. We will delete or de-identify
            eligible data within 30 days, except information we must retain for
            security, fraud prevention, legal compliance, or the establishment,
            exercise, or defense of legal claims.
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
            Privacy questions, LinkedIn data requests, access revocation support,
            or deletion requests:{' '}
            <a
              href={`mailto:${siteConfig.privacyEmail}`}
              className="font-medium text-[var(--brand)] hover:underline"
            >
              {siteConfig.privacyEmail}
            </a>
            . Identify the connected LinkedIn organization and the request you
            want us to complete. We may verify your authority before acting.
          </p>
        </div>
      </section>
    </>
  )
}
