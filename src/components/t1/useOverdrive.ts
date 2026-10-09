import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { sceneState } from './sceneStore';

const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const DURATION_MS = 9000;

/**
 * Hidden state: the Konami code swaps the signal accent to hot pink — the only
 * place the old cyber-pink survives — across the UI and the 3D scene.
 */
export function useOverdrive() {
  useEffect(() => {
    let index = 0;
    let timer = 0;

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      index = key === SEQUENCE[index] ? index + 1 : key === SEQUENCE[0] ? 1 : 0;
      if (index < SEQUENCE.length) return;
      index = 0;

      document.documentElement.dataset.overdrive = 'on';
      sceneState.overdrive = true;
      toast({ title: '// overdrive engaged', description: 'Signal rerouted. Normal service resumes shortly.' });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        delete document.documentElement.dataset.overdrive;
        sceneState.overdrive = false;
      }, DURATION_MS);
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer);
    };
  }, []);
}
