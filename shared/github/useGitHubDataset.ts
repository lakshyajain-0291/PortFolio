import { useMemo } from 'react';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { buildGitHubDataset, type GitHubDataset } from './githubDataset';

/** Reads the portfolio already loaded by PortfolioContext and derives the GitHub dataset. */
export function useGitHubDataset(): { dataset: GitHubDataset; isLoading: boolean } {
  const { portfolio, isLoading } = usePortfolio();
  const dataset = useMemo(() => buildGitHubDataset(portfolio), [portfolio]);
  return { dataset, isLoading };
}
