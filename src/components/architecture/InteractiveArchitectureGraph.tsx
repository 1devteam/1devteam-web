import { useMemo, useState } from 'react'
import { graphEdges, graphMeta, graphNodes, overviewNodeIds, type GraphEdge, type GraphNode } from '@/data/architectureGraph'

const overviewPositions: Record<string, { x: number; y: number }> = {
  'fn:backend.services.mission_composition.intent_interpreter:interpret_instruction': { x: 500, y: 94 },
  'fn:backend.services.mission_composition.interpretation.normalize:normalize_instruction_text': { x: 125, y: 278 },
  'fn:backend.services.mission_composition.intent_interpreter:_segment_clauses': { x: 375, y: 278 },
  'fn:backend.services.mission_composition.intent_interpreter:_classify_clause': { x: 625, y: 278 },
  'fn:backend.services.mission_composition.interpretation.fuzzy:fuzzy_outcome_candidates': { x: 875, y: 278 },
  'fn:backend.services.mission_composition.ability_vocab:phrase_maps_to_outcome': { x: 375, y: 478 },
  'fn:backend.services.mission_composition.ability_vocab:match_outcome_phrases': { x: 625, y: 478 },
}

const overviewIdSet = new Set<string>(overviewNodeIds)
const nodeById = new Map(graphNodes.map((node) => [node.id, node]))
const overviewEdges = graphEdges.filter(
  (edge) => edge.type === 'calls_function' && overviewIdSet.has(edge.from) && overviewIdSet.has(edge.to),
)

const edgeLabels: Record<GraphEdge['type'], string> = {
  calls_function: 'calls function',
  tests_function: 'tests function',
  defined_in: 'defined in',
}

const edgeStyles: Record<GraphEdge['type'], { stroke: string; dash?: string }> = {
  calls_function: { stroke: '#4f6f93' },
  tests_function: { stroke: '#2f7d55', dash: '6 5' },
  defined_in: { stroke: '#7a5aa6', dash: '3 5' },
}

const typeLabels: Record<string, string> = {
  python_function: 'Python function',
  python_module: 'Python module',
  test_module: 'Test module',
}

const NODE_WIDTH = 210
const NODE_HEIGHT = 58
const FOCUS_COLUMNS = [125, 375, 625, 875]

function shortLabel(value: string, max = 28) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`
}

function edgeKey(edge: GraphEdge) {
  return `${edge.from}|${edge.type}|${edge.to}`
}

function layoutRow(ids: string[], startY: number) {
  const positions = new Map<string, { x: number; y: number }>()
  ids.forEach((id, index) => {
    const row = Math.floor(index / FOCUS_COLUMNS.length)
    const column = index % FOCUS_COLUMNS.length
    positions.set(id, { x: FOCUS_COLUMNS[column], y: startY + row * 92 })
  })
  return positions
}

function buildFocusLayout(rootId: string, edges: GraphEdge[]) {
  const incoming = Array.from(new Set(edges.filter((edge) => edge.to === rootId).map((edge) => edge.from)))
  const outgoing = Array.from(new Set(edges.filter((edge) => edge.from === rootId).map((edge) => edge.to)))

  const incomingRows = Math.ceil(incoming.length / FOCUS_COLUMNS.length)
  const incomingY = 74
  const rootY = incoming.length ? incomingY + incomingRows * 92 + 54 : 118
  const outgoingY = rootY + 154
  const outgoingRows = Math.ceil(outgoing.length / FOCUS_COLUMNS.length)
  const height = Math.max(500, outgoingY + Math.max(1, outgoingRows) * 92 + 70)

  const positions = new Map<string, { x: number; y: number }>()
  layoutRow(incoming, incomingY).forEach((position, id) => positions.set(id, position))
  positions.set(rootId, { x: 500, y: rootY })
  layoutRow(outgoing, outgoingY).forEach((position, id) => positions.set(id, position))

  return { positions, height, incomingCount: incoming.length, outgoingCount: outgoing.length }
}

function GraphNodeShape({
  node,
  position,
  active,
  root,
  dimmed,
  onInspect,
}: {
  node: GraphNode
  position: { x: number; y: number }
  active: boolean
  root: boolean
  dimmed: boolean
  onInspect: (id: string) => void
}) {
  const fill = node.type === 'test_module' ? '#f4fbf6' : node.type === 'python_module' ? '#faf7ff' : '#ffffff'
  const stroke = root || active ? '#0047b3' : node.type === 'test_module' ? '#6c9a7f' : node.type === 'python_module' ? '#8f79ad' : '#8aa0b8'

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Inspect ${node.name}`}
      onClick={() => onInspect(node.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onInspect(node.id)
        }
      }}
      className="cursor-pointer outline-none transition-opacity focus-visible:[&>rect]:stroke-[3]"
      opacity={dimmed ? 0.24 : 1}
    >
      <rect
        x={position.x - NODE_WIDTH / 2}
        y={position.y - NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx="10"
        fill={fill}
        stroke={stroke}
        strokeWidth={root || active ? 2.25 : 1.4}
      />
      <text
        x={position.x}
        y={position.y - 4}
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
        fontSize="12"
        fontWeight="700"
        fill="#0a1120"
      >
        {shortLabel(node.name)}
      </text>
      <text
        x={position.x}
        y={position.y + 16}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="10.5"
        fill="#4a5667"
      >
        {shortLabel(node.decisionRole ?? typeLabels[node.type] ?? node.type, 31)}
      </text>
    </g>
  )
}

