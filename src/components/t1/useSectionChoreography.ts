import { useLayoutEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger, SplitText } from './gsap';

/**
 * Scroll-scrubbed choreography for a Template 1 section. Markup opts in with
 * data attributes, so components stay declarative:
 *
 *   data-split              heading split into words/chars that rise through a mask
 *   data-reveal-group       container whose [data-reveal] children stagger in
 *   data-reveal="up|left|right"   direction of travel (default up)
 *   data-draw="x|y"         rule/line drawn by scroll (scaleX / scaleY)
 *   data-count="123"        number counted up as the element scrolls in
 *
 * Every tween is tied to scroll position (scrub), so reveals run forward and
 * backward with the reader instead of firing once. Elements are fully visible
 * by default — with prefers-reduced-motion nothing is hidden or animated.
 */
export function useSectionChoreography(ref: RefObject<HTMLElement>, ready = true, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !ready) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Section-number watermark drifts slower than the content.
        if (root.matches('section[data-section-number]')) {
          gsap.fromTo(
            root,
            { '--wm-shift': '-4rem' },
            {
              '--wm-shift': '6rem',
              ease: 'none',
              scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        }

        root.querySelectorAll<HTMLElement>('[data-split]').forEach((heading) => {
          const split = SplitText.create(heading, { type: 'words,chars', mask: 'words' });
          gsap.from(split.chars, {
            yPercent: 105,
            ease: 'none',
            stagger: { each: 0.025, from: 'start' },
            scrollTrigger: { trigger: heading, start: 'top 92%', end: 'top 62%', scrub: 0.5 },
          });
        });

        root.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
          const items = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
            (el) => el.closest('[data-reveal-group]') === group,
          );
          if (!items.length) return;
          const tl = gsap.timeline({
            scrollTrigger: { trigger: group, start: 'top 88%', end: 'top 40%', scrub: 0.8 },
          });
          items.forEach((item, i) => {
            const dir = item.dataset.reveal;
            tl.from(
              item,
              {
                x: dir === 'left' ? -56 : dir === 'right' ? 56 : 0,
                y: dir === 'left' || dir === 'right' ? 0 : 40,
                autoAlpha: 0,
                ease: 'power2.out',
                duration: 1,
              },
              i * 0.18,
            );
          });
        });

        root.querySelectorAll<HTMLElement>('[data-draw]').forEach((line) => {
          const axis = line.dataset.draw === 'x' ? 'scaleX' : 'scaleY';
          gsap.fromTo(
            line,
            { [axis]: 0 },
            {
              [axis]: 1,
              ease: 'none',
              transformOrigin: axis === 'scaleX' ? 'left center' : 'center top',
              scrollTrigger: { trigger: line, start: 'top 80%', end: 'bottom 55%', scrub: true },
            },
          );
        });

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
