import { Seo } from '@/components/shared/Seo'
import { Hero } from '@/components/home/Hero'
import { ProofStrip } from '@/components/home/ProofStrip'
import { WhatWeBuild } from '@/components/home/WhatWeBuild'
import { AjendaBlock } from '@/components/home/AjendaBlock'
import { WorkPreview } from '@/components/home/WorkPreview'
import { ResearchPreview } from '@/components/home/ResearchPreview'
import { MethodPreview } from '@/components/home/MethodPreview'
import { InsightsPreview } from '@/components/home/InsightsPreview'
import { ContactCta } from '@/components/home/ContactCta'
import { siteConfig } from '@/data/site'

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
  email: siteConfig.email,
  sameAs: [siteConfig.social.github, siteConfig.social.linkedin],
}

export function HomePage() {
  return (
    <>
      <Seo
        description={siteConfig.description}
        path="/"
        jsonLd={organizationJsonLd}
      />
      <Hero />
      <ProofStrip />
      <WhatWeBuild />
      <AjendaBlock />
      <WorkPreview />
      <ResearchPreview />
      <MethodPreview />
      <InsightsPreview />
      <ContactCta />
    </>
  )
}
