import { useMemo } from 'react';
import { FloorGrid, Label, Link, PALETTES, Pulse, Stage, WireBox, WireDrum, colorFor, tone, type SceneProps, type V3 } from './kit';

/**
 * Mini-K8ts as a model: two control-plane replicas share one lease row in
 * PostgreSQL; the holder schedules onto a rack of eight workers whose
 * containers sit on top of them. Flows change the rack itself: a worker goes
 * dark and its containers move, the lease changes hands, a job gains replicas.
 */

const COLS = 4;
const workerAt = (i: number): V3 => [1 + (i % COLS) * 1.25, 0.3, 0.6 + Math.floor(i / COLS) * 1.5];
const WORKERS = 8;
/** Containers per worker before anything happens. */
const BASE = [2, 1, 3, 1, 2, 2, 1, 2];
const FAILED = 5;
const FILTERED_OUT = [1, 3, 6];
const CHOSEN = 4;

export default function MiniK8tsScene({ theme, litNodes, litEdges, flowId, stepId, reducedMotion }: SceneProps) {
  const p = PALETTES[theme];
  const n = (id: string) => colorFor(tone(id, litNodes), p);
  const e = (id: string) => colorFor(tone(id, litEdges), p);
  const on = (id: string) => litEdges.has(id) && !reducedMotion;
  const step = `${flowId}:${stepId}`;

  const cli: V3 = [-4.4, 0.4, 2.4];
  const replicas: V3[] = [
    [-2.4, 2.3, -1.2],
    [0.2, 2.3, -1.2],
  ];
  const store: V3 = [-1.7, 0.5, 0.9];
  const metrics: V3 = [4.2, 2.3, -2.4];

  // Who holds the lease: the second replica once it takes over.
  const leader = step === 'failover:takeover' ? 1 : 0;
  const standbyDown = step === 'failover:takeover';

  const failing = flowId === 'heal' && stepId !== null;
  const moved = step === 'heal:replace';
  const containers = useMemo(() => {
    const c = [...BASE];
    if (moved) {
      c[FAILED] = 0;
      c[2] += 1;
      c[7] += 1;
    }
    if (step === 'schedule:bind' || step === 'schedule:run') c[CHOSEN] += 1;
    if (step === 'autoscale:up') {
      c[0] += 1;
      c[4] += 1;
    }
    if (step === 'autoscale:down') c[2] -= 1;
    return c;
  }, [moved, step]);

  const workerColor = (i: number) => {
    if (failing && i === FAILED) return p.rev;
    if (step === 'schedule:filter') return FILTERED_OUT.includes(i) ? p.dim : p.line;
    if (step === 'schedule:score' || step === 'schedule:bind') return i === CHOSEN ? p.rev : p.dim;
    return n('workers');
  };

  const rackTop: V3 = [2.9, 0.9, 1.35];
  const leaderPos = replicas[leader];
  const syncPath: V3[] = [rackTop, [rackTop[0], 2.3, rackTop[2]], [leaderPos[0] + 0.6, 2.3, leaderPos[2] + 0.5]];
  const submitPath: V3[] = [cli, [cli[0], 2.3, cli[2]], [replicas[0][0] - 0.6, 2.3, replicas[0][2] + 0.5]];

  return (
    <Stage theme={theme} animating={litEdges.size > 0 && !reducedMotion} zoom={56} target={[0, 1, 0]}>
      <FloorGrid size={14} color={p.dim} />

      <WireBox at={cli} size={[1.3, 0.7, 0.9]} color={n('cli')} fill={p.fill} />
      <Label at={[cli[0], cli[1] + 0.75, cli[2]]} text="M8S CLI" state={tone('cli', litNodes)} />

      {/* Control-plane replicas: API server and scheduler loop in one binary */}
      {replicas.map((r, i) => {
        const isLeader = i === leader;
        const down = standbyDown && i === 0;
        const api = down ? p.dim : n('api');
        const sched = down ? p.dim : isLeader ? n('scheduler') : p.dim;
        return (
          <group key={i}>
            <WireBox at={[r[0], r[1] - 0.45, r[2]]} size={[2.1, 0.12, 1.5]} color={down ? p.dim : p.line} fill={p.fill} dashed />
            <WireBox at={[r[0] - 0.5, r[1], r[2] + 0.25]} size={[0.9, 0.6, 0.8]} color={api} fill={p.fill} />
            <WireBox at={[r[0] + 0.5, r[1], r[2] - 0.25]} size={[0.9, 0.6, 0.8]} color={sched} fill={p.fill} dashed={!isLeader} />
            <Label
              at={[r[0], r[1] + 0.85, r[2]]}
              text={down ? 'REPLICA DOWN' : isLeader ? 'REPLICA, HOLDS LEASE' : 'REPLICA, STANDBY'}
              state={down ? 'dim' : tone(isLeader ? 'scheduler' : 'api', litNodes)}
            />
          </group>
        );
      })}
      <mesh position={[leaderPos[0] + 0.5, leaderPos[1] + 0.5, leaderPos[2] - 0.25]} rotation={[0, Math.PI / 4, 0]}>
        <octahedronGeometry args={[0.13]} />
        <meshBasicMaterial color={p.rev} />
      </mesh>

      <WireDrum at={store} radius={0.75} height={0.9} color={n('store')} fill={p.fill} />
      <Label at={[store[0], store[1] - 0.8, store[2] + 0.4]} text="POSTGRESQL (STATE, LEASE)" state={tone('store', litNodes)} />

      <WireBox at={metrics} size={[1.4, 0.7, 0.8]} color={n('metrics')} fill={p.fill} dashed />
      <Label at={[metrics[0], metrics[1] + 0.7, metrics[2]]} text="PROMETHEUS, GRAFANA" state={tone('metrics', litNodes)} />

      {/* Worker rack, containers stacked on each worker */}
      {Array.from({ length: WORKERS }, (_, i) => {
        const at = workerAt(i);
        const down = failing && i === FAILED;
        const count = containers[i];
        return (
          <group key={i}>
            <WireBox at={at} size={[0.95, 0.5, 1]} color={workerColor(i)} fill={p.fill} dashed={down && stepId !== 'silence'} />
            {Array.from({ length: Math.max(0, count) }, (_, k) => (
              <WireBox
                key={k}
                at={[at[0] - 0.28 + k * 0.28, at[1] + 0.42, at[2]]}
                size={[0.22, 0.32, 0.5]}
                color={down ? p.dim : n('docker')}
                fill={p.fill}
              />
            ))}
          </group>
        );
      })}
      <Label at={[2.9, -0.1, 3.4]} text="WORKER AGENTS AND THEIR CONTAINERS" state={tone('workers', litNodes)} />
      {failing && <Label at={[workerAt(FAILED)[0], 1.25, workerAt(FAILED)[2]]} text={stepId === 'silence' ? 'NO HEARTBEAT' : 'DOWN'} state="lit" />}

      {/* Connections */}
      <Link points={submitPath} color={e('submit')} />
      <Link points={[[replicas[0][0] - 0.5, 1.9, replicas[0][2] + 0.25], [store[0] - 0.3, 1, store[2]]]} color={e('state')} />
      <Link points={[[leaderPos[0] + 0.5, 1.9, leaderPos[2] - 0.25], [store[0] + 0.3, 1, store[2]]]} color={e('schedule')} />
      <Link points={syncPath} color={e('sync')} />
      <Link points={[metrics, [leaderPos[0] - 0.5, 2.3, metrics[2]], [leaderPos[0] - 0.5, 2.3, leaderPos[2] + 0.25]]} color={e('scrape')} dashed />

      {on('submit') && <Pulse points={submitPath} color={p.rev} />}
      {on('sync') && <Pulse points={syncPath} color={p.rev} />}
      {on('sync') && <Pulse points={[...syncPath].reverse()} color={p.rev} offset={0.5} />}
      {on('schedule') && (
        <Pulse points={[[leaderPos[0] + 0.5, 1.9, leaderPos[2] - 0.25], [store[0] + 0.3, 1, store[2]]]} color={p.rev} speed={0.9} />
      )}
      {on('state') && <Pulse points={[[replicas[0][0] - 0.5, 1.9, replicas[0][2] + 0.25], [store[0] - 0.3, 1, store[2]]]} color={p.rev} speed={0.9} />}
    </Stage>
  );
}
