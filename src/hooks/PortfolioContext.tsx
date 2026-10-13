import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadPortfolio, type PortfolioData } from '../lib/portfolioStorage';

interface PortfolioContextType {
  portfolio: PortfolioData | null;
  isLoading: boolean;
  error: string | null;
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

/** Loads public/data/portfolio.json once for the older editions. */
export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPortfolio()
      .then((data) => !cancelled && setPortfolio(data))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load portfolio data.'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PortfolioContext.Provider value={{ portfolio, isLoading: !portfolio && !error, error }}>{children}</PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) throw new Error('usePortfolio must be used within a PortfolioProvider');
  return context;
};
