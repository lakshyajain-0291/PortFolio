import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { ArchitectureSpec } from '../architecture/types';
import { neighbourhood } from './layout';

/** Content-box width of an element, tracked with ResizeObserver (0 until measured). */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(el.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/**
 * Selection shared by a diagram's SVG and its text list. The list is the
 * keyboard surface: one tab stop, arrow keys move and select, Escape clears.
 * The SVG mirrors the selection and accepts pointer selection.
 */
export function useDiagramSelection(spec: ArchitectureSpec) {
  const [selected, setSelected] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const ids = useMemo(() => [...spec.nodes].sort((a, b) => a.tier - b.tier || a.lane - b.lane).map((n) => n.id), [spec]);
  const lit = useMemo(() => neighbourhood(spec, selected), [spec, selected]);

  const select = useCallback(
    (id: string | null) => {
      setSelected((cur) => (cur === id ? null : id));
      if (id) setFocusIndex(Math.max(0, ids.indexOf(id)));
    },
    [ids],
  );

  const move = (index: number) => {
    const i = (index + ids.length) % ids.length;
    setFocusIndex(i);
    setSelected(ids[i]);
    itemRefs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(focusIndex + 1),
      ArrowRight: () => move(focusIndex + 1),
      ArrowUp: () => move(focusIndex - 1),
      ArrowLeft: () => move(focusIndex - 1),
      Home: () => move(0),
      End: () => move(ids.length - 1),
      Escape: () => setSelected(null),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  };

  const itemProps = (id: string) => {
    const i = ids.indexOf(id);
    return {
      ref: (el: HTMLElement | null) => {
        itemRefs.current[i] = el;
      },
      tabIndex: i === focusIndex ? 0 : -1,
      'aria-pressed': selected === id,
      onClick: () => select(id),
      onKeyDown,
      onFocus: () => setFocusIndex(i),
    };
  };

  return { ids, selected, select, lit, itemProps };
}
