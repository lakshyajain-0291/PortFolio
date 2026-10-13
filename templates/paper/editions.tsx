import { useEffect, useState } from 'react';

/**
 * The same portfolio is printed in other editions. The colophon names them
 * plainly; two quieter doors also lead there: the Konami code opens the
 * terminal, and the end mark, clicked five times, picks an edition at random.
 */
export const EDITIONS = [
  { id: '0', name: 'Repository City', note: 'dark, with a 3D field of repositories' },
  { id: '2', name: 'Editorial', note: 'a warm magazine layout' },
  { id: '3', name: 'Terminal', note: 'type help to begin' },
  { id: 'atlas', name: 'Blueprint', note: 'the systems as engineering drawings' },
] as const;

export const editionHref = (id: string) => `${window.location.pathname}?template=${id}`;

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

/** Up, up, down, down, left, right, left, right, B, A: off to the terminal. */
export function useKonami() {
  useEffect(() => {
    let at = 0;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      at = key === KONAMI[at] ? at + 1 : key === KONAMI[0] ? 1 : 0;
      if (at === KONAMI.length) window.location.href = editionHref('3');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function Colophon() {
  const [clicks, setClicks] = useState(0);
  const onMark = () => {
    const n = clicks + 1;
    setClicks(n);
    if (n >= 5) {
      const pick = EDITIONS[Math.floor(Math.random() * EDITIONS.length)];
      window.location.href = editionHref(pick.id);
    }
  };

  return (
    <section className="p-colophon" aria-labelledby="colophon-h">
      <h2 id="colophon-h" className="p-h4">
        Colophon
      </h2>
      <p>
        Set in Source Serif 4 and Source Code Pro. Every number on these pages names its kind and its source. Built from one typed content model;
        the same portfolio is also printed in other editions:{' '}
        {EDITIONS.map((e, i) => (
          <span key={e.id}>
            <a href={editionHref(e.id)} title={e.note}>
              {e.name}
            </a>
            {i < EDITIONS.length - 2 ? ', ' : i === EDITIONS.length - 2 ? ' and ' : ''}
          </span>
        ))}
        .{' '}
        <button type="button" className="p-endmark" onClick={onMark} aria-label="End of document">
          ∎
        </button>
      </p>
    </section>
  );
}
