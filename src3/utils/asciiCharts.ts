/**
 * Tiny ASCII/Unicode charting helpers for the terminal template.
 * Pure string functions — rendered through the terminal's normal output lines.
 */

const EIGHTHS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
const SPARK = ['▂', '▃', '▄', '▅', '▆', '▇', '█'];

/** Horizontal bar with 1/8-character resolution, padded to `width` with a track. */
export function bar(value: number, max: number, width: number, track = '.'): string {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const eighths = Math.round(ratio * width * 8);
  const full = Math.floor(eighths / 8);
  const partial = EIGHTHS[eighths % 8];
  const used = full + (partial ? 1 : 0);
  return '█'.repeat(full) + partial + track.repeat(Math.max(0, width - used));
}

/** One character per value; zero days render as a dot so time still reads. */
export function sparkline(values: number[]): string {
  const max = Math.max(0, ...values);
  return values
    .map((v) => (v <= 0 || max === 0 ? '.' : SPARK[Math.min(SPARK.length - 1, Math.ceil((v / max) * SPARK.length) - 1)]))
    .join('');
}

/** Sums consecutive values into `buckets` groups (e.g. days → weeks) to fit narrow screens. */
export function bucket(values: number[], buckets: number): number[] {
  if (values.length <= buckets) return values;
  const size = Math.ceil(values.length / buckets);
  const out: number[] = [];
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size).reduce((a, b) => a + b, 0));
  return out;
}

/** Section heading: "  TITLE ─────────" filled to `width`. */
export function heading(title: string, width: number): string {
  const label = `  ${title.toUpperCase()} `;
  return label + '─'.repeat(Math.max(3, width - label.length));
}

export const padEnd = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s.padEnd(n));
export const padStart = (s: string, n: number) => s.padStart(n);

/** Usable character columns for the current viewport (monospace ~9px/char at 15px). */
export function terminalColumns(): number {
  if (typeof window === 'undefined') return 72;
  return Math.max(36, Math.min(96, Math.floor((window.innerWidth - 40) / 9.2)));
}
