export function fingerprint(value: unknown): string {
  const encoded = typeof value === "string" ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < encoded.length; i += 1) {
    hash ^= encoded.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function isoNow(): string {
  return new Date().toISOString();
}

export function uid(prefix: string): string {
  return `${prefix}-${fingerprint(`${prefix}:${Date.now()}:${Math.random()}`).slice(0, 8)}`;
}

export function slug(value: string): string {
  const next = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return next || "project";
}
