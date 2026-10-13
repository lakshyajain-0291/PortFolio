import { useMemo } from 'react';
import { FloorGrid, Label, Link, PALETTES, Pulse, Stage, WireBox, WireDrum, colorFor, tone, type SceneProps, type V3 } from './kit';

/**
 * libr as a model: the moderator quorum floats above a Kademlia ring of
 * database nodes. A post climbs to the moderators, comes back signed, and is
 * written to the k = 4 ring nodes closest to its time-bucket key.
 */

const MODS = 5;
const RING = 12;
const RING_R = 2.6;
const RING_C: V3 = [2.4, 0.35, 0.2];
/** Ring positions holding the key's k = 4 closest nodes, and the bootstrap peers. */
const STORERS = [1, 2, 3, 4];
const BOOTSTRAP = [8, 9];
const KEY_ANGLE = (2.5 / RING) * Math.PI * 2;

const ringAt = (i: number, r = RING_R, y = RING_C[1]): V3 => {
  const a = (i / RING) * Math.PI * 2;
  return [RING_C[0] + Math.cos(a) * r, y, RING_C[2] + Math.sin(a) * r];
};
const modAt = (i: number): V3 => {
  const a = Math.PI * (0.15 + (0.7 * i) / (MODS - 1));
  return [-2.4 + Math.cos(a) * 2.1, 2.6, -0.9 - Math.sin(a) * 1.3];
};

