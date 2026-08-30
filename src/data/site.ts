export const siteConfig = {
  name: '1DevTeam',
  legalName: '1devteam L.L.C.',
  tagline: 'We build software — and better ways to build software.',
  description:
    '1DevTeam is a software development and applied R&D company that works alongside AI to solve difficult software and systems problems, build dependable systems and products, and improve the methods and tools used to develop them.',
  url: 'https://1devteam.com',
  title: '1DevTeam · Software development and applied R&D',
  email: 'hello@1devteam.com',
  privacyEmail: 'hello@1devteam.com',
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
  { label: 'Wiki', href: '/wiki' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Method', href: '/method' },
  { label: 'About', href: '/about' },
] as const

export const footerLinks = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Technical Wiki', href: '/wiki' },
    { label: 'Research & Development', href: '/research' },
    { label: 'Contact', href: '/contact' },
  ],
  offerings: [
    { label: 'Services', href: '/services' },
    { label: 'Complex Systems', href: '/enterprise' },
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
  {
    title: 'Problem first',
    description: 'Implementation follows the structure of the actual problem rather than a predetermined technology category.',
  },
  {
    title: 'Whole-system reasoning',
    description: 'Architecture, dependencies, state, authority, data, runtime behavior, failure paths, and downstream effects are part of the change surface.',
  },
  {
    title: 'Evidence before assumption',
    description: 'Repository state, tests, runtime behavior, architecture, and explicit proof take precedence over plausible interpretation.',
  },
  {
    title: 'Completion includes verification',
    description: 'Implementation, testing, failure-path analysis, documentation, and review are parts of the same engineering task.',
  },
] as const

export const buildAreas = [
  {
    title: 'Software & systems',
    description:
      'Architecture, implementation, integration, and remediation for software where the surrounding system matters as much as the individual feature.',
    href: '/services',
    cta: 'Software development services',
  },
  {
    title: 'Products',
    description:
      'Software developed around problems with sufficient scope, repeatability, and technical value to justify becoming reusable systems.',
    href: '/products',
    cta: 'View software products',
  },
  {
    title: 'Applied R&D',
    description:
      'Structured investigation into recurring software-development problems, including the methods and tooling required to reason about increasingly complex systems.',
    href: '/research',
    cta: 'Read the R&D program',
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
    type: 'Product',
    summary:
      'Actively developed execution software for missions, planning, state, authority, review, recovery, and controlled actions.',
    tags: ['Product', 'Software', 'Governed execution'],
    status: 'Private development — locally operational',
    date: '2026-07-31',
    href: '/products/ajenda',
  },
  {
    slug: 'snapshot',
    title: 'Snapshot',
    type: 'Development tool',
    summary:
      'Project-context transfer tooling for packaging repository state and software context for AI-assisted development. Snapshot v10 remains usable in Ajenda development.',
    tags: ['AI-assisted development', 'Context transfer', 'Developer tooling'],
    status: 'Used in practice',
  },
  {
    slug: 'architectural-graph',
    title: 'Ajenda Architectural Graph',
    type: 'Development / CI system',
    summary:
      'Machine-readable architecture used for dependency reasoning, decision ownership, change impact, proof selection, completeness auditing, and selected function-level analysis.',
    tags: ['Architecture', 'Graph', 'Proof'],
    status: 'Active development tooling',
  },
  {
    slug: 'pride-protocol',
    title: 'PRIDE Protocol',
    type: 'Development methodology',
    summary:
      'Process discipline for maintaining sufficient context, correct implementation scope, testing, verification, documentation, and review during AI-assisted engineering.',
    tags: ['Method', 'AI-assisted development', 'Verification'],
    status: 'Used in practice',
  },
  {
    slug: 'omnipath-original-evolved',
    title: 'OmniPath Original — Evolved Lineage',
    type: 'Recovered research system',
    summary:
      'A recovered OmniPath lineage preserved as inspectable research. It is not represented as production-ready.',
    tags: ['Recovery', 'Orchestration', 'Research'],
    status: 'Private recovery baseline',
  },
] as const

export const services = [
  {
    title: 'Custom software & systems',
    description:
      'Architecture and implementation of software systems from initial requirements through working application behavior, including APIs, persistence, interfaces, integrations, automation, access boundaries, system state, and operational behavior where required.',
    outcomes: ['System-aware implementation', 'Explicit ownership and boundaries', 'Verification against real behavior'],
  },
  {
    title: 'Product & SaaS development',
    description:
      'Design and implementation of software products requiring coordinated frontend, backend, persistence, authentication, integrations, state management, and product-level architecture.',
    outcomes: ['Working product architecture', 'Inspectable technical decisions', 'A maintainable path forward'],
  },
  {
    title: 'Existing-system analysis & remediation',
    description:
      'Investigation and correction of defects whose actual cause crosses the apparent location of the failure, including dependency, state, contract, runtime, concurrency, data, authority, or invariant boundaries.',
    outcomes: ['Root-cause analysis', 'Architectural repair scope', 'Regression and downstream proof'],
  },
  {
    title: 'AI-enabled systems',
    description:
      'Integration of AI where model reasoning materially improves the software system or development process, with explicit treatment of context, tool authority, evaluation, human control, persistence, failure handling, and auditability.',
    outcomes: ['Defined capability boundaries', 'Human control where required', 'Evidence-based evaluation'],
  },
] as const

export const methodSteps = [
  {
    step: '01',
    title: 'Understand the system',
    description:
      'Establish the relevant code, contracts, runtime behavior, state, dependencies, and unresolved information before selecting a solution.',
  },
  {
    step: '02',
    title: 'Map the change',
    description:
      'Determine ownership, architectural blast radius, affected invariants, failure paths, downstream consequences, and required proof.',
  },
  {
    step: '03',
    title: 'Implement at the correct layer',
    description:
      'Modify the component that owns the behavior rather than accumulating compensating logic around the visible symptom.',
  },
  {
    step: '04',
    title: 'Verify the system',
    description:
      'Test the direct change, affected boundaries, regression surface, edge cases, relevant invariants, and downstream behavior.',
  },
] as const

export const insights = [
  {
    slug: 'from-goals-to-execution',
    title: 'From goals to execution',
    excerpt:
      'Why durable execution requires state, ownership, authority, recovery, and proof beyond a conversational interface.',
    date: '2026-06-12',
    category: 'Product',
    readTime: '6 min',
  },
  {
    slug: 'calibrating-ai-trust',
    title: 'Calibrating AI trust',
    excerpt:
      'Why controls, evidence, capability boundaries, and known failure modes provide a stronger basis for system trust than confidence language.',
    date: '2026-05-28',
    category: 'Governance',
    readTime: '8 min',
  },
  {
    slug: 'build-journals-over-case-study-theater',
    title: 'Architectural scope and corrective repair',
    excerpt:
      'How a software change can satisfy its immediate test while remaining incomplete at the level of system ownership, contracts, or downstream behavior.',
    date: '2026-05-04',
    category: 'Architecture',
    readTime: '5 min',
  },
] as const

export const projectInterests = [
  'Custom software or system',
  'Product / SaaS development',
  'Existing-system analysis or remediation',
  'AI-enabled system',
  'Applied R&D or development tooling',
  'Ajenda AI',
  'Other',
] as const
