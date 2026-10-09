/**
 * Date-range helpers shared by all templates. Resume data stores ranges as free
 * text ("May 2026 - Jul 2026", "2023-2027", "Mar 2025 - Present").
 */

export interface DateRange {
  start: string;
  end: string;
  isCurrent: boolean;
}

export function splitDateRange(range?: string | null): DateRange {
  if (!range || !range.trim()) return { start: '', end: '', isCurrent: false };
  // Split on a hyphen / en dash / em dash / "to" that separates two parts.
  const parts = range.split(/\s*(?:–|—|-|\bto\b)\s*/i).filter(Boolean);
  const start = (parts[0] ?? '').trim();
  const end = (parts[1] ?? '').trim() || 'Present';
  return { start, end, isCurrent: /present|current|now/i.test(end) };
}

/** "May 2026 – Jul 2026" with a proper en dash. */
export function formatDateRange(range?: string | null): string {
  const { start, end } = splitDateRange(range);
  if (!start) return '';
  return `${start} – ${end}`;
}
