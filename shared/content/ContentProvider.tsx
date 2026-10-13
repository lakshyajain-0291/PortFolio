import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildContent } from './build';
import { loadPortfolioJson } from './loadRaw';
import type { PortfolioJson } from './schema';
import type { PortfolioContent } from './types';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; content: PortfolioContent };

const ContentContext = createContext<State>({ status: 'loading' });

export function ContentProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<PortfolioJson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    loadPortfolioJson(ctrl.signal)
      .then(setRaw)
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load portfolio data.');
      });
    return () => ctrl.abort();
  }, []);

  const state = useMemo<State>(() => {
    if (error) return { status: 'error', message: error };
    if (!raw) return { status: 'loading' };
    const content = buildContent(raw, { includeUnverified: import.meta.env.DEV });
    if (content.unverified.length) {
      console.info('[content] unverified items (shown in dev, hidden in production):', content.unverified);
    }
    return { status: 'ready', content };
  }, [raw, error]);

  return <ContentContext.Provider value={state}>{children}</ContentContext.Provider>;
}

export const usePortfolioContent = () => useContext(ContentContext);
