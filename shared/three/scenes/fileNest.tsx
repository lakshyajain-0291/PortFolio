import { useMemo } from 'react';
import { FloorGrid, Label, Link, PALETTES, Pulse, Stage, WireBox, WireDrum, colorFor, tone, type SceneProps, type V3 } from './kit';

/**
 * FileNest as a model, after Figures 3 and 7 of the paper: the tagging-vector
 * hierarchy floats above the peers that hold its state. Each vector drops a
 * thread to the peer the DHT assigns it, so neighbouring regions land on
 * unrelated peers. A query descends only the branches whose covering disc
 * overlaps it; pruned branches fade.
 */

interface TV {
  id: string;
  depth: number;
  parent?: string;
  /** Peer index the DHT assigns this vector to. */
  peer: number;
}

// The paper's example hierarchy (Figure 1): depth-1 A, B, C; children A1, A2, B1, B2, C1; leaves A2a, A2b, B1a.
const TVS: TV[] = [
  { id: 'A', depth: 1, peer: 3 },
  { id: 'B', depth: 1, peer: 0 },
  { id: 'C', depth: 1, peer: 4 },
  { id: 'A1', depth: 2, parent: 'A', peer: 2 },
  { id: 'A2', depth: 2, parent: 'A', peer: 0 },
  { id: 'B1', depth: 2, parent: 'B', peer: 5 },
  { id: 'B2', depth: 2, parent: 'B', peer: 1 },
  { id: 'C1', depth: 2, parent: 'C', peer: 6 },
  { id: 'A2a', depth: 3, parent: 'A2', peer: 6 },
  { id: 'A2b', depth: 3, parent: 'A2', peer: 4 },
  { id: 'B1a', depth: 3, parent: 'B1', peer: 2 },
];
const PEERS = 7;
/** The indexing path of Figure 1 and the matches of Figure 7. */
const INDEX_PATH = ['A', 'A2', 'A2b'];
const QUERY_PATH = ['A', 'A2', 'B', 'B1', 'A2b', 'B1a'];

const peerAt = (i: number): V3 => [-3.3 + i * 1.1, 0.25, 1.2];
const tvAt = (tv: TV): V3 => {
  const row = TVS.filter((t) => t.depth === tv.depth);
  const k = row.indexOf(tv);
  const spread = tv.depth === 1 ? 2.6 : tv.depth === 2 ? 1.45 : 1.9;
  return [(k - (row.length - 1) / 2) * spread, 4.1 - tv.depth * 0.95, -1.6];
};

