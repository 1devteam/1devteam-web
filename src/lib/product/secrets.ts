import type { IngestedFile, SecretKind, SecretRecord } from "./types.ts";
import { fingerprint, uid } from "./hash.ts";

const PATTERNS: { kind: SecretKind; re: RegExp }[] = [
  { kind: "pem", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g },
  { kind: "bearer", re: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g },
  { kind: "api-key", re: /\bsk-[A-Za-z0-9]{8,}\b/g },
  {
    kind: "token",
    re: /(?:API[_-]?KEY|SECRET|TOKEN|PASSWORD|ACCESS_KEY)\s*[=:]\s*['"]?([^\s'"]{8,})['"]?/gi,
  },
  { kind: "password", re: /password\s*[=:]\s*['"]([^'"]{6,})['"]/gi },
];

export function redactValue(value: string): string {
  if (value.length <= 6) return "«redacted»";
  return `${value.slice(0, 2)}…${value.slice(-2)}`;
}

export function isolateValue(value: string): { fingerprint: string; redacted: string } {
  return {
    fingerprint: fingerprint(value),
    redacted: `«redacted:${fingerprint(value).slice(0, 8)}»`,
  };
}

export function scanContent(path: string, content: string): SecretRecord[] {
  const found: SecretRecord[] = [];
  for (const { kind, re } of PATTERNS) {
    const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
    let match: RegExpExecArray | null;
    const haystack = content;
    while ((match = global.exec(haystack))) {
      const raw = match[1] ?? match[0];
      if (!raw || raw.startsWith("«redacted")) continue;
      const line = haystack.slice(0, match.index).split("\n").length;
      const isolated = isolateValue(raw);
      found.push({
        id: uid("sec"),
        fingerprint: isolated.fingerprint,
        kind,
        path,
        line,
        redacted: isolated.redacted,
      });
    }
  }
  return found;
}

export function isolateFile(file: IngestedFile): { file: IngestedFile; secrets: SecretRecord[] } {
  const secrets = scanContent(file.path, file.content);
  if (!secrets.length) return { file, secrets };
  let content = file.content;
  for (const { re } of PATTERNS) {
    const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
    content = content.replace(global, (full, group?: string) => {
      const raw = typeof group === "string" ? group : full;
      if (typeof raw !== "string" || raw.startsWith("«redacted")) return full;
      const token = isolateValue(raw).redacted;
      return typeof group === "string" ? full.replace(group, token) : token;
    });
  }
  return {
    file: { ...file, content, size: content.length },
    secrets,
  };
}

export function isolateFiles(files: IngestedFile[]): { files: IngestedFile[]; secrets: SecretRecord[] } {
  const next: IngestedFile[] = [];
  const secrets: SecretRecord[] = [];
  for (const file of files) {
    const isolated = isolateFile(file);
    next.push(isolated.file);
    secrets.push(...isolated.secrets);
  }
  return { files: next, secrets };
}

export function assertNoPlaintext(secrets: SecretRecord[], ...blobs: string[]): boolean {
  for (const blob of blobs) {
    if (blob.includes("sk-") && !blob.includes("«redacted")) {
      const hits = secrets.filter((s) => s.kind === "api-key" || s.kind === "token");
      if (hits.some((s) => blob.includes(s.fingerprint) === false && /sk-[A-Za-z0-9]{8,}/.test(blob))) {
        return false;
      }
    }
  }
  return !blobs.some((blob) => /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(blob));
}

export function activityIsClean(detail: string): boolean {
  return !/(?:sk-[A-Za-z0-9]{8,}|BEGIN [A-Z ]*PRIVATE KEY|Bearer\s+[A-Za-z0-9\-._]{12,})/.test(detail);
}
