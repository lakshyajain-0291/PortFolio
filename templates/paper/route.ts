import { useCallback, useEffect, useState } from 'react';

/**
 * Paper has two kinds of page: the portfolio and one case study per project,
 * at ?project=<slug>. Navigation uses the History API so the back button,
 * shared links and a refresh all land on the same page. Other query
 * parameters (such as ?template=paper) are kept.
 */
export type Navigate = (e: React.MouseEvent<HTMLAnchorElement> | null, slug: string | null) => void;

const read = () => new URLSearchParams(window.location.search).get('project');

export function projectHref(slug: string | null): string {
  const params = new URLSearchParams(window.location.search);
  if (slug) params.set('project', slug);
  else params.delete('project');
  const q = params.toString();
  return `${window.location.pathname}${q ? `?${q}` : ''}`;
}

export function useProjectRoute() {
  const [project, setProject] = useState<string | null>(read);
  // Where the reader was on the portfolio, so Back returns them to the same entry.
  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    const onPop = () => setProject(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate: Navigate = useCallback((e, slug) => {
    // Let modified clicks open a new tab as usual.
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return;
    e?.preventDefault();
    if (slug) setReturnTo(`w-${slug}`);
    window.history.pushState(null, '', projectHref(slug));
    setProject(slug);
  }, []);

  useEffect(() => {
    if (project) {
      window.scrollTo(0, 0);
      return;
    }
    if (returnTo) {
      requestAnimationFrame(() => document.getElementById(returnTo)?.scrollIntoView({ block: 'center' }));
    }
  }, [project, returnTo]);

  return { project, navigate };
}
