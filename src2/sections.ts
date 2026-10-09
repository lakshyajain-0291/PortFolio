import { useEffect, useState } from 'react';
import { SECTION_NUMBERS } from '../src/config/env';

type SectionKey = Exclude<keyof typeof SECTION_NUMBERS, 'HERO' | 'INSIGHTS'>;

/** Reading-column sections, ordered by SECTION_NUMBERS (the hero is the sticky aside). */
export const T2_SECTIONS = (
  [
    { key: 'EXPERIENCE', id: 'experience', label: 'Experience' },
    { key: 'PROJECTS', id: 'projects', label: 'Projects' },
    { key: 'GITHUB_STATS', id: 'github-stats', label: 'GitHub' },
    { key: 'TECH_STACK', id: 'tech-stack', label: 'Stack' },
    { key: 'EDUCATION', id: 'education', label: 'Education' },
    { key: 'CONTACT', id: 'contact', label: 'Contact' },
  ] as Array<{ key: SectionKey; id: string; label: string }>
)
  .map((s) => ({ ...s, order: SECTION_NUMBERS[s.key] }))
  .sort((a, b) => a.order - b.order);

export const NAV_ITEMS = [{ id: 'about', label: 'About' }, ...T2_SECTIONS];

/** Id of the section currently crossing the upper third of the viewport. */
export function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);
  const key = ids.join('|');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-30% 0px -65% 0px' },
    );
    const attach = () => {
      observer.disconnect();
      key.split('|').forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    };
    attach();
    const t = window.setTimeout(attach, 1000); // sections re-mount once data arrives
    return () => {
      window.clearTimeout(t);
      observer.disconnect();
    };
  }, [key]);

  return active;
}
