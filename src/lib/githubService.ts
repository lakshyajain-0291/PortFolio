import { DEFAULT_ASSETS } from '@/config/env';
import { readPortfolioData } from './portfolioReader';

interface GithubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  homepage: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  owner?: {
    login: string;
    avatar_url: string;
  };
  default_branch?: string;
  created_at?: string;
  commits?: number;
}

export interface EnhancedProject {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  technologies?: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
  repoData?: {
    stars: number;
    forks: number;
    watchers: number;
    language: string;
    topics: string[];
    lastUpdated: string;
    ownerAvatar: string;
    repoImage: string;
    name: string;
  };
}

// Interface for contribution data
export interface ContributionDay {
  date: string;
  count: number;
  level: number; // 0-4 representing contribution intensity
}

// Store processed repo data to prevent duplicate API calls
const repoCache = new Map<string, GithubRepo>();

// Local portfolio data cache
let portfolioDataCache: any = null;

// Get portfolio data with caching
const getPortfolioData = async () => {
  if (!portfolioDataCache) {
    portfolioDataCache = await readPortfolioData();
  }
  return portfolioDataCache;
};

export const extractRepoInfoFromUrl = (url?: string): { owner: string; repo: string } | null => {
  if (!url) return null;
  
  try {
    // Handle both full URLs and shortened formats
    const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/\?#]+)/;
    const match = url.match(githubUrlPattern);
    
    if (match && match.length >= 3) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''), // Remove .git if present
      };
    }
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
  }
  
  return null;
};

// Updated to use local data
export const fetchRepoData = async (githubUrl?: string): Promise<GithubRepo | null> => {
  if (!githubUrl) return null;
  
  // Check if we have cached data for this URL
  if (repoCache.has(githubUrl)) {
    return repoCache.get(githubUrl) || null;
  }
  
  const repoInfo = extractRepoInfoFromUrl(githubUrl);
  if (!repoInfo) return null;
  
  try {
    // Get portfolio data
    const portfolioData = await getPortfolioData();
    const githubData = portfolioData.githubData;
    
    // Find the repo in our hardcoded data
    const repo = githubData?.repositories?.find(
      (r: any) => r.name.toLowerCase() === repoInfo.repo.toLowerCase() ||
                 (r.full_name && r.full_name.toLowerCase() === `${repoInfo.owner.toLowerCase()}/${repoInfo.repo.toLowerCase()}`)
    );
    
    if (repo) {
      // Add owner property if not present
      if (!repo.owner) {
        repo.owner = {
          login: repoInfo.owner,
          avatar_url: `https://avatars.githubusercontent.com/${repoInfo.owner}`
        };
      }
      
      // Cache the result
      repoCache.set(githubUrl, repo);
      return repo;
    }
    
    console.warn(`Repository data for ${githubUrl} not found in portfolio.json`);
    return null;
  } catch (error) {
    console.error(`Error fetching GitHub repository data for ${githubUrl}:`, error);
    return null;
  }
};

export const getRepoImageUrl = (githubUrl?: string): string => {
  if (!githubUrl) return DEFAULT_ASSETS.PROJECT_IMAGE;
  
  const repoInfo = extractRepoInfoFromUrl(githubUrl);
  if (!repoInfo) return DEFAULT_ASSETS.PROJECT_IMAGE;
  
  // Return the GitHub social preview image
  return `https://opengraph.githubassets.com/1/${repoInfo.owner}/${repoInfo.repo}`;
};

export const getBasicProjectInfo = (githubUrl?: string): { name: string, owner: string } | null => {
  if (!githubUrl) return null;
  
  const repoInfo = extractRepoInfoFromUrl(githubUrl);
  if (!repoInfo) return null;
  
  return {
    name: repoInfo.repo,
    owner: repoInfo.owner
  };
};

