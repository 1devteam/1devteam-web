import { useMemo, useState } from 'react'
import { graphEdges, graphMeta, graphNodes, overviewNodeIds, type GraphEdge, type GraphNode } from '@/data/architectureGraph'

const overviewPositions: Record<string, { x: number; y: number }> = {
  'fn:backend.services.mission_composition.intent_interpreter:interpret_instruction': { x: 540, y: 104 },
  'fn:backend.services.mission_composition.interpretation.normalize:normalize_instruction_text': { x: 140, y: 300 },
  'fn:backend.services.mission_composition.intent_interpreter:_segment_clauses': { x: 405, y: 300 },
  'fn:backend.services.mission_composition.intent_interpreter:_classify_clause': { x: 675, y: 300 },
  'fn:backend.services.mission_composition.interpretation.fuzzy:fuzzy_outcome_candidates': { x: 940, y: 300 },
  'fn:backend.services.mission_composition.ability_vocab:phrase_maps_to_outcome': { x: 405, y: 508 },
  'fn:backend.services.mission_composition.ability_vocab:match_outcome_phrases': { x: 675, y: 508 },
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
  calls_function: { stroke: '#416b9a' },
  tests_function: { stroke: '#2f7d55', dash: '7 5' },
  defined_in: { stroke: '#75549b', dash: '3 5' },
}

const typeLabels: Record<string, string> = {
  python_function: 'Python function',
  python_module: 'Python module',
  test_module: 'Test module',
}

const typeStyles: Record<string, { fill: string; stroke: string; dot: string }> = {
  python_function: { fill: '#ffffff', stroke: '#7f9bb9', dot: '#2563a8' },
  python_module: { fill: '#faf7ff', stroke: '#8f79ad', dot: '#7656a5' },
  test_module: { fill: '#f4fbf6', stroke: '#6c9a7f', dot: '#2f7d55' },
}

type DirectionFilter = 'both' | 'incoming' | 'outgoing'

const NODE_WIDTH = 224
const NODE_HEIGHT = 64
const CANVAS_WIDTH = 1080
const FOCUS_COLUMNS = [145, 405, 675, 935]

