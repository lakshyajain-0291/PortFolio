import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { sceneState } from './sceneStore';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';

/**
 * Lenis smooth scrolling driven by GSAP's ticker, so ScrollTrigger and Lenis
 * share one clock. Also publishes overall page progress to the 3D scene.
 * Skipped entirely under prefers-reduced-motion (native scrolling remains).
 */
const SmoothScroll = () => {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const progress = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        sceneState.scroll = self.progress;
      },
    });

    if (reduced) return () => progress.kill();

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      anchors: { offset: -72 },
      autoRaf: false,
    });
    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Radix dialogs lock body scroll via [data-scroll-locked]; pause Lenis with them.
    const observer = new MutationObserver(() => {
      if (document.body.hasAttribute('data-scroll-locked')) lenis.stop();
      else lenis.start();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });

    return () => {
      observer.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      progress.kill();
    };
  }, [reduced]);

  return null;
};

export default SmoothScroll;
