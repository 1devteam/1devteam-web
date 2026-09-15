import type { ReactNode } from "react";
import type { Disposition } from "@/lib/graft/types";
import type { TaskState } from "@/lib/product/types";
import { cn } from "@/lib/utils";

export function dispositionClass(d: Disposition) {
  if (d === "clear") return "text-ok border-ok/30 bg-ok/10";
  if (d === "blocked") return "text-bad border-bad/30 bg-bad/10";
  return "text-warn border-warn/30 bg-warn/10";
}

export function stateClass(state: TaskState) {
  if (state === "done") return "text-ok border-ok/30 bg-ok/10";
  if (state === "failed" || state === "blocked") return "text-bad border-bad/30 bg-bad/10";
  if (state === "running" || state === "retrying") return "text-accent border-accent/30 bg-elevated";
  if (state === "escalated") return "text-warn border-warn/30 bg-warn/10";
  return "text-muted border-border bg-surface";
}

export function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex min-h-8 items-center rounded-full border px-3 font-mono text-xs", className)}>
      {children}
    </span>
  );
}

export function Panel({
  title,
  kicker,
  children,
  className,
}: {
  title?: string;
  kicker?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-surface p-4", className)}>
      {kicker ? <p className="font-mono text-xs tracking-widest text-subtle">{kicker}</p> : null}
      {title ? <h3 className="mt-1 text-base font-medium tracking-tight">{title}</h3> : null}
      <div className={title || kicker ? "mt-3" : undefined}>{children}</div>
    </section>
  );
}