// Updated to use local data
export const fetchGitHubContributions = async (username: string): Promise<ContributionDay[]> => {
  if (!username) {
    console.error('No username provided for GitHub contributions');
    return [];
  }
  
  try {
    // Get portfolio data
    const portfolioData = await getPortfolioData();
    const contributions = portfolioData.githubData?.contributions;
    
    // If we have hardcoded contributions data, use it
    if (contributions && Array.isArray(contributions) && contributions.length > 0) {
      console.log('Using hardcoded GitHub contributions data');
      return contributions;
    }
    
    // Fallback to sample data
    console.warn('No hardcoded GitHub contributions found, generating sample data');
    return generateSampleContributionData();
    
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return generateSampleContributionData();
  }
};

// Generate sample contribution data when needed
const generateSampleContributionData = (): ContributionDay[] => {
  const days = 365;
  const result: ContributionDay[] = [];
  
  // Start from a year ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    // Generate random contribution counts
    let count = 0;
    const rand = Math.random();
    
    if (rand > 0.7) {
      // High activity (30% chance)
      count = Math.floor(Math.random() * 7) + 1;
    } else if (rand > 0.5) {
      // Medium activity (20% chance)
      count = Math.floor(Math.random() * 5);
    }
    
    result.push({
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      count: count,
      level: Math.min(Math.floor(count / 2), 4)
    });
  }
  
  return result;
};

// Updated to use local data
export const enhanceProjectWithGithubData = async (project: any): Promise<EnhancedProject> => {
  // Start with a basic enhanced project with just the GitHub URL
  const enhancedProject: EnhancedProject = { 
    id: project.id || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: project.title || null,
    description: project.description || null,
    github: project.github || null,
    featured: project.featured || false
  };
  
  // If no GitHub URL, return as is
  if (!project.github) {
    return enhancedProject;
  }
  
  // Always get the GitHub image URL for a consistent look
  const repoImage = getRepoImageUrl(project.github);
  enhancedProject.image = project.image || repoImage;
  
  try {
    // Get the repository data from our local cache
    const repoData = await fetchRepoData(project.github);
    
    if (repoData) {
      // Use repository name as the project title if not set
      enhancedProject.title = enhancedProject.title || repoData.name;
      
      // Use GitHub description if not set
      enhancedProject.description = enhancedProject.description || repoData.description;
      
      // Use homepage as demo URL if available
      enhancedProject.demo = project.demo || repoData.homepage || '';
      
      // Use technologies from project or derive from topics and language
      if (!enhancedProject.technologies || enhancedProject.technologies.length === 0) {
        const techs = new Set<string>();
        if (repoData.language) techs.add(repoData.language);
        repoData.topics?.forEach(topic => techs.add(topic));
        enhancedProject.technologies = Array.from(techs);
      }
      
      // Store all repo data
      enhancedProject.repoData = {
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0,
        watchers: repoData.watchers_count || 0,
        language: repoData.language || '',
        topics: repoData.topics || [],
        lastUpdated: repoData.updated_at || '',
        ownerAvatar: repoData.owner?.avatar_url || `https://avatars.githubusercontent.com/u/0`,
        repoImage: repoImage,
        name: repoData.name
      };
    } else {
      // Fallback: Get basic info without API calls
      const basicInfo = getBasicProjectInfo(project.github);
      if (basicInfo) {
        enhancedProject.title = enhancedProject.title || basicInfo.name;
      }
    }
  } catch (error) {
    console.error('Error enhancing project with GitHub data:', error);
  }
  
  return enhancedProject;
};

// Create a simplified project using only a GitHub URL
export const createProjectFromGitHubUrl = (githubUrl: string, featured: boolean = false): EnhancedProject => {
  const repoImage = getRepoImageUrl(githubUrl);
  const basicInfo = getBasicProjectInfo(githubUrl);
  
  return {
    id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: basicInfo?.name || 'GitHub Project',
    github: githubUrl,
    image: repoImage,
    featured: featured
  };
};