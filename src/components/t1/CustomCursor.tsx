import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="menuitem"], summary, label, select, [data-cursor], [data-template]';
const TEXT_INPUT =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';

type CursorState = 'default' | 'link' | 'text';

/**
 * A small dot that tracks the pointer exactly plus a ring that trails it. The
 * ring grows over interactive targets and narrows to a caret over text inputs,
 * so the native cursor can be hidden everywhere. Fine pointers only.
 */
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  );

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!enabled || !dot || !ring) return;

    const html = document.documentElement;
    html.classList.add('t1-cursor');

    const snap = prefersReducedMotion();
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let state: CursorState = 'default';

    const follow = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(follow) : 0;
    };

    const setVisible = (visible: boolean) => {
      dot.classList.toggle('t1-cursor-hidden', !visible);
      ring.classList.toggle('t1-cursor-hidden', !visible);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (snap) {
        rx = x;
        ry = y;
        ring.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      } else if (!raf) {
        raf = requestAnimationFrame(follow);
      }
      setVisible(true);

      const target = e.target instanceof Element ? e.target : null;
      const next: CursorState = target?.closest(TEXT_INPUT) ? 'text' : target?.closest(INTERACTIVE) ? 'link' : 'default';
      if (next !== state) {
        state = next;
        dot.dataset.state = next;
        ring.dataset.state = next;
      }
    };

    const onDown = () => (ring.dataset.pressed = 'true');
    const onUp = () => (ring.dataset.pressed = 'false');
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseout', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('t1-cursor');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseout', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="t1-cursor-ring t1-cursor-hidden" aria-hidden="true" />
      <div ref={dotRef} className="t1-cursor-dot t1-cursor-hidden" aria-hidden="true" />
    </>
  );
};

export default CustomCursor;
