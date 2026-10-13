#!/usr/bin/env node
/**
 * Bundle isolation check. Builds once into a temporary directory with a manifest
 * and hidden sourcemaps, then walks each template's static import graph and
 * reports which heavy packages its initial load pulls in.
 *
 *   node scripts/qa/check-bundle.mjs
 *
 * Fails (exit 1) when the Atlas or Paper initial graph contains three.js, R3F,
 * drei, GSAP, Lenis or Framer Motion. The shared 3D scenes must stay in lazy chunks.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const HEAVY = ['three', '@react-three/fiber', '@react-three/drei', 'gsap', 'lenis', 'framer-motion'];
const ENTRIES = {
  atlas: 'templates/atlas/App.tsx',
  paper: 'templates/paper/App.tsx',
};
const LAZY_3D = ['shared/three/scenes/libr.tsx', 'shared/three/scenes/miniK8ts.tsx', 'shared/three/scenes/fileNest.tsx'];

const out = mkdtempSync(join(tmpdir(), 'bundle-check-'));
execFileSync('npx', ['vite', 'build', '--manifest', '--sourcemap', 'hidden', '--outDir', out, '--emptyOutDir'], { stdio: 'ignore' });
const manifest = JSON.parse(readFileSync(join(out, '.vite', 'manifest.json'), 'utf8'));

/** Packages bundled into one chunk, from its sourcemap. */
function packagesIn(file) {
  const map = join(out, `${file}.map`);
  if (!existsSync(map)) return new Set();
  const { sources } = JSON.parse(readFileSync(map, 'utf8'));
  const found = new Set();
  for (const s of sources) {
    const m = s.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    if (m && HEAVY.includes(m[1])) found.add(m[1]);
  }
  return found;
}

/** Static closure: the chunk and everything it imports eagerly. */
function staticGraph(key, seen = new Set()) {
  if (seen.has(key) || !manifest[key]) return seen;
  seen.add(key);
  for (const dep of manifest[key].imports ?? []) staticGraph(dep, seen);
  return seen;
}

let failed = false;
for (const [name, entry] of Object.entries(ENTRIES)) {
  const graph = staticGraph(entry);
  const heavy = new Set();
  let bytes = 0;
  for (const key of graph) {
    const file = manifest[key].file;
    bytes += readFileSync(join(out, file)).length;
    packagesIn(file).forEach((p) => heavy.add(p));
  }
  const ok = heavy.size === 0;
  failed ||= !ok;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: ${graph.size} chunks, ${(bytes / 1024).toFixed(1)} kB initial JS${ok ? '' : `, contains ${[...heavy].join(', ')}`}`);
}

for (const scene of LAZY_3D) {
  const isDynamic = Object.values(manifest).some((c) => (c.dynamicImports ?? []).includes(scene));
  const heavy = new Set();
  for (const key of staticGraph(scene)) packagesIn(manifest[key].file).forEach((p) => heavy.add(p));
  failed ||= !isDynamic;
  console.log(`${isDynamic ? 'PASS' : 'FAIL'} ${scene}: lazy=${isDynamic}, loads ${[...heavy].join(', ') || 'nothing heavy'}`);
}

process.exit(failed ? 1 : 0);
