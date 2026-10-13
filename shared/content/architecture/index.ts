import { LIBR } from './libr';
import { MINI_K8TS } from './miniK8ts';
import { FILENEST } from './fileNest';
import type { ArchitectureSpec } from './types';

/**
 * Diagram specs, one file per system. Each is drafted from its sources and then
 * confirmed with the owner in its own session (plan, Phase 2) before
 * `confirmed: true` lets it render in production.
 */
export const DIAGRAMS: ArchitectureSpec[] = [LIBR, MINI_K8TS, FILENEST];
