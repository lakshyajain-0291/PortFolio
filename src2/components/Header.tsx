import React from 'react';
import { ThemeToggle } from './theme-toggle';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { PROFILE } from '../../shared/content/curated/profile';

/**
 * Utility cluster pinned to the top-right corner: résumé and theme.
 * Deliberately small — the page is the typography.
 */
const Header: React.FC = () => {
  const { portfolio } = usePortfolio();
  const resumeUrl = portfolio?.resumeUrl || PROFILE.resumeUrl;

  return (
    <div className="absolute right-4 top-4 z-40 flex items-center gap-1 rounded-[2px] bg-background/80 p-1 backdrop-blur sm:right-6 lg:fixed lg:right-8 lg:top-6">
      <a href={resumeUrl} download className="px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
        résumé
      </a>
      <ThemeToggle />
    </div>
  );
};

export default Header;
