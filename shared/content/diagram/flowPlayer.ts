import { useCallback, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

export interface FlowPlayer<T extends HTMLElement> {
  /** Attach to the element that holds the figure and its controls. */
  ref: React.RefObject<T>;
  index: number;
  /** True while steps are advancing on their own. */
  running: boolean;
  /** The visitor's choice: false after Pause, true after Play. */
  playing: boolean;
  setPlaying: (on: boolean) => void;
  jump: (i: number) => void;
  /** Spread on the container: hovering or focusing inside holds the current step. */
  holdProps: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: (e: React.FocusEvent) => void;
  };
}

/**
 * Plays a flow's steps in a loop, one step every `interval` ms. It holds while
 * the pointer or focus is inside, pauses off screen and in background tabs,
 * and never starts on its own when the visitor prefers reduced motion.
 */
export function useFlowPlayer<T extends HTMLElement>(count: number, interval = 3600): FlowPlayer<T> {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<T>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const [visible, setVisible] = useState(false);
  const [held, setHeld] = useState(false);
  const [tabVisible, setTabVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => setIndex((i) => (i < count ? i : 0)), [count]);

  const running = playing && visible && !held && tabVisible && count > 1;
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % count), interval);
    return () => window.clearTimeout(t);
  }, [running, index, count, interval]);

  const jump = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  return {
    ref,
    index,
    running,
    playing,
    setPlaying,
    jump,
    holdProps: {
      onPointerEnter: () => setHeld(true),
      onPointerLeave: () => setHeld(false),
      onFocus: () => setHeld(true),
      onBlur: (e) => {
        if (!ref.current?.contains(e.relatedTarget as Node | null)) setHeld(false);
      },
    },
  };
}
