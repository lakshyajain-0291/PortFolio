/**
 * Pure layout for ArchitectureSpec diagrams, in real CSS pixels.
 *
 * wide   (width >= NARROW_BELOW): tiers are columns, lanes are rows. Edges are
 *        orthogonal, leave from distributed ports on the facing sides, and turn
 *        in the gap before their target column.
 * narrow (width <  NARROW_BELOW): every node gets a full-width row, tier by
 *        tier. Edges to the next node drop straight down; all others run in
 *        channels on the right edge.
 *
 * Edges carry a number marker instead of a text label; the text list explains
 * each number, so labels never collide at any width.
 *
 * Both templates render this output; neither duplicates the geometry.
 */
import type { ArchEdge, ArchitectureSpec, ArchNode } from '../architecture/types';

export const NARROW_BELOW = 640;

export interface Point {
  x: number;
  y: number;
}

export interface LayoutNode {
  id: string;
  node: ArchNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutEdge {
  id: string;
  edge: ArchEdge;
  /** 1-based position in spec.edges; the drawing shows this number, the list explains it. */
  index: number;
  points: Point[];
  /** Where the edge's number sits: middle of its longest segment, nudged off other markers. */
  marker: Point;
}

export interface LayoutGroup {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiagramLayout {
  width: number;
  height: number;
  orientation: 'wide' | 'narrow';
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  groups: LayoutGroup[];
}

export interface LayoutOptions {
  nodeHeight?: number;
  /** Force an orientation instead of choosing by width. */
  orientation?: 'wide' | 'narrow';
}

const PAD = 16;
const GROUP_PAD = 12;
const GROUP_LABEL = 22;
const PORT_INSET = 10;
const CHANNEL_STEP = 11;

const cy = (n: LayoutNode) => n.y + n.h / 2;
const cx = (n: LayoutNode) => n.x + n.w / 2;

/** Points along one side of a node, spread evenly between the insets. */
function spread(start: number, length: number, count: number, index: number): number {
  if (count <= 1) return start + length / 2;
  const usable = length - 2 * PORT_INSET;
  return start + PORT_INSET + (usable * index) / (count - 1);
}

function groupBoxes(spec: ArchitectureSpec, nodes: LayoutNode[]): LayoutGroup[] {
  return spec.groups
    .map((g) => {
      const members = nodes.filter((n) => n.node.group === g.id);
      if (!members.length) return null;
      const x0 = Math.min(...members.map((n) => n.x)) - GROUP_PAD;
      const y0 = Math.min(...members.map((n) => n.y)) - GROUP_PAD - GROUP_LABEL;
      const x1 = Math.max(...members.map((n) => n.x + n.w)) + GROUP_PAD;
      const y1 = Math.max(...members.map((n) => n.y + n.h)) + GROUP_PAD;
      return { id: g.id, label: g.label, x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    })
    .filter((g): g is LayoutGroup => g !== null);
}

function simplify(points: Point[]): Point[] {
  return points.filter((p, i, all) => {
    if (i === 0 || i === all.length - 1) return true;
    const a = all[i - 1];
    const b = all[i + 1];
    const collinear = (a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y);
    const duplicate = a.x === p.x && a.y === p.y;
    return !collinear && !duplicate;
  });
}

const MARK = 20;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Nodes plus the label strip of each group: places a marker must not cover. */
const obstacles = (nodes: LayoutNode[], groups: LayoutGroup[]): Box[] => [
  ...nodes,
  ...groups.map((g) => ({ x: g.x, y: g.y, w: Math.min(g.w, 24 + g.label.length * 7.4), h: GROUP_LABEL })),
];

/** Centre of the longest segment, slid along it until it clears earlier markers and nodes. */
function placeMarker(points: Point[], taken: Point[], boxes: Box[]): Point {
  let best: [Point, Point] = [points[0], points[1] ?? points[0]];
  for (let i = 2; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    if (Math.hypot(b.x - a.x, b.y - a.y) > Math.hypot(best[1].x - best[0].x, best[1].y - best[0].y)) best = [a, b];
  }
  const [a, b] = best;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const at = (t: number): Point => ({ x: a.x + ((b.x - a.x) * t) / len, y: a.y + ((b.y - a.y) * t) / len });
  const clear = (p: Point) =>
    taken.every((q) => Math.abs(q.x - p.x) > MARK + 2 || Math.abs(q.y - p.y) > MARK + 2) &&
    boxes.every((n) => p.x < n.x - MARK / 2 || p.x > n.x + n.w + MARK / 2 || p.y < n.y - MARK / 2 || p.y > n.y + n.h + MARK / 2);
  const mid = len / 2;
  for (let step = 0; step <= len / 2; step += 6) {
    for (const t of [mid + step, mid - step]) {
      if (t < MARK / 2 || t > len - MARK / 2) continue;
      const p = at(t);
      if (clear(p)) return p;
    }
  }
  return at(mid);
}

function layoutWide(spec: ArchitectureSpec, width: number, nodeH: number): DiagramLayout {
  const tiers = [...new Set(spec.nodes.map((n) => n.tier))].sort((a, b) => a - b);
  const col = new Map(tiers.map((t, i) => [t, i]));
  const colGap = Math.round(Math.min(110, Math.max(56, width * 0.07)));
  const colW = (width - 2 * PAD - (tiers.length - 1) * colGap) / tiers.length;
  const rowGap = 44;
  const top = PAD + (spec.groups.length ? GROUP_LABEL + GROUP_PAD : 0);

  const nodes: LayoutNode[] = spec.nodes.map((n) => ({
    id: n.id,
    node: n,
    x: PAD + (col.get(n.tier) ?? 0) * (colW + colGap),
    y: top + n.lane * (nodeH + rowGap),
    w: colW,
    h: nodeH,
  }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const maxLane = Math.max(0, ...spec.nodes.map((n) => n.lane));

  // Decide each edge's sides, then distribute ports per node side.
  type Side = 'left' | 'right' | 'top' | 'bottom';
  const plan = spec.edges
    .map((e) => {
      const s = byId.get(e.from);
      const t = byId.get(e.to);
      if (!s || !t) return null;
      const sc = col.get(s.node.tier) ?? 0;
      const tc = col.get(t.node.tier) ?? 0;
      const [out, inn]: [Side, Side] = tc > sc ? ['right', 'left'] : tc < sc ? ['left', 'right'] : t.y > s.y ? ['bottom', 'top'] : ['top', 'bottom'];
      return { e, s, t, sc, tc, out, inn };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const sideLoad = new Map<string, { edge: string; other: number }[]>();
  const push = (node: string, side: Side, edge: string, other: number) => {
    const key = `${node}:${side}`;
    sideLoad.set(key, [...(sideLoad.get(key) ?? []), { edge, other }]);
  };
  plan.forEach((p) => {
    const vertical = p.out === 'top' || p.out === 'bottom';
    push(p.s.id, p.out, p.e.id, vertical ? cx(p.t) : cy(p.t));
    push(p.t.id, p.inn, p.e.id, vertical ? cx(p.s) : cy(p.s));
  });
  const port = (n: LayoutNode, side: Side, edge: string): Point => {
    const list = [...(sideLoad.get(`${n.id}:${side}`) ?? [])].sort((a, b) => a.other - b.other);
    const i = Math.max(0, list.findIndex((l) => l.edge === edge));
    if (side === 'left' || side === 'right') {
      return { x: side === 'left' ? n.x : n.x + n.w, y: spread(n.y, n.h, list.length, i) };
    }
    return { x: spread(n.x, n.w, list.length, i), y: side === 'top' ? n.y : n.y + n.h };
  };

  // Spread vertical runs that share a gap so parallel edges stay distinct.
  const gapUse = new Map<string, number>();
  const gapSlot = (key: string) => {
    const n = gapUse.get(key) ?? 0;
    gapUse.set(key, n + 1);
    return n;
  };
  const slotOffset = (slot: number) => (slot % 2 === 0 ? 1 : -1) * Math.ceil(slot / 2) * 8;

  const edges: LayoutEdge[] = plan.map(({ e, s, t, sc, tc, out, inn }) => {
    const a = port(s, out, e.id);
    const b = port(t, inn, e.id);
    let points: Point[];
    if (out === 'top' || out === 'bottom') {
      const midY = (a.y + b.y) / 2;
      points = [a, { x: a.x, y: midY }, { x: b.x, y: midY }, b];
    } else {
      const forward = tc > sc;
      const turnCol = forward ? tc - 1 : tc;
      const baseX = PAD + turnCol * (colW + colGap) + colW + colGap / 2;
      const x = baseX + slotOffset(gapSlot(`g${turnCol}`));
      // Run along the source row unless a node in a skipped column blocks it.
      const lo = Math.min(sc, tc) + 1;
      const hi = Math.max(sc, tc) - 1;
      const blocked = (y: number) =>
        nodes.some((n) => {
          const c = col.get(n.node.tier) ?? 0;
          return c >= lo && c <= hi && y >= n.y - 4 && y <= n.y + n.h + 4;
        });
      if (Math.abs(sc - tc) <= 1 || !blocked(a.y)) {
        points = [a, { x, y: a.y }, { x, y: b.y }, b];
      } else {
        const exitX = forward ? a.x + colGap / 2 : a.x - colGap / 2;
        const rowY = s.y + s.h + rowGap / 2;
        const laneY = rowY + slotOffset(gapSlot(`r${rowY}`));
        points = [a, { x: exitX, y: a.y }, { x: exitX, y: laneY }, { x, y: laneY }, { x, y: b.y }, b];
      }
    }
    return { id: e.id, edge: e, index: spec.edges.indexOf(e) + 1, points: simplify(points), marker: { x: 0, y: 0 } };
  });
  const groups = groupBoxes(spec, nodes);
  const blocks = obstacles(nodes, groups);
  const taken: Point[] = [];
  edges.forEach((e) => {
    e.marker = placeMarker(e.points, taken, blocks);
    taken.push(e.marker);
  });

  const bottom = Math.max(top + (maxLane + 1) * (nodeH + rowGap) - rowGap, ...groups.map((g) => g.y + g.h));
  return { width, height: Math.ceil(bottom + PAD), orientation: 'wide', nodes, edges, groups };
}

function layoutNarrow(spec: ArchitectureSpec, width: number, nodeH: number): DiagramLayout {
  // Tier order, except that a group's members stay together at its earliest tier,
  // so the group box encloses only its own nodes.
  const groupTier = new Map<string, number>();
  spec.nodes.forEach((n) => n.group && groupTier.set(n.group, Math.min(groupTier.get(n.group) ?? n.tier, n.tier)));
  const key = (n: ArchNode) => (n.group ? (groupTier.get(n.group) ?? n.tier) + 0.5 : n.tier);
  const ordered = [...spec.nodes].sort(
    (a, b) => key(a) - key(b) || (a.group ?? '').localeCompare(b.group ?? '') || a.tier - b.tier || a.lane - b.lane,
  );
  const order = new Map(ordered.map((n, i) => [n.id, i]));

  // Edges that are not "next node straight below" need a right-hand channel.
  const channelled = spec.edges.filter((e) => {
    const i = order.get(e.from);
    const j = order.get(e.to);
    return i !== undefined && j !== undefined && Math.abs(j - i) !== 1;
  });
  // Greedy interval colouring: edges whose vertical spans overlap get different channels.
  const spans = channelled
    .map((e) => {
      const i = order.get(e.from) ?? 0;
      const j = order.get(e.to) ?? 0;
      return { e, lo: Math.min(i, j), hi: Math.max(i, j) };
    })
    .sort((a, b) => a.lo - b.lo || b.hi - a.hi);
  const channelEnds: number[] = [];
  const channelOf = new Map<string, number>();
  spans.forEach((s) => {
    let c = channelEnds.findIndex((end) => end < s.lo);
    if (c === -1) c = channelEnds.length;
    channelEnds[c] = s.hi;
    channelOf.set(s.e.id, c);
  });
  const channelsW = channelEnds.length ? 12 + channelEnds.length * CHANNEL_STEP : 0;

  const groupIds = new Set(spec.nodes.map((n) => n.group).filter(Boolean));
  const inset = groupIds.size ? GROUP_PAD + 2 : 0;
  const nodeX = PAD + inset;
  const nodeW = width - 2 * PAD - 2 * inset - channelsW;

  const nodes: LayoutNode[] = [];
  let y = PAD;
  ordered.forEach((n, i) => {
    const prev = ordered[i - 1];
    if (prev) y += prev.tier !== n.tier ? 34 : 26;
    if (n.group && n.group !== prev?.group) y += GROUP_LABEL + GROUP_PAD;
    if (prev?.group && prev.group !== n.group) y += GROUP_PAD;
    nodes.push({ id: n.id, node: n, x: nodeX, y, w: nodeW, h: nodeH });
    y += nodeH;
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // Ports on the right side are shared by channelled edges; spread them.
  const rightLoad = new Map<string, string[]>();
  channelled.forEach((e) => {
    [e.from, e.to].forEach((id) => rightLoad.set(id, [...(rightLoad.get(id) ?? []), e.id]));
  });
  const rightPort = (n: LayoutNode, edge: string): Point => {
    const list = rightLoad.get(n.id) ?? [];
    return { x: n.x + n.w, y: spread(n.y, n.h, list.length, list.indexOf(edge)) };
  };
  const straightCount = new Map<string, number>();

  const edges: LayoutEdge[] = spec.edges
    .map((e): LayoutEdge | null => {
      const s = byId.get(e.from);
      const t = byId.get(e.to);
      if (!s || !t) return null;
      const c = channelOf.get(e.id);
      if (c === undefined) {
        // Adjacent nodes: a short vertical run; two edges between the same pair sit side by side.
        const key = [s.id, t.id].sort().join('|');
        const k = straightCount.get(key) ?? 0;
        straightCount.set(key, k + 1);
        const down = t.y > s.y;
        // Entering a group through its top edge: run clear of the group's label strip.
        const lower = down ? t : s;
        const upper = down ? s : t;
        const entersGroup = Boolean(lower.node.group) && lower.node.group !== upper.node.group;
        const base = entersGroup ? lower.x + lower.w * 0.82 : cx(s);
        const x = base + (k === 0 ? 0 : k % 2 ? 24 : -24);
        return { id: e.id, edge: e, index: spec.edges.indexOf(e) + 1, points: [{ x, y: down ? s.y + s.h : s.y }, { x, y: down ? t.y : t.y + t.h }], marker: { x: 0, y: 0 } };
      }
      const a = rightPort(s, e.id);
      const b = rightPort(t, e.id);
      const x = nodeX + nodeW + inset + 12 + c * CHANNEL_STEP;
      return { id: e.id, edge: e, index: spec.edges.indexOf(e) + 1, points: simplify([a, { x, y: a.y }, { x, y: b.y }, b]), marker: { x: 0, y: 0 } };
    })
    .filter((e): e is LayoutEdge => e !== null);
  const groups = groupBoxes(spec, nodes).map((g) => ({ ...g, w: nodeW + 2 * GROUP_PAD }));
  const blocks = obstacles(nodes, groups);
  const taken: Point[] = [];
  edges.forEach((e) => {
    e.marker = placeMarker(e.points, taken, blocks);
    taken.push(e.marker);
  });
  const bottom = Math.max(y, ...groups.map((g) => g.y + g.h));
  return { width, height: Math.ceil(bottom + PAD), orientation: 'narrow', nodes, edges, groups };
}

export function layoutDiagram(spec: ArchitectureSpec, width: number, options: LayoutOptions = {}): DiagramLayout {
  const nodeH = options.nodeHeight ?? 60;
  const tiers = new Set(spec.nodes.map((n) => n.tier)).size;
  const roomy = (width - 2 * PAD) / Math.max(1, tiers) >= 150;
  const orientation = options.orientation ?? (width >= NARROW_BELOW && roomy ? 'wide' : 'narrow');
  return orientation === 'wide' ? layoutWide(spec, width, nodeH) : layoutNarrow(spec, width, nodeH);
}

/** Nodes and edges touching the given node, for linked highlighting. */
export function neighbourhood(spec: ArchitectureSpec, nodeId: string | null): { nodes: Set<string>; edges: Set<string> } {
  const nodes = new Set<string>();
  const edges = new Set<string>();
  if (!nodeId) return { nodes, edges };
  nodes.add(nodeId);
  spec.edges.forEach((e) => {
    if (e.from === nodeId || e.to === nodeId) {
      edges.add(e.id);
      nodes.add(e.from);
      nodes.add(e.to);
    }
  });
  return { nodes, edges };
}

/** SVG path data for an orthogonal polyline with small rounded corners. */
export function roundedPath(points: Point[], radius = 6): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [p0, p1, p2] = [points[i - 1], points[i], points[i + 1]];
    const r = Math.min(radius, Math.hypot(p1.x - p0.x, p1.y - p0.y) / 2, Math.hypot(p2.x - p1.x, p2.y - p1.y) / 2);
    const inX = p1.x - Math.sign(p1.x - p0.x) * r;
    const inY = p1.y - Math.sign(p1.y - p0.y) * r;
    const outX = p1.x + Math.sign(p2.x - p1.x) * r;
    const outY = p1.y + Math.sign(p2.y - p1.y) * r;
    d += ` L ${inX} ${inY} Q ${p1.x} ${p1.y} ${outX} ${outY}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}