function shortLabel(value: string, max = 30) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`
}

function edgeKey(edge: GraphEdge) {
  return `${edge.from}|${edge.type}|${edge.to}`
}

function sortNodeIds(ids: string[]) {
  const typeOrder: Record<string, number> = { python_function: 0, python_module: 1, test_module: 2 }
  return ids.sort((left, right) => {
    const a = nodeById.get(left)
    const b = nodeById.get(right)
    const byType = (typeOrder[a?.type ?? ''] ?? 9) - (typeOrder[b?.type ?? ''] ?? 9)
    if (byType) return byType
    return (a?.name ?? left).localeCompare(b?.name ?? right)
  })
}

function layoutRow(ids: string[], startY: number) {
  const positions = new Map<string, { x: number; y: number }>()
  ids.forEach((id, index) => {
    const row = Math.floor(index / FOCUS_COLUMNS.length)
    const column = index % FOCUS_COLUMNS.length
    positions.set(id, { x: FOCUS_COLUMNS[column], y: startY + row * 102 })
  })
  return positions
}

function buildFocusLayout(rootId: string, edges: GraphEdge[]) {
  const incoming = sortNodeIds(Array.from(new Set(edges.filter((edge) => edge.to === rootId).map((edge) => edge.from))))
  const outgoing = sortNodeIds(Array.from(new Set(edges.filter((edge) => edge.from === rootId).map((edge) => edge.to))))

  const incomingRows = Math.ceil(incoming.length / FOCUS_COLUMNS.length)
  const incomingY = 92
  const rootY = incoming.length ? incomingY + incomingRows * 102 + 88 : 132
  const outgoingY = rootY + 178
  const outgoingRows = Math.ceil(outgoing.length / FOCUS_COLUMNS.length)
  const height = Math.max(540, outgoingY + Math.max(1, outgoingRows) * 102 + 92)

  const positions = new Map<string, { x: number; y: number }>()
  layoutRow(incoming, incomingY).forEach((position, id) => positions.set(id, position))
  positions.set(rootId, { x: CANVAS_WIDTH / 2, y: rootY })
  layoutRow(outgoing, outgoingY).forEach((position, id) => positions.set(id, position))

  return { positions, height, incomingCount: incoming.length, outgoingCount: outgoing.length, rootY, outgoingY }
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
  const style = typeStyles[node.type] ?? typeStyles.python_function
  const stroke = root || active ? '#0047b3' : style.stroke

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
      opacity={dimmed ? 0.18 : 1}
    >
      {root && (
        <rect
          x={position.x - NODE_WIDTH / 2 - 7}
          y={position.y - NODE_HEIGHT / 2 - 7}
          width={NODE_WIDTH + 14}
          height={NODE_HEIGHT + 14}
          rx="15"
          fill="none"
          stroke="#0066ff"
          strokeWidth="1.5"
          opacity="0.24"
        />
      )}
      <rect
        x={position.x - NODE_WIDTH / 2}
        y={position.y - NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx="11"
        fill={style.fill}
        stroke={stroke}
        strokeWidth={root || active ? 2.3 : 1.45}
      />
      <circle cx={position.x - NODE_WIDTH / 2 + 15} cy={position.y - 13} r="4" fill={style.dot} />
      <text
        x={position.x}
        y={position.y - 6}
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
        y={position.y + 17}
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="10.5"
        fill="#4a5667"
      >
        {shortLabel(node.decisionRole ?? typeLabels[node.type] ?? node.type, 33)}
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
  const verticalGap = Math.abs(y2 - y1)
  const bend = Math.max(34, verticalGap * 0.42)
  const control1Y = downward ? y1 + bend : y1 - bend
  const control2Y = downward ? y2 - bend : y2 + bend
  const path = `M ${x1} ${y1} C ${x1} ${control1Y}, ${x2} ${control2Y}, ${x2} ${y2}`

  return (
    <path
      d={path}
      fill="none"
      stroke={style.stroke}
      strokeWidth="1.8"
      strokeDasharray={style.dash}
      strokeLinecap="round"
      markerEnd={`url(#arrow-${edge.type})`}
      opacity={dimmed ? 0.08 : 0.76}
    />
  )
}

