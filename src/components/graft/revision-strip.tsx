import type { SubjectProfile } from "@/lib/graft/types";

export function formatRevision(profile: SubjectProfile) {
  const repo = profile.provenance.repo;
  const ref = profile.provenance.ref ?? "HEAD";
  const sha = profile.provenance.sha;
  return {
    repo,
    ref,
    sha,
    short: sha ? sha.slice(0, 12) : "unpinned",
    capturedAt: profile.provenance.capturedAt,
    readOnly: profile.provenance.readOnly === true,
    kind: profile.provenance.kind,
  };
}

export function RevisionStrip({ profile }: { profile: SubjectProfile }) {
  const rev = formatRevision(profile);
  return (
    <p className="font-mono text-xs text-subtle">
      {rev.repo}@{rev.ref}
      <span className="text-fg"> {rev.short}</span>
      {" · "}
      {rev.kind}
      {" · "}
      read-only
      {" · "}
      captured {rev.capturedAt}
    </p>
  );
}
