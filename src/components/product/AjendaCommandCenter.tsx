const nav = [
  { label: 'Command Center', active: true },
  { label: 'Missions', active: false },
  { label: 'Approvals', active: false },
  { label: 'Active work', active: false },
  { label: 'Outcomes', active: false },
]

const missions = [
  { title: 'Ship Q3 ops automation', owner: 'Ops', status: 'In review', tone: 'review' },
  { title: 'Qualify inbound leads', owner: 'Growth', status: 'Running', tone: 'running' },
  { title: 'Weekly pipeline brief', owner: 'Sales', status: 'Queued', tone: 'queued' },
]

const toneClass: Record<string, string> = {
  review: 'bg-[color-mix(in_srgb,var(--warning)_14%,white)] text-[var(--warning)]',
  running: 'bg-[color-mix(in_srgb,var(--success)_12%,white)] text-[var(--success)]',
  queued: 'bg-[var(--surface)] text-[var(--text-muted)]',
}

type AjendaCommandCenterProps = {
  caption?: string
}

export function AjendaCommandCenter({
  caption = 'Ajenda command center — local build, 31 July 2026',
}: AjendaCommandCenterProps) {
  return (
    <figure className="m-0">
      <div
        className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-[0_24px_60px_-28px_rgba(8,20,38,0.35)]"
        aria-label="Ajenda AI command center"
      >
        <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden />
          <span className="ml-2 truncate font-mono text-[11px] text-[var(--text-muted)]">
            ajenda.local / dashboard
          </span>
        </div>

        <div className="grid min-h-[280px] grid-cols-[118px_1fr] sm:grid-cols-[148px_1fr]">
          <aside className="border-r border-[var(--border)] bg-[var(--navy-950)] px-2.5 py-3 text-white">
            <p className="px-1.5 text-[11px] font-semibold tracking-wide">ajenda</p>
            <nav className="mt-3 space-y-0.5" aria-hidden>
              {nav.map((item) => (
                <div
                  key={item.label}
                  className={
                    item.active
                      ? 'rounded-md bg-[var(--brand)] px-2 py-1.5 text-[11px] font-medium'
                      : 'rounded-md px-2 py-1.5 text-[11px] text-white/70'
                  }
                >
                  {item.label}
                </div>
              ))}
            </nav>
          </aside>

          <div className="bg-white p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Command center
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--text)]">
                  Active work under review
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-2.5 py-1 text-[11px] font-medium text-[var(--success)]">
                Governed
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: 'Missions', value: '6' },
                { label: 'Awaiting review', value: '1' },
                { label: 'Done today', value: '4' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 py-2"
                >
                  <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                  <p className="mt-0.5 text-lg font-semibold leading-none">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {missions.map((mission) => (
                <div
                  key={mission.title}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{mission.title}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">{mission.owner}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${toneClass[mission.tone]}`}
                  >
                    {mission.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-[var(--text-muted)]">{caption}</figcaption>
    </figure>
  )
}