export default function LibrScene({ theme, litNodes, litEdges, stepId, reducedMotion }: SceneProps) {
  const p = PALETTES[theme];
  const n = (id: string) => colorFor(tone(id, litNodes), p);
  const e = (id: string) => colorFor(tone(id, litEdges), p);
  const on = (id: string) => litEdges.has(id) && !reducedMotion;

  const client: V3 = [-3.6, 0.45, 2.4];
  const nlp: V3 = [0.6, 2.6, -3.4];
  const registry: V3 = [-5.6, 2.6, -2.2];
  const modHub: V3 = [-2.4, 2.6, -0.9];

  // In the quorum steps, a bare majority (3 of 5) signs; the others are shown declining.
  const quorumStep = stepId === 'quorum' || stepId === 'decide';
  const storersLit = litNodes.has('dbnodes') && (litEdges.has('store') || litEdges.has('fetch'));

  const paths = useMemo(() => {
    const toMods: V3[] = [client, [client[0], 2.6, client[2]], modHub];
    const toBoot: V3[] = [client, [client[0] + 2.2, 0.35, client[2] + 0.4], ringAt(BOOTSTRAP[0])];
    const toStorers = STORERS.map((i): V3[] => [client, [0.4, 0.9, 1.6], ringAt(i)]);
    // Iterative lookup: from a bootstrap peer around the ring to the storers.
    const span = STORERS[3] + RING - BOOTSTRAP[0];
    const route: V3[] = Array.from({ length: 9 }, (_, k) => ringAt(BOOTSTRAP[0] + (k * span) / 8, RING_R - 0.05));
    return { toMods, toBoot, toStorers, route };
  }, []);

  return (
    <Stage theme={theme} animating={litEdges.size > 0 && !reducedMotion} zoom={58} target={[0, 1, 0]}>
      <FloorGrid size={14} color={p.dim} />

      {/* Client */}
      <WireBox at={client} size={[1.5, 0.9, 1]} color={n('client')} fill={p.fill} />
      <Label at={[client[0], client[1] + 0.85, client[2]]} text="DESKTOP CLIENT" state={tone('client', litNodes)} />

      {/* Moderator quorum */}
      {Array.from({ length: MODS }, (_, i) => {
        const signs = i < 3;
        const color = quorumStep ? (signs ? p.rev : p.dim) : n('moderators');
        return <WireBox key={i} at={modAt(i)} size={[0.55, 0.55, 0.55]} color={color} fill={p.fill} />;
      })}
      <Label at={[modHub[0], modHub[1] - 0.75, modHub[2] + 0.6]} text={quorumStep ? 'MAJORITY SIGNS: 3 OF 5' : 'MODERATORS'} state={tone('moderators', litNodes)} />
      <Link points={[modAt(0), modAt(1), modAt(2), modAt(3), modAt(4)]} color={n('moderators')} dashed width={1} />

      <WireBox at={nlp} size={[1.3, 0.6, 0.7]} color={n('nlp')} fill={p.fill} dashed />
      <Label at={[nlp[0], nlp[1] + 0.65, nlp[2]]} text="CLOUD NATURAL LANGUAGE" state={tone('nlp', litNodes)} />
      <WireBox at={registry} size={[1.1, 0.5, 0.7]} color={p.dim} fill={p.fill} dashed />
      <Label at={[registry[0], registry[1] + 0.6, registry[2]]} text="REGISTRY (PLANNED)" state={tone('registry', litNodes)} />

      {/* Kademlia ring */}
      <Link points={Array.from({ length: 49 }, (_, k) => ringAt(k / 4, RING_R, 0.02))} color={n('dbnodes')} width={1} />
      {Array.from({ length: RING }, (_, i) => {
        const isStorer = STORERS.includes(i);
        const isBoot = BOOTSTRAP.includes(i);
        const id = isBoot ? 'bootstrap' : 'dbnodes';
        let color = n(id);
        if (litNodes.size && isStorer && storersLit) color = p.rev;
        else if (litNodes.size && id === 'dbnodes' && !isStorer && storersLit) color = p.dim;
        return <WireBox key={i} at={ringAt(i)} size={[0.5, isBoot ? 0.95 : 0.7, 0.5]} color={color} fill={p.fill} />;
      })}
      <mesh position={[RING_C[0] + Math.cos(KEY_ANGLE) * (RING_R + 0.75), 0.4, RING_C[2] + Math.sin(KEY_ANGLE) * (RING_R + 0.75)]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.22, 0.22, 0.02]} />
        <meshBasicMaterial color={p.rev} />
      </mesh>
      <Label at={[RING_C[0] + Math.cos(KEY_ANGLE) * (RING_R + 1.5), 0.4, RING_C[2] + Math.sin(KEY_ANGLE) * (RING_R + 1.5)]} text="KEY = H(MINUTE)" state="plain" />
      <Label at={[RING_C[0], 0.1, RING_C[2]]} text="KADEMLIA DHT" state={tone('dbnodes', litNodes)} />
      <Label at={[ringAt(BOOTSTRAP[0])[0], 1.35, ringAt(BOOTSTRAP[0])[2] - 0.2]} text="BOOTSTRAP" state={tone('bootstrap', litNodes)} />

      {/* PostgreSQL under the storers */}
      {STORERS.map((i) => {
        const [x, , z] = ringAt(i, RING_R + 0.05);
        return <WireDrum key={i} at={[x, -0.55, z]} radius={0.2} height={0.35} color={n('store')} fill={p.fill} />;
      })}
      <Label at={[ringAt(2, RING_R + 1.1)[0], -0.55, ringAt(2, RING_R + 1.1)[2]]} text="POSTGRESQL" state={tone('store', litNodes)} />

      {/* Connections */}
      <Link points={paths.toMods} color={litEdges.has('submit') || litEdges.has('verdict') ? p.rev : colorFor(tone('submit', litEdges), p)} />
      <Link points={[modHub, nlp]} color={e('score')} />
      <Link points={[modHub, [registry[0], modHub[1], modHub[2]], registry]} color={e('registry')} dashed />
      <Link points={paths.toBoot} color={e('lookup')} />
      {paths.toStorers.map((pts, i) => (
        <Link key={i} points={pts} color={litEdges.has('store') ? p.rev : e('fetch')} dashed={!litEdges.has('store') && litEdges.has('fetch')} />
      ))}
      {STORERS.map((i) => {
        const [x, , z] = ringAt(i);
        return <Link key={`p${i}`} points={[[x, 0, z], [x, -0.37, z]]} color={e('persist')} />;
      })}

      {on('submit') && <Pulse points={paths.toMods} color={p.rev} />}
      {on('verdict') && <Pulse points={[...paths.toMods].reverse()} color={p.rev} offset={0.5} />}
      {on('score') && <Pulse points={[modHub, nlp]} color={p.rev} speed={0.8} />}
      {on('lookup') && <Pulse points={paths.toBoot} color={p.rev} />}
      {on('route') && <Pulse points={paths.route} color={p.rev} speed={0.35} />}
      {(on('store') || on('fetch')) && paths.toStorers.map((pts, i) => <Pulse key={i} points={pts} color={p.rev} offset={i * 0.12} />)}
    </Stage>
  );
}
