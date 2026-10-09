import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { useGitHubDataset } from '../../../shared/github/useGitHubDataset';
import { usePrefersReducedMotion } from '../../../shared/hooks/usePrefersReducedMotion';
import { SECTION_NUMBERS } from '@/config/env';
import { sceneState } from './sceneStore';
import PosterColumns from './PosterColumns';

// three.js + R3F + postprocessing live in their own chunk, fetched only here.
const RepoScene = lazy(() => import('./RepoScene'));

/** Sections the scene is visible behind; elsewhere it pauses and fades to the poster. */
const STAGE_IDS = ['home', 'github-stats'];

const sideNumber = (n: number) => (n === 0 ? 0 : n % 2 === 0 ? 1 : -1);

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function isLowEndDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return (
    (nav.hardwareConcurrency ?? 8) <= 2 ||
    (nav.deviceMemory ?? 8) <= 2 ||
    nav.connection?.saveData === true
  );
}

class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Fixed full-viewport stage behind Template 1. Always paints a static poster
 * (gradient + grid); layers the live WebGL scene on top only when the device
 * supports it, motion is allowed, and the hero or GitHub section is on screen.
 */
const SceneBackdrop = () => {
  const { dataset } = useGitHubDataset();
  const reduced = usePrefersReducedMotion();
  const [capable] = useState(() => canUseWebGL() && !isLowEndDevice());
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [onStage, setOnStage] = useState(true);
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState !== 'hidden');

  const enabled = capable && !reduced && !failed && dataset.repos.length > 0;

  // Defer the heavy chunk until the main thread is idle after first paint.
  useEffect(() => {
    if (!enabled || mounted) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setMounted(true), { timeout: 1500 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setMounted(true), 300);
    return () => window.clearTimeout(id);
  }, [enabled, mounted]);

  // Pause the render loop whenever neither stage section intersects the viewport.
  useEffect(() => {
    if (!enabled) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
        setOnStage(visible.size > 0);
      },
      // Only count a section as on stage once it fills the middle of the viewport.
      { rootMargin: '-25% 0px -25% 0px' },
    );
    const observeAll = () => {
      observer.disconnect();
      STAGE_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    };
    observeAll();
    // Sections swap their loading placeholders for real content once data arrives.
    const t = window.setTimeout(observeAll, 1200);
    return () => {
      window.clearTimeout(t);
      observer.disconnect();
    };
  }, [enabled, dataset.repos.length]);

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState !== 'hidden');
    const onPointer = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  const active = onStage && tabVisible;

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="t1-poster" />
      {/* Static rendering of the same data when the live scene isn't running */}
      {!enabled && dataset.repos.length > 0 && <PosterColumns repos={dataset.repos} />}
      {enabled && mounted && (
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: active ? (window.innerWidth < 768 ? 0.45 : 1) : 0, maskImage: 'radial-gradient(95% 85% at 50% 45%, #000 60%, transparent 100%)' }}
        >
          <SceneErrorBoundary onError={() => setFailed(true)}>
            <Suspense fallback={null}>
              <RepoScene
                repos={dataset.repos}
                active={active}
                heroSide={sideNumber(SECTION_NUMBERS.HERO)}
                statsSide={sideNumber(SECTION_NUMBERS.GITHUB_STATS)}
                onFallback={() => setFailed(true)}
              />
            </Suspense>
          </SceneErrorBoundary>
        </div>
      )}
      <div className="t1-vignette" />
    </div>
  );
};

export default SceneBackdrop;