export function InteractiveArchitectureGraph({ compact = false }: { compact?: boolean }) {
  const [rootId, setRootId] = useState<string | null>(null)
  const [inspectedId, setInspectedId] = useState<string>(overviewNodeIds[0])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [direction, setDirection] = useState<DirectionFilter>('both')
  const [filters, setFilters] = useState<Record<GraphEdge['type'], boolean>>({
    calls_function: true,
    tests_function: true,
    defined_in: true,
  })

  const searchMatches = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return graphNodes
      .filter((node) =>
        [node.name, node.type, node.decisionRole ?? '', node.module ?? '', node.source ?? '']
          .join(' ')
          .toLowerCase()
          .includes(normalized),
      )
      .slice(0, 8)
  }, [query])

  const activeEdges = useMemo(() => {
    if (!rootId) return overviewEdges
    return graphEdges.filter((edge) => {
      if (!filters[edge.type]) return false
      if (direction === 'incoming') return edge.to === rootId
      if (direction === 'outgoing') return edge.from === rootId
      return edge.from === rootId || edge.to === rootId
    })
  }, [rootId, filters, direction])

  const layout = useMemo(() => {
    if (!rootId) {
      return {
        positions: new Map(Object.entries(overviewPositions)),
        height: 624,
        incomingCount: 0,
        outgoingCount: 0,
        rootY: 0,
        outgoingY: 0,
      }
    }
    return buildFocusLayout(rootId, activeEdges)
  }, [rootId, activeEdges])

  const visibleIds = useMemo(() => {
    if (!rootId) return new Set<string>(overviewNodeIds)
    return new Set<string>([rootId, ...activeEdges.flatMap((edge) => [edge.from, edge.to])])
  }, [rootId, activeEdges])

  const inspectedNode = nodeById.get(inspectedId) ?? nodeById.get(rootId ?? overviewNodeIds[0])!
  const inspectedEdges = useMemo(
    () => graphEdges.filter((edge) => edge.from === inspectedNode.id || edge.to === inspectedNode.id),
    [inspectedNode.id],
  )
  const inspectedIsComplete = overviewIdSet.has(inspectedNode.id)
  const rootIsComplete = rootId ? overviewIdSet.has(rootId) : false

  const relationshipCounts = useMemo(() => {
    const incoming = inspectedEdges.filter((edge) => edge.to === inspectedNode.id).length
    const outgoing = inspectedEdges.filter((edge) => edge.from === inspectedNode.id).length
    const byType = {
      calls_function: inspectedEdges.filter((edge) => edge.type === 'calls_function').length,
      tests_function: inspectedEdges.filter((edge) => edge.type === 'tests_function').length,
      defined_in: inspectedEdges.filter((edge) => edge.type === 'defined_in').length,
    }
    return { incoming, outgoing, byType }
  }, [inspectedEdges, inspectedNode.id])

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
    if (!rootId && overviewIdSet.has(id)) focusNode(id)
  }

  function focusNode(id: string) {
    if (!nodeById.has(id)) return
    setRootId(id)
    setInspectedId(id)
    setHoveredId(null)
    setQuery('')
  }

  function returnToOverview() {
    setRootId(null)
    setInspectedId(overviewNodeIds[0])
    setHoveredId(null)
    setDirection('both')
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white shadow-sm">
      <div className="border-b border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-[var(--text)]">Ajenda · architecture relationship explorer</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-subtle)]">
              Canonical graph schema {graphMeta.schemaVersion}. Search the reviewed public projection, focus a node, filter relationship types, and inspect incoming or outgoing architecture edges.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <label htmlFor="architecture-graph-search" className="text-xs font-semibold text-[var(--text-muted)]">Search loaded graph projection</label>
            <input
              id="architecture-graph-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setQuery('')
                if (event.key === 'Enter' && searchMatches[0]) {
                  event.preventDefault()
                  focusNode(searchMatches[0].id)
                }
              }}
              placeholder="Function, decision role, module, test…"
              autoComplete="off"
              aria-controls="architecture-graph-search-results"
              className="mt-1 h-11 w-full rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand)_18%,transparent)]"
            />
            {query.trim() && (
              <div id="architecture-graph-search-results" className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-1.5 shadow-lg">
                {searchMatches.length ? searchMatches.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => focusNode(node.id)}
                    className="block w-full rounded px-3 py-2.5 text-left hover:bg-[var(--surface)] focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
                  >
                    <span className="block font-mono text-xs font-semibold text-[var(--text)]">{node.name}</span>
                    <span className="mt-1 block truncate text-xs text-[var(--text-subtle)]">{node.decisionRole ?? typeLabels[node.type] ?? node.type}{node.module ? ` · ${node.module}` : ''}</span>
                  </button>
                )) : (
                  <p className="px-3 py-3 text-sm text-[var(--text-muted)]">No node in the loaded public projection matches that search.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Canonical graph</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">{graphMeta.nodeCount.toLocaleString()} nodes · {graphMeta.edgeCount.toLocaleString()} edges</p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Loaded public projection</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">{graphNodes.length} nodes · {graphEdges.length} edges</p>
          </div>
          <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">Complete direct slices</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text)]">{overviewNodeIds.length} decision functions</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 border-t border-[var(--border)] pt-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Node type legend">
            {Object.entries(typeLabels).map(([type, label]) => (
              <span key={type} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: typeStyles[type]?.dot ?? '#718096' }} aria-hidden />
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="text-xs font-semibold text-[var(--text-muted)]">
              Focus node
              <select
                value={rootId ?? ''}
                onChange={(event) => event.target.value ? focusNode(event.target.value) : returnToOverview()}
                className="mt-1 block h-10 min-w-64 rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-3 text-sm font-medium text-[var(--text)]"
              >
                <option value="">Overview</option>
                {graphNodes.map((node) => <option key={node.id} value={node.id}>{node.name} · {typeLabels[node.type] ?? node.type}</option>)}
              </select>
            </label>
            {rootId && (
              <button type="button" onClick={returnToOverview} className="h-10 rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface)]">
                Overview
              </button>
            )}
          </div>
        </div>

        {rootId && (
          <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2" aria-label="Relationship filters">
                {(Object.keys(filters) as GraphEdge['type'][]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={filters[type]}
                    onClick={() => setFilters((current) => ({ ...current, [type]: !current[type] }))}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filters[type]
                        ? 'border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,white)] text-[var(--brand)]'
                        : 'border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <span className="inline-block h-px w-5" style={{ backgroundColor: edgeStyles[type].stroke }} aria-hidden />
                    {edgeLabels[type]}
                  </button>
                ))}
                <span className="ml-1 text-xs text-[var(--text-subtle)]">{activeEdges.length} visible relationship{activeEdges.length === 1 ? '' : 's'}</span>
              </div>
            </div>

            <div className="flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-1" aria-label="Relationship direction">
              {(['both', 'incoming', 'outgoing'] as DirectionFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={direction === item}
                  onClick={() => setDirection(item)}
                  className={`rounded px-3 py-1.5 text-xs font-semibold capitalize ${direction === item ? 'bg-[var(--text)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--surface)]'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {rootId && (
        <div className={`border-b px-5 py-3 text-xs leading-relaxed md:px-6 ${rootIsComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-amber-200 bg-amber-50 text-amber-950'}`}>
          <strong>{rootIsComplete ? 'Complete direct slice.' : 'Partial loaded slice.'}</strong>{' '}
          {rootIsComplete
            ? 'All direct relationships recorded for this selected decision function in canonical graph schema 1.2 are included in the public projection.'
            : 'This neighboring node is included because it connects to a reviewed decision function. Only relationships present in the loaded public projection are shown; the interface does not imply complete graph coverage for this node.'}
        </div>
      )}

      <div className={compact ? 'max-h-[720px] overflow-auto' : 'max-h-[900px] overflow-auto'}>
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${layout.height}`}
          className="block min-w-[820px] w-full"
          role="group"
          aria-label={rootId ? `Loaded canonical relationships for ${nodeById.get(rootId)?.name}` : 'Selected mission-composition decision functions from the Ajenda canonical architecture graph'}
          onMouseLeave={() => setHoveredId(null)}
        >
          <defs>
            {(Object.keys(edgeStyles) as GraphEdge['type'][]).map((type) => (
              <marker key={type} id={`arrow-${type}`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill={edgeStyles[type].stroke} />
              </marker>
            ))}
            <pattern id="architecture-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#dfe6ee" strokeWidth="0.7" opacity="0.52" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={CANVAS_WIDTH} height={layout.height} fill="#fbfcfe" />
          <rect x="0" y="0" width={CANVAS_WIDTH} height={layout.height} fill="url(#architecture-grid)" />

          {rootId && (
            <g aria-hidden>
              {layout.incomingCount > 0 && <text x="26" y="34" fontFamily="Inter, system-ui, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="#687487">INCOMING RELATIONSHIPS</text>}
              <text x="26" y={layout.rootY - 55} fontFamily="Inter, system-ui, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="#0047b3">FOCUS NODE</text>
              {layout.outgoingCount > 0 && <text x="26" y={layout.outgoingY - 55} fontFamily="Inter, system-ui, sans-serif" fontSize="10.5" fontWeight="700" letterSpacing="1.4" fill="#687487">OUTGOING RELATIONSHIPS</text>}
            </g>
          )}

          <g>
            {activeEdges.map((edge) => {
              const dimmed = Boolean(hoveredId && edge.from !== hoveredId && edge.to !== hoveredId)
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
                  <GraphNodeShape node={node} position={position} active={inspectedNode.id === id} root={rootId === id} dimmed={dimmed} onInspect={inspectNode} />
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <div className="grid border-t border-[var(--border)] xl:grid-cols-[0.88fr_1.12fr]">
        <div className="border-b border-[var(--border)] p-5 xl:border-b-0 xl:border-r xl:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Selected node</p>
              <h3 className="mt-1 break-all font-mono text-base font-semibold text-[var(--text)]">{inspectedNode.name}</h3>
            </div>
            {inspectedNode.id !== rootId && (
              <button type="button" onClick={() => focusNode(inspectedNode.id)} className="rounded-[var(--radius-sm)] border border-[var(--border-control)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]">
                Focus node
              </button>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Incoming</p>
              <p className="mt-1 text-xl font-semibold text-[var(--text)]">{relationshipCounts.incoming}</p>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-subtle)]">Outgoing</p>
              <p className="mt-1 text-xl font-semibold text-[var(--text)]">{relationshipCounts.outgoing}</p>
            </div>
          </div>

          <dl className="mt-5 space-y-3 text-sm">
            <div><dt className="font-semibold text-[var(--text)]">Type</dt><dd className="mt-1 text-[var(--text-muted)]">{typeLabels[inspectedNode.type] ?? inspectedNode.type}</dd></div>
            {inspectedNode.decisionRole && <div><dt className="font-semibold text-[var(--text)]">Decision role</dt><dd className="mt-1 font-mono text-[13px] text-[var(--text-muted)]">{inspectedNode.decisionRole}</dd></div>}
            {inspectedNode.module && <div><dt className="font-semibold text-[var(--text)]">Module</dt><dd className="mt-1 break-all font-mono text-[13px] text-[var(--text-muted)]">{inspectedNode.module}</dd></div>}
            {inspectedNode.source && <div><dt className="font-semibold text-[var(--text)]">Source</dt><dd className="mt-1 break-all font-mono text-[13px] text-[var(--text-muted)]">{inspectedNode.source}</dd></div>}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {(Object.keys(relationshipCounts.byType) as GraphEdge['type'][]).map((type) => (
              <span key={type} className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[var(--text-muted)]">{edgeLabels[type]} · {relationshipCounts.byType[type]}</span>
            ))}
          </div>

          <p className="mt-5 text-xs leading-relaxed text-[var(--text-subtle)]">
            {inspectedIsComplete
              ? 'Coverage: complete direct relationship set for this reviewed decision function in the embedded schema 1.2 projection.'
              : 'Coverage: partial. This node is a loaded neighbor and may have additional canonical relationships outside the reviewed public projection.'}
          </p>
          <a href="/wiki#decision-ownership" className="mt-4 inline-block text-xs font-semibold text-[var(--brand)] hover:underline">Reference: decision ownership →</a>
        </div>

        <div className="p-5 xl:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">Loaded direct relationships</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Direction and edge type are preserved from the canonical graph artifact.</p>
            </div>
            <p className="text-xs font-medium text-[var(--text-subtle)]">{inspectedEdges.length} relationship{inspectedEdges.length === 1 ? '' : 's'}</p>
          </div>

          {inspectedEdges.length ? (
            <ul className="mt-4 max-h-80 space-y-2 overflow-auto pr-1">
              {inspectedEdges.map((edge) => {
                const outgoing = edge.from === inspectedNode.id
                const otherId = outgoing ? edge.to : edge.from
                const other = nodeById.get(otherId)
                return (
                  <li key={edgeKey(edge)} className="grid gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <span className="font-mono text-xs font-semibold" style={{ color: edgeStyles[edge.type].stroke }}>{outgoing ? '→' : '←'} {edge.type}</span>
                    <button type="button" onClick={() => setInspectedId(otherId)} className="min-w-0 truncate text-left font-mono text-xs font-medium text-[var(--text)] underline-offset-2 hover:underline">
                      {other?.name ?? otherId}
                    </button>
                    {other && <button type="button" onClick={() => focusNode(otherId)} className="justify-self-start rounded border border-[var(--border-control)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text)] hover:bg-[var(--surface-strong)] sm:justify-self-auto">Focus</button>}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">No relationships for this node are included in the loaded public projection.</p>
          )}
        </div>
      </div>

      <div className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-xs leading-relaxed text-[var(--text-subtle)] md:px-6">
        Source: Ajenda canonical-dependency-graph CI artifact. The public explorer loads a reviewed subset rather than the complete repository graph. Node identity, relationship direction, edge type, decision roles, modules, and source paths are derived from the recorded artifact; search, filtering, focus, and layout change presentation only.
      </div>
    </div>
  )
}
