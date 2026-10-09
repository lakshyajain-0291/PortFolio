import React, { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../shared/hooks/usePrefersReducedMotion';

interface MatrixEffectProps {
  themeColor?: string;
  /** Tokens (repo names, languages…) that some columns spell out top-to-bottom. */
  words?: string[];
}

// Half-width katakana (as in the film's mirrored glyphs) plus digits and a few
// operators — no Latin noise, so the spelled-out words stand apart.
const GLYPHS = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789:.=*+-<>¦|';

/** Depth layers: far columns are small, dim and slow; near ones large, bright and sparse. */
const LAYERS = [
  { size: 12, speed: 0.55, alpha: 0.35, density: 0.9 },
  { size: 16, speed: 0.8, alpha: 0.65, density: 0.55 },
  { size: 22, speed: 1.15, alpha: 1, density: 0.18 },
];

const STEP_MS = 55; // quantised, terminal-like cadence
const WORD_CHANCE = 0.22;

interface Column {
  x: number;
  y: number; // in rows
  speed: number;
  progress: number;
  layer: (typeof LAYERS)[number];
  word: string | null;
  wordIndex: number;
  last: string;
}

const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

function mixWithWhite(hex: string, amount: number): string {
  const m = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return '#e8ffe8';
  const [r, g, b] = m.slice(1).map((c) => parseInt(c, 16));
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

const MatrixEffect: React.FC<MatrixEffectProps> = ({ themeColor = '#00FF00', words = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wordsKey = words.join('|');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const tokens = wordsKey ? wordsKey.split('|').filter(Boolean) : [];
    const head = mixWithWhite(themeColor, 0.75);
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--terminal-bg').trim() || '#000000';
    const reduced = prefersReducedMotion();

    let width = 0;
    let height = 0;
    let columns: Column[] = [];

    const newWord = () => (tokens.length && Math.random() < WORD_CHANCE ? `${tokens[Math.floor(Math.random() * tokens.length)]}·` : null);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);
      ctx.textBaseline = 'top';

      columns = LAYERS.flatMap((layer) => {
        const count = Math.floor(width / (layer.size * 1.1));
        return Array.from({ length: count }, (_, i) => i)
          .filter(() => Math.random() < layer.density)
          .map((i) => ({
            x: i * layer.size * 1.1,
            y: -Math.random() * (height / layer.size) * 1.5,
            speed: layer.speed * (0.7 + Math.random() * 0.6),
            progress: 0,
            layer,
            word: newWord(),
            wordIndex: 0,
            last: '',
          }));
      });
    };

    const glyphFor = (col: Column) => {
      if (col.word) {
        const ch = col.word[col.wordIndex % col.word.length];
        col.wordIndex += 1;
        return ch;
      }
      return pick(GLYPHS);
    };

    const step = () => {
      // Trail: veil the previous frame rather than clearing it.
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      for (const col of columns) {
        col.progress += col.speed;
        if (col.progress < 1) continue;
        col.progress -= 1;

        const { size, alpha } = col.layer;
        const y = col.y * size;
        ctx.font = `${size}px "JetBrains Mono", "MS Gothic", monospace`;

        // Settle the previous head into body colour (same glyph, so spelled
        // words stay legible in the trail), then draw the new bright head.
        if (col.last && y - size >= 0) {
          ctx.globalAlpha = alpha * 0.85;
          ctx.fillStyle = bg;
          ctx.fillRect(col.x, y - size, size, size);
          ctx.fillStyle = themeColor;
          ctx.fillText(col.last, col.x, y - size);
        }
        col.last = glyphFor(col);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = col.word ? head : mixWithWhite(themeColor, 0.45);
        ctx.fillText(col.last, col.x, y);

        col.y += 1;
        if (y > height && Math.random() > 0.96) {
          col.y = -Math.random() * 12;
          col.word = newWord();
          col.wordIndex = 0;
          col.last = '';
        }
      }
      ctx.globalAlpha = 1;
    };

    resize();

    if (reduced) {
      // A single still frame: sparse glyph columns, no motion.
      for (let i = 0; i < 40; i++) step();
      return;
    }

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      acc += now - last;
      last = now;
      if (acc >= STEP_MS) {
        acc = Math.min(acc - STEP_MS, STEP_MS * 3);
        step();
      }
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (document.visibilityState === 'visible') {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    raf = requestAnimationFrame(loop);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [themeColor, wordsKey]);

  return <canvas ref={canvasRef} className="matrix-effect" aria-hidden="true" />;
};

export default MatrixEffect;
