/** A small authored icon set, drawn on one 16px grid with one stroke weight. */
const PATHS = {
  download: 'M8 2.5v8 M4.5 7 8 10.5 11.5 7 M3 13.5h10',
  mail: 'M2.5 4h11v8h-11z M2.5 4.5 8 9l5.5-4.5',
  cube: 'M8 1.8 13.5 5v6L8 14.2 2.5 11V5z M2.5 5 8 8.2 13.5 5 M8 8.2v6',
  drawing: 'M2.5 2.5h11v11h-11z M5 11V6.5h3.5 M8.5 6.5 11 9',
  prev: 'M10 3.5 5.5 8 10 12.5',
  next: 'M6 3.5 10.5 8 6 12.5',
  reset: 'M3.5 8a4.5 4.5 0 1 0 1.3-3.2 M3.5 2.8v2.4h2.4',
  sun: 'M8 5.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z M8 1.5v1.6 M8 12.9v1.6 M1.5 8h1.6 M12.9 8h1.6 M3.4 3.4l1.1 1.1 M11.5 11.5l1.1 1.1 M3.4 12.6l1.1-1.1 M11.5 4.5l1.1-1.1',
  moon: 'M12.8 10.2A5.4 5.4 0 0 1 5.8 3.2 5.4 5.4 0 1 0 12.8 10.2z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg className="a-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
