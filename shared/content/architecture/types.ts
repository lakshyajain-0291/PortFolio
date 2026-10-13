/**
 * A system diagram as data. Both templates render the same spec: Atlas as
 * blueprint linework, Paper as a numbered figure. Layout is a tier/lane grid so
 * one spec yields a wide (tiers as columns) and a narrow (tiers as rows) drawing.
 * Every node and edge names the source that supports it.
 */

export type ArchNodeKind = 'client' | 'service' | 'worker' | 'store' | 'queue' | 'external' | 'cluster';

export interface ArchNode {
  id: string;
  label: string;
  kind: ArchNodeKind;
  /** Grid column in the wide layout (row in the narrow one). */
  tier: number;
  /** Position within the tier. */
  lane: number;
  description: string;
  /** Shown as built, or drawn as planned / design-only. */
  status?: 'built' | 'planned' | 'design';
  group?: string;
  source: string;
}

export interface ArchEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  protocol?: string;
  /** Dashed when false (async, periodic or best-effort). */
  sync?: boolean;
  source: string;
}

export interface ArchGroup {
  id: string;
  label: string;
}

/** One step of a narrated flow: which nodes and edges are active, and what happens. */
export interface FlowStep {
  id: string;
  title: string;
  text: string;
  nodes: string[];
  edges: string[];
}

export interface ArchFlow {
  id: string;
  title: string;
  steps: FlowStep[];
}

export interface ArchitectureSpec {
  id: string;
  title: string;
  caption: string;
  groups: ArchGroup[];
  nodes: ArchNode[];
  edges: ArchEdge[];
  flows: ArchFlow[];
  sources: string[];
  /** Set only after the owner has confirmed the spec in a review session. */
  confirmed: boolean;
}
