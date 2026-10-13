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

// ── Name banner ──────────────────────────────────────────────────────────────
// A 5×7 dot-matrix font drawn with half blocks (two pixel rows per text row),
// so pixels come out roughly square in a monospace cell.

const GLYPHS_5X7: Record<string, string[]> = {
  A: ['01110', '10001', '10001', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11100', '10010', '10001', '10001', '10001', '10010', '11100'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '10001', '11001', '10101', '10011', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
};

/** Below this many columns the terminal prints a plain one-line banner instead. */
export const BANNER_MIN_COLS = 72;

/**
 * Block-letter banner for `text`, or null when it has characters the font
 * lacks or would be wider than `cols`.
 */
export function bannerArt(text: string, cols: number): string | null {
  const glyphs = text.toUpperCase().split('').map((ch) => GLYPHS_5X7[ch]);
  if (!glyphs.length || glyphs.some((g) => !g)) return null;
  const rows = Array.from({ length: 8 }, (_, r) => glyphs.map((g) => g[r] ?? '0'.repeat(g[0].length)).join('0'));
  if (rows[0].length > cols) return null;
  const lines: string[] = [];
  for (let r = 0; r < rows.length; r += 2) {
    let line = '';
    for (let c = 0; c < rows[r].length; c++) {
      const top = rows[r][c] === '1';
      const bottom = rows[r + 1][c] === '1';
      line += top && bottom ? '█' : top ? '▀' : bottom ? '▄' : ' ';
    }
    lines.push(line.trimEnd());
  }
  return lines.join('\n');
}
