import type { GraftEdge, GraftNode, Layer } from "@/lib/graft/types";

const COL_ORDER = ["surface", "authority", "runtime", "economy", "data", "egress", "proof"];

const LAYER_STROKE: Record<Layer, string> = {
  generated: "var(--color-accent)",
  overlay: "var(--color-warn)",
  runtime: "var(--color-ok)",
  proof: "var(--color-muted)",
};

type Props = {
  nodes: GraftNode[];
  edges: GraftEdge[];
  highlight: Set<string>;
  selected: string | null;
  onSelect: (id: string) => void;
};

function dash(layer: Layer) {
  if (layer === "generated") return undefined;
  if (layer === "proof") return "1 3";
  return "4 3";
}

function jitter(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 7) - 3;
}

export function GraphMap({ nodes, edges, highlight, selected, onSelect }: Props) {
  const columns = COL_ORDER.filter((col) => nodes.some((n) => n.domain === col));
  const extra = [...new Set(nodes.map((n) => n.domain).filter((d) => !COL_ORDER.includes(d)))];
  const allCols = [...columns, ...extra];
  const colWidth = 176;
  const rowHeight = 56;
  const nodeW = 148;
  const nodeH = 36;
  const padX = 24;
  const padY = 40;

  const positions = new Map<string, { x: number; y: number }>();
  allCols.forEach((col, ci) => {
    const colNodes = nodes.filter((n) => n.domain === col);
    colNodes.forEach((node, ri) => {
      positions.set(node.id, {
        x: padX + ci * colWidth,
        y: padY + ri * rowHeight,
      });
    });
  });

  const width = padX * 2 + Math.max(allCols.length, 1) * colWidth - 28;
  const height =
    padY * 2 +
    Math.max(1, ...allCols.map((col) => nodes.filter((n) => n.domain === col).length)) * rowHeight;

  return (
    <div
      className="max-w-full overflow-x-auto rounded-lg border border-border bg-surface"
      tabIndex={0}
      role="region"
      aria-label="Scrollable architectural graph"
    >
      <svg
        role="img"
        aria-label="Architectural graph, consumer to dependency"
        viewBox={`0 0 ${width} ${height}`}
        className="min-h-80 w-full min-w-[52rem]"
      >
        {allCols.map((col, ci) => (
          <text
            key={col}
            x={padX + ci * colWidth + 8}
            y={22}
            fill="var(--color-subtle)"
            style={{ fontSize: 10, letterSpacing: "0.16em", fontFamily: "ui-sans-serif, Inter, system-ui" }}
          >
            {col.toUpperCase()}
          </text>
        ))}
        {edges.map((edge) => {
          const a = positions.get(edge.from);
          const b = positions.get(edge.to);
          if (!a || !b) return null;
          const active = highlight.has(edge.from) || highlight.has(edge.to);
          const x1 = a.x + nodeW / 2;
          const y1 = a.y + nodeH / 2;
          const x2 = b.x + nodeW / 2;
          const y2 = b.y + nodeH / 2;
          const mx = (x1 + x2) / 2 + jitter(`${edge.from}-${edge.to}-${edge.kind}`) * 10;
          const my = (y1 + y2) / 2 + jitter(edge.kind) * 6;
          const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
          return (
            <path
              key={`${edge.from}-${edge.to}-${edge.kind}`}
              d={d}
              fill="none"
              stroke={active ? LAYER_STROKE[edge.layer] : "var(--color-border)"}
              strokeWidth={active ? 1.6 : 1}
              strokeDasharray={dash(edge.layer)}
              opacity={active ? 0.95 : 0.45}
            />
          );
        })}
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const on = highlight.has(node.id);
          const isSel = selected === node.id;
          const label = node.label.length > 18 ? `${node.label.slice(0, 16)}…` : node.label;
          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className="cursor-pointer"
              onClick={() => onSelect(node.id)}
            >
              <rect
                width={nodeW}
                height={nodeH}
                rx="8"
                fill={isSel ? "var(--color-accent)" : on ? "var(--color-elevated)" : "var(--color-bg)"}
                stroke={isSel || on ? "var(--color-accent)" : "var(--color-border)"}
              />
              <rect
                x="0"
                y="0"
                width="4"
                height={nodeH}
                rx="2"
                fill={LAYER_STROKE[node.layer]}
              />
              <text
                x="12"
                y="14"
                fill={isSel ? "var(--color-accent-fg)" : "var(--color-subtle)"}
                style={{ fontSize: 8, letterSpacing: "0.08em", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
              >
                {node.kind.replaceAll("_", " ")}
              </text>
              <text
                x="12"
                y="27"
                fill={isSel ? "var(--color-accent-fg)" : "var(--color-fg)"}
                style={{ fontSize: 11, fontFamily: "ui-sans-serif, Inter, system-ui" }}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2">
        <p className="font-mono text-xs text-subtle">
          Consumer to dependency. Highlight is the current blast radius.
        </p>
        <ul className="flex flex-wrap gap-3 font-mono text-[10px] tracking-widest text-subtle">
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-accent" />
            GENERATED
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-warn" />
            OVERLAY
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-ok" />
            RUNTIME
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-muted" />
            PROOF
          </li>
        </ul>
      </div>
    </div>
  );
}
