type AjendaCommandCenterProps = {
  caption?: string
}

export function AjendaCommandCenter({
  caption = 'Ajenda AI · authentic product screenshot captured from the live Ajenda site and mechanically resized for web delivery.',
}: AjendaCommandCenterProps) {
  return (
    <figure className="m-0 min-w-0">
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[#070b12] shadow-[0_24px_60px_-28px_rgba(8,20,38,0.35)]">
        <img
          src="/artifacts/ajenda-ai-actual-screenshot.webp"
          alt="Ajenda AI website showing the governed-work hero and live command-center product surface"
          width={720}
          height={372}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{caption}</figcaption>
    </figure>
  )
}
