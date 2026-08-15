export const siteConfig = {
  name: '1devteam',
  legalName: '1devteam',
  tagline: 'We build AI systems that move businesses from goals to execution.',
  description:
    '1devteam is an AI product studio and systems builder. We design and ship governed AI systems, SaaS tools, and operational software — with Ajenda AI as our flagship product.',
  url: 'https://1devteam.com',
  title: '1devteam · Governed AI systems',
  email: 'hello@1devteam.com',
  ogImage: '/og.png',
  social: {
    github: 'https://github.com/1devteam',
    linkedin: 'https://www.linkedin.com/company/1devteam',
  },
} as const

export const navLinks = [
  { label: 'Work', href: '/work' },
  { label: 'Services', href: '/services' },
  { label: 'Products', href: '/products' },
  { label: 'Method', href: '/method' },
  { label: 'Insights', href: '/insights' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const

export const footerLinks = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Insights', href: '/insights' },
    { label: 'Contact', href: '/contact' },
  ],
  offerings: [
    { label: 'Services', href: '/services' },
    { label: 'Products', href: '/products' },
    { label: 'Ajenda AI', href: '/products/ajenda' },
    { label: 'Method', href: '/method' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Trust & Security', href: '/trust' },
  ],
} as const

export const proofPoints = [
  {
    title: 'Governed AI execution',
    description: 'Human oversight, audit trails, and control planes — not unbounded agents.',
  },
  {
    title: 'Production-minded engineering',
    description: 'Real integrations, deployable systems, and measurable outcomes.',
  },
  {
    title: 'Flagship product: Ajenda AI',
    description: 'From goals to execution — structured work, not another chat surface.',
  },
  {
    title: 'Fast delivery stack',
    description: 'Modern cloud, tight loops, and systems you can inspect and evolve.',
  },
] as const

export const buildAreas = [
  {
    title: 'AI systems',
    description:
      'Agent workflows, retrieval, evaluation, and control layers designed for real operations — not demos.',
    href: '/services',
  },
  {
    title: 'SaaS products',
    description:
      'Productized tools with clear UX, durable architecture, and a path from MVP to multi-tenant scale.',
    href: '/products',
  },
  {
    title: 'Operations infrastructure',
    description:
      'Internal tools, automation, and business systems that connect strategy to day-to-day execution.',
    href: '/services',
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
    summary:
      'A governed execution system that turns goals into structured plans, tasks, and accountable progress — not open-ended chat. The command center below is from the local build, not a concept mock.',
    tags: ['Product', 'AI systems', 'Governance'],
    status: 'Private development — locally operational',
    date: '2026-07-31',
    href: '/products/ajenda',
  },
  {
    slug: 'omnipath-original-evolved',
    title: 'OmniPath Original — Evolved Lineage',
    type: 'Recovered research system',
    summary:
      'A recovered OmniPath lineage containing Trace Nine, a fork fleet, doctrine and memory cores, APIs, and multiple interfaces. Preserved as inspectable research; it is not represented as production-ready.',
    tags: ['Recovery', 'Orchestration', 'Research'],
    status: 'Private recovery baseline',
  },
  {
    slug: 'omnipath-v2',
    title: 'OmniPath v2',
    type: 'Public governance layer',
    summary:
      'An inspectable governance-oriented OmniPath generation. Public source does not imply hosted-service availability or production support.',
    tags: ['Governance', 'AI systems'],
    status: 'Public repository',
  },
  {
    slug: 'sweepstacx',
    title: 'SweepstacX',
    type: 'Public software project',
    summary:
      'An earlier software system retained publicly for inspection. Its current repository state should be evaluated before operational use.',
    tags: ['Software', 'Archive', 'Engineering'],
    status: 'Public — maturity under review',
  },
] as const

export const services = [
  {
    title: 'AI systems design & build',
    description:
      'End-to-end design of governed AI systems: problem framing, architecture, implementation, evaluation, and rollout.',
    outcomes: [
      'Clear system boundaries and ownership',
      'Human oversight where risk demands it',
      'Production-ready integrations',
    ],
  },
  {
    title: 'SaaS product development',
    description:
      'From concept to shippable product: UX, backend, billing-ready foundations, and iteration loops grounded in user evidence.',
    outcomes: [
      'MVP with a real path to scale',
      'Inspectable technical decisions',
      'Product surface your team can own',
    ],
  },
  {
    title: 'Operations & automation systems',
    description:
      'Business process systems that reduce manual drag without hiding risk — dashboards, workflows, and internal tools that fit how teams actually work.',
    outcomes: [
      'Fewer handoff failures',
      'Visible process health',
      'Automation with accountability',
    ],
  },
  {
    title: 'AI governance & readiness',
    description:
      'Controls, policies, evaluation, and operating models so AI can be used seriously — not as a black box experiment.',
    outcomes: [
      'Trust and risk calibration',
      'Documented control plane',
      'Team readiness for production AI',
    ],
  },
] as const

export const methodSteps = [
  {
    step: '01',
    title: 'Frame the outcome',
    description:
      'We start with business goals, constraints, and decision rights — not model shopping. Success is defined before architecture is chosen.',
  },
  {
    step: '02',
    title: 'Design the system',
    description:
      'Data, workflows, interfaces, and control surfaces. We map where AI helps, where humans stay in the loop, and what must be auditable.',
  },
  {
    step: '03',
    title: 'Build with evidence',
    description:
      'Short delivery loops with inspectable progress: prototypes, evaluation sets, integration checkpoints, and production readiness criteria.',
  },
  {
    step: '04',
    title: 'Govern and operate',
    description:
      'Ship with monitoring, review paths, failure handling, and ownership. Systems that work on day one and remain trustworthy on day one hundred.',
  },
] as const

export const insights = [
  {
    slug: 'from-goals-to-execution',
    title: 'From goals to execution: why chat is not a system',
    excerpt:
      'Most AI tools stop at conversation. Real business value starts when plans, ownership, and feedback loops become durable.',
    date: '2026-06-12',
    category: 'Product',
    readTime: '6 min',
  },
  {
    slug: 'calibrating-ai-trust',
    title: 'Calibrating AI trust instead of claiming it',
    excerpt:
      'Buyers do not need more “trust us” language. They need controls, evidence, and the ability to see where the system can fail.',
    date: '2026-05-28',
    category: 'Governance',
    readTime: '8 min',
  },
  {
    slug: 'build-journals-over-case-study-theater',
    title: 'Build journals beat case-study theater',
    excerpt:
      'When polished customer stories are not ready, architecture notes and milestone updates still create inspectable proof.',
    date: '2026-05-04',
    category: 'Method',
    readTime: '5 min',
  },
] as const

export const projectInterests = [
  'Ajenda AI / product inquiry',
  'Custom AI system',
  'SaaS product build',
  'Operations automation',
  'Governance / readiness',
  'Something else',
] as const
