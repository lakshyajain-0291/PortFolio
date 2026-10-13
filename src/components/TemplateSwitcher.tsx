import React from 'react';
import { TEMPLATE_CONFIG, TEMPLATE_IDS, type TemplateId } from '@/config/env';

const LABELS: Record<string, string> = {
  '0': 'Dark tech, centred',
  '1': 'Dark tech',
  '2': 'Editorial',
  '3': 'Terminal',
  atlas: 'Engineering Atlas',
  paper: 'Systems Paper',
};

const hrefFor = (id: TemplateId) => {
  if (typeof window === 'undefined') return `?template=${id}`;
  const url = new URL(window.location.href);
  url.searchParams.set('template', String(id));
  return `${url.pathname}${url.search}${url.hash}`;
};

interface TemplateSwitcherProps {
  /** "floating" pins it to the bottom-right corner; "inline" sits in page flow (e.g. a footer). */
  variant?: 'floating' | 'inline';
  className?: string;
}

/** Plain links: keyboard, middle-click and "copy link" all work without JS. */
const TemplateSwitcher: React.FC<TemplateSwitcherProps> = ({ variant = 'floating', className = '' }) => {
  const current = TEMPLATE_CONFIG.TEMPLATE_NUMBER;
  const inline = variant === 'inline';

  return (
    <nav
      aria-label="Portfolio templates"
      className={`${
        inline
          ? 'flex items-center gap-1'
          : 'fixed bottom-1 right-1 z-50 opacity-30 transition-opacity duration-300 hover:opacity-90 focus-within:opacity-100'
      } ${className}`}
    >
      {inline && <span className="mr-1 text-sm text-current opacity-70">Templates</span>}
      <ul className="flex">
        {TEMPLATE_IDS.map((id) => {
          const active = current === id;
          const label = `Template: ${LABELS[String(id)]}`;
          return (
            <li key={id}>
              <a
                href={hrefFor(id)}
                aria-label={label}
                title={label}
                aria-current={active ? 'page' : undefined}
                className={`group grid place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-current ${
                  inline ? 'h-11 w-11' : 'h-6 w-6'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 w-2 rounded-full transition-transform duration-200 group-hover:scale-125 ${
                    active ? 'bg-primary ring-2 ring-primary/30' : 'bg-gray-400/50'
                  }`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TemplateSwitcher;
