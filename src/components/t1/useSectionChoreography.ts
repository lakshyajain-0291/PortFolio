import { useLayoutEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger } from './gsap';

/**
 * Scroll-scrubbed counters for the GitHub section, the one section that moves
 * with the scroll (alongside its camera dolly; the hero runs its own intro).
 * Nothing is hidden: every section is visible markup, so the page prints and
 * is findable with Ctrl+F.
 *
 *   data-count="123"        number counted up as the element scrolls in
 *
 * With prefers-reduced-motion nothing is animated.
 */
export function useSectionChoreography(ref: RefObject<HTMLElement>, ready = true, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !ready) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const counted: Array<[HTMLElement, string]> = [];
        root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const target = Number(el.dataset.count);
          if (!Number.isFinite(target) || target <= 0) return;
          counted.push([el, el.textContent ?? '']);
          const suffix = el.dataset.countSuffix ?? '';
          const counter = { value: 0 };
          gsap.to(counter, {
            value: target,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 55%', scrub: 0.4 },
            onUpdate: () => {
              el.textContent = `${Math.round(counter.value).toLocaleString()}${suffix}`;
            },
          });
        });

        // Counters write text directly; hand the final value back to React on revert.
        return () => counted.forEach(([el, text]) => (el.textContent = text));
      });
    }, root);

    // Layout may have shifted (data arrived, fonts swapped) — re-measure.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(id);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ...deps]);
}
