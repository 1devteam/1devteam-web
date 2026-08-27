export const siteConfig = {
  name: '1DevTeam',
  legalName: '1DevTeam L.L.C.',
  tagline: 'We build software — and better ways to build it.',
  description:
    '1DevTeam is a software development and applied R&D company that works alongside AI to solve difficult problems, build dependable systems and products, and improve the methods and tools used to develop them.',
  url: 'https://1devteam.com',
  title: '1DevTeam · Software development and applied R&D',
  email: 'hello@1devteam.com',
  productEmail: 'ajenda-ai@1devteam.com',
  ogImage: '/og.png',
  brand: {
    companyOnLight: '/brand/1devteam-logo-dark.svg',
    companyOnDark: '/brand/1devteam-logo-light.svg',
    productOnLight: '/brand/ajenda-logo-dark.svg',
    productOnDark: '/brand/ajenda-logo-light.svg',
    productMark: '/brand/ajenda-mark.svg',
  },
  social: {
    github: 'https://github.com/1devteam',
    linkedin: 'https://www.linkedin.com/company/1devteam',
  },
} as const

export function inboxForInterest(interest: string) {
  return interest.startsWith('Ajenda') ? siteConfig.productEmail : siteConfig.email
}

export const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Method', href: '/method' },
  { label: 'About', href: '/about' },
] as const

export const footerLinks = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Research & Development', href: '/research' },
    { label: 'Contact', href: '/contact' },
  ],
  offerings: [
    { label: 'Services', href: '/services' },
    { label: 'Enterprise', href: '/enterprise' },
    { label: 'Products', href: '/products' },
    { label: 'Ajenda AI', href: '/products/ajenda' },
    { label: 'Method', href: '/method' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Trust & Security', href: '/trust' },
    { label: 'Brand', href: '/brand' },
  ],
} as const

export const proofPoints = [
  { title: 'Problem first', description: 'The problem determines the technology and form of the solution.' },
  { title: 'Whole-system reasoning', description: 'Architecture, dependencies, state, authority, failure paths, and downstream effects matter.' },
  { title: 'Evidence over assumption', description: 'Read, test, verify, and preserve uncertainty rather than manufacturing confidence.' },
  { title: 'Build, inspect, improve', description: 'Useful discoveries become better software, methods, and development tools.' },
] as const

export const buildAreas = [
  {
    title: 'Custom software & systems',
    description: 'Architecture, implementation, integration, remediation, and expansion where the surrounding system matters as much as the local feature.',
    href: '/services',
  },
  {
    title: 'Products',
    description: 'Reusable software developed when a problem and its solution justify becoming a product. Ajenda AI is the current flagship.',
    href: '/products',
  },
  {
    title: 'Applied R&D & development tooling',
    description: 'When development exposes a deeper recurring problem, we investigate it and build methods or tools that can be reused in real work.',
    href: '/research',
  },
] as const

export type WorkItem = {
  slug: string
  title: string
  type: string
  summary: string
  tags: readonly string[]
  status: string
  date?: string
  href?: string
}

export const workItems: readonly WorkItem[] = [
  {
    slug: 'ajenda-ai',
    title: 'Ajenda AI',
    type: 'Flagship product',
    summary: 'An actively developed execution system for turning goals into structured missions, plans, tasks, and controlled work. The product architecture emphasizes durable state, explicit authority, recovery, review, and traceable execution.',
    tags: ['Product', 'Software', 'Governed execution'],
    status: 'Private development — locally operational',
    date: '2026-07-31',
    href: '/products/ajenda',
  },
  {
    slug: 'snapshot',
    title: 'Snapshot',
    type: 'Development tool',
    summary: 'A project-context transfer system designed to move a language model from zero prior project knowledge toward comprehensive working context. Snapshot v10 remains usable in Ajenda development.',
    tags: ['Human + AI', 'Context transfer', 'Developer tooling'],
    status: 'Used in practice',
  },
  {
    slug: 'architectural-graph',
    title: 'Ajenda Architectural Graph',
    type: 'Development / CI system',
    summary: 'A persistent machine-readable architecture model used for dependencies, ownership, invariants, blast radius, proof selection, completeness auditing, and selective function-level diagnosis.',
    tags: ['Architecture', 'Graph', 'Proof'],
    status: 'Active development tooling',
  },
  {
    slug: 'omnipath-original-evolved',
    title: 'OmniPath Original — Evolved Lineage',
    type: 'Recovered research system',
    summary: 'A recovered OmniPath lineage preserved as inspectable research. It is not represented as production-ready.',
    tags: ['Recovery', 'Orchestration', 'Research'],
    status: 'Private recovery baseline',
  },
] as const

export const services = [
  {
    title: 'Custom software & systems development',
    description: 'Architecture, implementation, integration, and expansion of software built around explicit requirements and real operating constraints.',
    outcomes: ['System-aware implementation', 'Explicit ownership and boundaries', 'Verification against real behavior'],
  },
  {
    title: 'Product & SaaS development',
    description: 'From an initial problem and system design through working product surfaces, backend architecture, persistence, integrations, and operational foundations.',
    outcomes: ['Working product architecture', 'Inspectable technical decisions', 'A maintainable path forward'],
  },
  {
    title: 'Existing-system analysis & remediation',
    description: 'Work on systems where the visible defect may cross module, state, authority, data, or runtime boundaries and requires more than a local patch.',
    outcomes: ['Root-cause analysis', 'Architectural repair scope', 'Regression and downstream proof'],
  },
  {
    title: 'AI-enabled systems & governance',
    description: 'AI where it materially improves the system, with explicit boundaries, evaluation, human control, failure handling, and authority appropriate to the use case.',
    outcomes: ['Defined capability boundaries', 'Human control where required', 'Evidence-based evaluation'],
  },
] as const

export const methodSteps = [
  { step: '01', title: 'Understand the problem', description: 'Read the relevant system completely enough to identify what is actually failing, what owns the behavior, and what information is still missing.' },
  { step: '02', title: 'Map the system', description: 'Identify dependencies, contracts, state, authority, boundaries, failure paths, and downstream effects before deciding where the work belongs.' },
  { step: '03', title: 'Build systematically', description: 'Implement the complete solution at the correct ownership layer rather than accumulating local patches around the visible symptom.' },
  { step: '04', title: 'Prove and learn', description: 'Test affected behavior, verify surrounding invariants and downstream effects, document what changed, and use the result to improve the next development cycle.' },
] as const

export const insights = [
  { slug: 'from-goals-to-execution', title: 'From goals to execution: why chat is not a system', excerpt: 'Conversation can help reason about work. Durable execution requires state, ownership, authority, recovery, and proof.', date: '2026-06-12', category: 'Product', readTime: '6 min' },
  { slug: 'calibrating-ai-trust', title: 'Calibrating AI trust instead of claiming it', excerpt: 'Controls, evidence, failure boundaries, and uncertainty matter more than confidence language.', date: '2026-05-28', category: 'Governance', readTime: '8 min' },
  { slug: 'build-journals-over-case-study-theater', title: 'Technical evidence before polished stories', excerpt: 'Architecture notes, development artifacts, and milestone records can show what actually exists without pretending maturity that is not there.', date: '2026-05-04', category: 'Method', readTime: '5 min' },
] as const

export const projectInterests = [
  'Ajenda AI / product inquiry',
  'Custom software or system',
  'Product / SaaS development',
  'Existing-system analysis or remediation',
  'AI-enabled system / governance',
  'Research or development tooling',
  'Something else',
] as const
