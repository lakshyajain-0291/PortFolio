import { PortfolioData } from './portfolioStorage';

/**
 * Directly reads the portfolio.json file from the data directory
 * This is useful for statically displaying portfolio data
 */
export async function readPortfolioData(): Promise<PortfolioData | null> {
  try {
    const response = await fetch('/data/portfolio.json');
    if (!response.ok) {
      console.error('Failed to fetch portfolio.json');
      return null;
    }
    
    const jsonData = await response.json();
    return jsonData.data || null;
  } catch (error) {
    console.error('Error reading portfolio data:', error);
    return null;
  }
}

/**
 * Filter projects by featured status
 */
export function getFeaturedProjects(portfolioData: PortfolioData | null) {
  if (!portfolioData || !portfolioData.projects) return [];
  return portfolioData.projects.filter(project => project.featured === true);
}

/**
 * Filter projects by non-featured status
 */
export function getOtherProjects(portfolioData: PortfolioData | null) {
  if (!portfolioData || !portfolioData.projects) return [];
  return portfolioData.projects.filter(project => project.featured !== true);
}

/**
 * Get tech stack with icons 
 */
export function getTechStackWithIcons(portfolioData: PortfolioData | null) {
  if (!portfolioData || !portfolioData.techStack) return [];
  return portfolioData.techStack;
}

/**
 * Get insights data with fallbacks
 */
export function getInsightsWithFallbacks(portfolioData: PortfolioData | null) {
  if (!portfolioData || !portfolioData.insights) return null;
  return portfolioData.insights;
}

/**
 * Get experience data
 */
export function getExperience(portfolioData: PortfolioData | null) {
  if (!portfolioData || !portfolioData.experience) return [];
  return portfolioData.experience;
}