function GraphEdgeShape({
  edge,
  positions,
  dimmed,
}: {
  edge: GraphEdge
  positions: Map<string, { x: number; y: number }>
  dimmed: boolean
}) {
  const from = positions.get(edge.from)
  const to = positions.get(edge.to)
  if (!from || !to) return null

  const downward = to.y >= from.y
  const x1 = from.x
  const y1 = from.y + (downward ? NODE_HEIGHT / 2 : -NODE_HEIGHT / 2)
  const x2 = to.x
  const y2 = to.y + (downward ? -NODE_HEIGHT / 2 : NODE_HEIGHT / 2)
  const style = edgeStyles[edge.type]

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={style.stroke}
      strokeWidth="1.7"
      strokeDasharray={style.dash}
      markerEnd={`url(#arrow-${edge.type})`}
      opacity={dimmed ? 0.1 : 0.82}
    />
  )
}

export function InteractiveArchitectureGraph({ compact = false }: { compact?: boolean }) {
  const [rootId, setRootId] = useState<string | null>(null)
  const [inspectedId, setInspectedId] = useState<string>(overviewNodeIds[0])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<GraphEdge['type'], boolean>>({
    calls_function: true,
    tests_function: false,
    defined_in: false,
  })

  const activeEdges = useMemo(() => {
    if (!rootId) return overviewEdges
    return graphEdges.filter(
      (edge) => (edge.from === rootId || edge.to === rootId) && filters[edge.type],
    )
  }, [rootId, filters])

  const layout = useMemo(() => {
    if (!rootId) {
      return {
        positions: new Map(Object.entries(overviewPositions)),
        height: 610,
        incomingCount: 0,
        outgoingCount: 0,
      }
    }
    return buildFocusLayout(rootId, activeEdges)
  }, [rootId, activeEdges])

  const visibleIds = useMemo(() => {
    if (!rootId) return new Set<string>(overviewNodeIds)
    return new Set<string>([rootId, ...activeEdges.flatMap((edge) => [edge.from, edge.to])])
  }, [rootId, activeEdges])

  const inspectedNode = nodeById.get(inspectedId) ?? nodeById.get(rootId ?? overviewNodeIds[0])!
  const inspectedEdges = graphEdges.filter((edge) => edge.from === inspectedNode.id || edge.to === inspectedNode.id)
  const inspectedIsComplete = overviewIdSet.has(inspectedNode.id)

  const hoveredConnected = useMemo(() => {
    if (!hoveredId) return null
    const connected = new Set<string>([hoveredId])
    activeEdges.forEach((edge) => {
      if (edge.from === hoveredId) connected.add(edge.to)
      if (edge.to === hoveredId) connected.add(edge.from)
    })
    return connected
  }, [hoveredId, activeEdges])

  function inspectNode(id: string) {
    setInspectedId(id)
    if (!rootId && overviewIdSet.has(id)) setRootId(id)
  }

  function focusNode(id: string) {
    if (!overviewIdSet.has(id)) return
    setRootId(id)
    setInspectedId(id)
    setHoveredId(null)
  }

  function returnToOverview() {
    setRootId(null)
    setInspectedId(overviewNodeIds[0])
    setHoveredId(null)
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm">
      <div className="border-b border-[var(--border)] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Ajenda · mission-composition architecture inspection</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-subtle)]">
              Canonical graph schema {graphMeta.schemaVersion} · {graphMeta.nodeCount.toLocaleString()} nodes · {graphMeta.edgeCount.toLocaleString()} edges
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Inspect function
              <select
                value={rootId ?? ''}
                onChange={(event) => event.target.value ? focusNode(event.target.value) : returnToOverview()}
                className="mt-1 block h-10 min-w-64 rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-3 text-sm font-medium text-[var(--text)]"
              >
                <option value="">Overview</option>
                {overviewNodeIds.map((id) => {
                  const node = nodeById.get(id)!
                  return <option key={id} value={id}>{node.name}</option>
                })}
              </select>
            </label>
            {rootId && (
              <button
                type="button"
                onClick={returnToOverview}
                className="h-10 rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
              >
                Return to overview
              </button>
            )}
          </div>
        </div>

        {rootId && (
          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Relationship filters">
            {(Object.keys(filters) as GraphEdge['type'][]).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={filters[type]}
                onClick={() => setFilters((current) => ({ ...current, [type]: !current[type] }))}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filters[type]
                    ? 'border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_9%,white)] text-[var(--brand)]'
                    : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-[var(--surface)]'
                }`}
              >
                {edgeLabels[type]}
              </button>
            ))}
            <span className="ml-1 text-xs text-[var(--text-subtle)]">
              {activeEdges.length} visible relationship{activeEdges.length === 1 ? '' : 's'}
            </span>
          </div>
        )}
      </div>

      <div className={compact ? 'max-h-[620px] overflow-auto' : 'max-h-[760px] overflow-auto'}>
        <svg
          viewBox={`0 0 1000 ${layout.height}`}
          className="block min-w-[760px] w-full"
          role="img"
          aria-label={rootId ? `Direct canonical relationships for ${nodeById.get(rootId)?.name}` : 'Selected mission-composition functions from the Ajenda canonical architecture graph'}
          onMouseLeave={() => setHoveredId(null)}
        >
          <defs>
            {(Object.keys(edgeStyles) as GraphEdge['type'][]).map((type) => (
              <marker key={type} id={`arrow-${type}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill={edgeStyles[type].stroke} />
              </marker>
            ))}
          </defs>
          <rect x="0" y="0" width="1000" height={layout.height} fill="#fbfcfe" />

          <g>
            {activeEdges.map((edge) => {
              const dimmed = Boolean(
                hoveredId && edge.from !== hoveredId && edge.to !== hoveredId,
              )
              return <GraphEdgeShape key={edgeKey(edge)} edge={edge} positions={layout.positions} dimmed={dimmed} />
            })}
          </g>

          <g>
            {Array.from(visibleIds).map((id) => {
              const node = nodeById.get(id)
              const position = layout.positions.get(id)
              if (!node || !position) return null
              const dimmed = Boolean(hoveredConnected && !hoveredConnected.has(id))
              return (
                <g key={id} onMouseEnter={() => setHoveredId(id)}>
                  <GraphNodeShape
                    node={node}
                    position={position}
                    active={inspectedNode.id === id}
                    root={rootId === id}
                    dimmed={dimmed}
                    onInspect={inspectNode}
                  />
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="grid border-t border-[var(--border)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-[var(--border)] p-5 lg:border-b-0 lg:border-r lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Selected node</p>
              <h3 className="mt-1 break-all font-mono text-base font-semibold text-[var(--text)]">{inspectedNode.name}</h3>
            </div>
            {inspectedNode.id !== rootId && overviewIdSet.has(inspectedNode.id) && (
              <button
                type="button"
                onClick={() => focusNode(inspectedNode.id)}
                className="rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]"
              >
                Focus this function
              </button>
            )}
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div><dt className="font-semibold text-[var(--text)]">Type</dt><dd className="mt-1 text-[var(--text-muted)]">{typeLabels[inspectedNode.type] ?? inspectedNode.type}</dd></div>
            {inspectedNode.decisionRole && <div><dt className="font-semibold text-[var(--text)]">Decision role</dt><dd className="mt-1 font-mono text-[13px] text-[var(--text-muted)]">{inspectedNode.decisionRole}</dd></div>}
            {inspectedNode.module && <div><dt className="font-semibold text-[var(--text)]">Module</dt><dd className="mt-1 break-all font-mono text-[13px] text-[var(--text-muted)]">{inspectedNode.module}</dd></div>}
            {inspectedNode.source && <div><dt className="font-semibold text-[var(--text)]">Source</dt><dd className="mt-1 break-all font-mono text-[13px] text-[var(--text-muted)]">{inspectedNode.source}</dd></div>}
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
            {inspectedIsComplete
              ? 'All direct relationships for this selected function in canonical graph schema 1.2 are included in this inspection slice.'
              : 'This node is shown as a direct neighbor of one of the selected decision functions; the embedded slice does not claim to include every relationship for this neighbor.'}
          </p>
        </div>

        <div className="p-5 lg:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Canonical relationships in loaded slice</p>
          {inspectedEdges.length ? (
            <ul className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
              {inspectedEdges.map((edge) => {
                const outgoing = edge.from === inspectedNode.id
                const otherId = outgoing ? edge.to : edge.from
                const other = nodeById.get(otherId)
                return (
                  <li key={edgeKey(edge)} className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs leading-relaxed">
                    <span className="font-mono font-semibold text-[var(--brand)]">{outgoing ? '→' : '←'} {edge.type}</span>{' '}
                    <button type="button" onClick={() => setInspectedId(otherId)} className="font-mono text-[var(--text)] underline-offset-2 hover:underline">
                      {other?.name ?? otherId}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">No relationships for this node are included in the embedded canonical slice.</p>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs leading-relaxed text-[var(--text-subtle)] md:px-6">
        Source: canonical-dependency-graph CI artifact. Nodes, edge direction, edge type, decision roles, modules, and source paths are derived from the recorded graph artifact; interaction changes presentation only.
      </div>
    </div>
  )
}