export default function FileNestScene({ theme, litNodes, litEdges, flowId, stepId, reducedMotion }: SceneProps) {
  const p = PALETTES[theme];
  const n = (id: string) => colorFor(tone(id, litNodes), p);
  const e = (id: string) => colorFor(tone(id, litEdges), p);
  const on = (id: string) => litEdges.has(id) && !reducedMotion;

  const origin: V3 = [-4.8, 0.45, 3.4];
  const querier: V3 = [-2.6, 0.45, 3.6];
  const storage: V3 = [5.6, 0.6, 3.6];

  // Which vectors the current step traces through the hierarchy.
  const path = useMemo(() => {
    if (flowId === 'index' && (stepId === 'descend' || stepId === 'leaf')) return INDEX_PATH;
    if (flowId === 'index' && stepId === 'root') return ['A'];
    if (flowId === 'query' && (stepId === 'forward' || stepId === 'return')) return QUERY_PATH;
    if (flowId === 'query' && stepId === 'test') return ['A', 'B'];
    if (flowId === 'placement' && stepId !== null) return ['A', 'A2', 'A2b'];
    if (flowId === 'pruning' && stepId === 'prune') return ['A', 'A2', 'B', 'B1'];
    return [];
  }, [flowId, stepId]);
  const tracing = path.length > 0;
  const showThreads = flowId === 'placement' || (!tracing && litNodes.size === 0);

  const tvColor = (tv: TV) => {
    if (!tracing) return n(tv.depth === 3 ? 'leaves' : 'routers');
    return path.includes(tv.id) ? p.rev : p.dim;
  };

  const pos = new Map(TVS.map((t) => [t.id, tvAt(t)]));
  const indexPulse: V3[] = [origin, [origin[0], 3.3, -1.6], ...INDEX_PATH.map((id) => pos.get(id) as V3)];
  const queryPulseA: V3[] = [querier, [querier[0], 3.3, -1.6], ...['A', 'A2', 'A2b'].map((id) => pos.get(id) as V3)];
  const queryPulseB: V3[] = [querier, [querier[0], 3.3, -1.6], ...['B', 'B1', 'B1a'].map((id) => pos.get(id) as V3)];

  return (
    <Stage theme={theme} animating={litEdges.size > 0 && !reducedMotion} zoom={64} target={[0.4, 1.4, 0.6]}>
      <FloorGrid size={14} color={p.dim} />

      {/* Hierarchy of tagging vectors */}
      {TVS.map((tv) => {
        const at = tvAt(tv);
        const parent = tv.parent ? pos.get(tv.parent) : undefined;
        const pruned = tracing && !path.includes(tv.id);
        return (
          <group key={tv.id}>
            {parent && <Link points={[parent, at]} color={pruned ? p.dim : tracing ? p.rev : p.line} width={pruned ? 1 : 1.5} dashed={pruned} />}
            <mesh position={at}>
              <sphereGeometry args={[tv.depth === 1 ? 0.2 : 0.15, 18, 12]} />
              <meshBasicMaterial color={tvColor(tv)} wireframe />
            </mesh>
            {/* covering radius, drawn as a flat ring */}
            <mesh position={[at[0], at[1] - 0.02, at[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[tv.depth === 1 ? 0.62 : 0.4, tv.depth === 1 ? 0.64 : 0.42, 48]} />
              <meshBasicMaterial color={tvColor(tv)} transparent opacity={pruned ? 0.25 : 0.7} />
            </mesh>
            <Label at={[at[0], at[1] + 0.38, at[2]]} text={tv.id} state={tracing ? (pruned ? 'dim' : 'lit') : 'plain'} />
            {showThreads && <Link points={[at, peerAt(tv.peer)]} color={flowId === 'placement' && path.includes(tv.id) ? p.rev : p.dim} dashed width={0.8} />}
          </group>
        );
      })}
      <Label at={[-4.1, 3.15, -1.6]} text="DEPTH 1" state="plain" />
      <Label at={[-4.1, 2.2, -1.6]} text="DEPTH 2" state="plain" />
      <Label at={[-4.1, 1.25, -1.6]} text="DEPTH 3 (LEAVES)" state="plain" />

      {/* Peers that hold the state, placed by the DHT */}
      <Link points={[peerAt(0), peerAt(PEERS - 1)]} color={n('dht')} width={1} dashed />
      {Array.from({ length: PEERS }, (_, i) => (
        <WireBox key={i} at={peerAt(i)} size={[0.75, 0.5, 0.75]} color={n('dht')} fill={p.fill} />
      ))}
      <Label at={[-2.2, -0.35, 2.3]} text="PEERS, PLACED BY THE DHT" state={tone('dht', litNodes)} />

      <WireBox at={origin} size={[1.1, 0.7, 0.8]} color={n('origin')} fill={p.fill} />
      <Label at={[origin[0], origin[1] + 0.7, origin[2]]} text="ORIGIN PEER" state={tone('origin', litNodes)} />
      <WireBox at={querier} size={[1.1, 0.7, 0.8]} color={n('querier')} fill={p.fill} />
      <Label at={[querier[0], querier[1] + 0.7, querier[2]]} text="QUERYING PEER" state={tone('querier', litNodes)} />
      <WireDrum at={storage} radius={0.7} height={1} color={n('storage')} fill={p.fill} />
      <Label at={[storage[0], storage[1] - 0.95, storage[2] + 0.5]} text="CONTENT-ADDRESSED STORAGE" state={tone('storage', litNodes)} />

      {/* Connections */}
      <Link points={[origin, [origin[0], 0.45, 4.6], [storage[0], 0.45, 4.6], storage]} color={e('store')} />
      <Link points={[querier, [querier[0], 0.15, 4.3], [storage[0] - 0.4, 0.15, 4.3], storage]} color={e('fetch')} />

      {on('index') || on('descend') ? <Pulse points={indexPulse} color={p.rev} speed={0.3} /> : null}
      {on('query') && <Pulse points={queryPulseA} color={p.rev} speed={0.3} />}
      {on('query') && <Pulse points={queryPulseB} color={p.rev} speed={0.3} offset={0.15} />}
      {on('result') && <Pulse points={[pos.get('A2b') as V3, querier]} color={p.rev} speed={0.5} />}
      {on('result') && <Pulse points={[pos.get('B1a') as V3, querier]} color={p.rev} speed={0.5} offset={0.4} />}
      {on('store') && <Pulse points={[origin, [origin[0], 0.45, 4.6], [storage[0], 0.45, 4.6], storage]} color={p.rev} />}
      {on('fetch') && <Pulse points={[storage, [storage[0] - 0.4, 0.15, 4.3], [querier[0], 0.15, 4.3], querier]} color={p.rev} />}
    </Stage>
  );
}
