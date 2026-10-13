import React from 'react';
import type { PortfolioData } from '../../src/lib/portfolioStorage';

/**
 * Terminal utility functions for formatting terminal output.
 */

const DEFAULT_RESUME_PATH = '/resume/resume.pdf';

/** Absolute URL for a site path, so it prints as a clickable link. */
export function absoluteUrl(path: string): string {
  if (typeof window === 'undefined' || /^[a-z]+:/i.test(path)) return path;
  return new URL(path, window.location.origin).href;
}

/** The resume URL from the data, falling back to the bundled PDF. */
export function resumeUrlOf(portfolio: PortfolioData | null | undefined): string {
  return absoluteUrl(portfolio?.resumeUrl || DEFAULT_RESUME_PATH);
}

/** Main site (Systems Paper edition). */
export function mainSiteHref(): string {
  return typeof window === 'undefined' ? '?template=paper' : `${window.location.pathname}?template=paper`;
}

// http(s) URLs, explicit mailto: links, and bare email addresses.
const LINK_PATTERN = /(https?:\/\/[^\s]+|mailto:[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,})/g;
// Sentence punctuation that follows a link rather than belonging to it.
const TRAILING = /[.,;:!?)\]'"]+$/;

/**
 * Splits text into strings and clickable links (URLs and email addresses).
 * Line breaks are kept as <br> elements.
 */
export function parseTextForLinks(text: string): (string | JSX.Element)[] {
  if (!text) return [];
  const result: (string | JSX.Element)[] = [];

  text.split('\n').forEach((line, lineIndex) => {
    if (lineIndex > 0) result.push(React.createElement('br', { key: `br-${lineIndex}` }));
    if (!line) return;

    let last = 0;
    for (const match of line.matchAll(LINK_PATTERN)) {
      const start = match.index ?? 0;
      const raw = match[0];
      const label = raw.replace(TRAILING, '');
      if (start > last) result.push(line.slice(last, start));

      const isWeb = /^https?:\/\//i.test(label);
      const href = isWeb || label.startsWith('mailto:') ? label : `mailto:${label}`;
      result.push(
        React.createElement(
          'a',
          {
            key: `link-${lineIndex}-${start}`,
            href,
            className: 'terminal-link',
            ...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
          },
          label.replace(/^mailto:/, ''),
        ),
      );
      last = start + label.length;
    }
    if (last < line.length) result.push(line.slice(last));
  });

  return result;
}
