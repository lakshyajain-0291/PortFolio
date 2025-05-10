import { DEFAULT_ASSETS } from '@/config/env';
import axios from 'axios';

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
  owner: {
    login: string;
    avatar_url: string;
  };
  default_branch: string;
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

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: GITHUB_TOKEN ? `token ${GITHUB_TOKEN}` : '',
    Accept: 'application/vnd.github.v3+json',
  },
});

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

export const fetchRepoData = async (githubUrl?: string): Promise<GithubRepo | null> => {
  if (!githubUrl) return null;
  
  // Check if we have cached data for this URL
  if (repoCache.has(githubUrl)) {
    return repoCache.get(githubUrl) || null;
  }
  
  const repoInfo = extractRepoInfoFromUrl(githubUrl);
  if (!repoInfo) return null;
  
  try {
    const response = await githubApi.get<GithubRepo>(`/repos/${repoInfo.owner}/${repoInfo.repo}`);
    // Cache the result
    repoCache.set(githubUrl, response.data);
    return response.data;
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

// New function to get the basic project info without making API calls
export const getBasicProjectInfo = (githubUrl?: string): { name: string, owner: string } | null => {
  if (!githubUrl) return null;
  
  const repoInfo = extractRepoInfoFromUrl(githubUrl);
  if (!repoInfo) return null;
  
  return {
    name: repoInfo.repo,
    owner: repoInfo.owner
  };
};

// Function to fetch GitHub contribution data
export const fetchGitHubContributions = async (username: string): Promise<ContributionDay[]> => {
  if (!username) {
    console.error('No username provided for GitHub contributions');
    return [];
  }
  
  try {
    // Try multiple CORS proxies in case one fails
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/get?url=',
      'https://cors-anywhere.herokuapp.com/'
    ];
    
    const targetUrl = `https://github-contributions.vercel.app/api/v1/${username}`;
    
    // Try without a proxy first (in case CORS headers were added)
    try {
      const directResponse = await fetch(targetUrl, { 
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (directResponse.ok) {
        const data = await directResponse.json();
        return data.contributions.map((contribution: any) => ({
          date: contribution.date,
          count: contribution.count,
          level: contribution.intensity || Math.min(Math.floor(contribution.count / 2), 4)
        }));
      }
    } catch (directError) {
      console.warn('Direct API call failed, trying proxies:', directError);
    }
    
    // Try each proxy in sequence
    for (const proxy of corsProxies) {
      try {
        const encodedUrl = proxy.includes('?') ? encodeURIComponent(targetUrl) : targetUrl;
        const proxyUrl = `${proxy}${encodedUrl}`;
        
        console.log(`Trying proxy: ${proxy} for GitHub contributions`);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          console.warn(`Proxy ${proxy} failed with status: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        // Handle different proxy response formats
        let contributions;
        if (proxy.includes('allorigins')) {
          // allorigins wraps the response in a contents property as a string
          contributions = JSON.parse(data.contents).contributions;
        } else {
          // Other proxies might return the data directly
          contributions = data.contributions || data;
        }
        
        if (Array.isArray(contributions)) {
          return contributions.map((contribution: any) => ({
            date: contribution.date,
            count: contribution.count,
            level: contribution.intensity || Math.min(Math.floor(contribution.count / 2), 4)
          }));
        }
      } catch (proxyError) {
        console.warn(`Proxy ${proxy} failed:`, proxyError);
        // Continue to the next proxy
      }
    }
    
    // If all proxies fail, generate sample data for display purposes
    console.warn('All GitHub contribution fetching methods failed, generating sample data');
    return generateSampleContributionData();
    
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return generateSampleContributionData();
  }
};

// Generate sample contribution data when API fails
const generateSampleContributionData = (): ContributionDay[] => {
  const days = 365;
  const result: ContributionDay[] = [];
  
  // Start from a year ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    
    // Generate random contribution counts, with weekends having higher probability of contributions
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Simulate some patterns in the data
    let count = 0;
    const rand = Math.random();
    
    if (isWeekend && rand > 0.3) {
      // Higher activity on weekends
      count = Math.floor(Math.random() * 7) + 1;
    } else if (rand > 0.6) {
      // Medium activity on weekdays
      count = Math.floor(Math.random() * 5);
    }
    
    // Create realistic-looking data with some streaks
    const streak = Math.floor(i / 10) % 5 === 0;
    if (streak) count = Math.max(count, 1);
    
    result.push({
      date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD format
      count: count,
      level: Math.min(Math.floor(count / 2), 4)
    });
  }
  
  return result;
};

export const enhanceProjectWithGithubData = async (project: any): Promise<EnhancedProject> => {
  // Start with a basic enhanced project with just the GitHub URL
  const enhancedProject: EnhancedProject = { 
    id: project.id || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: null,
    description: null,
    github: project.github || null,
    featured: project.featured || false
  };
  
  // Always get the GitHub image URL for a consistent look
  if (project.github) {
    const repoImage = getRepoImageUrl(project.github);
    enhancedProject.image = repoImage;
    
    // Get basic info without API calls
    const basicInfo = getBasicProjectInfo(project.github);
    if (basicInfo) {
      enhancedProject.title = enhancedProject.title || basicInfo.name;
    }
    
    try {
      const repoData = await fetchRepoData(project.github);
      
      if (repoData) {
        // Use repository name as the project title if not set
        enhancedProject.title = enhancedProject.title || repoData.name;
        
        // Use GitHub description if not set
        enhancedProject.description = enhancedProject.description || repoData.description;
        
        // Use homepage as demo URL if available
        enhancedProject.demo = project.demo || repoData.homepage;
        
        // Set technologies from topics and language
        const techs = new Set<string>();
        if (repoData.language) techs.add(repoData.language);
        repoData.topics?.forEach(topic => techs.add(topic));
        enhancedProject.technologies = Array.from(techs);
        
        // Store all repo data
        enhancedProject.repoData = {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.watchers_count,
          language: repoData.language,
          topics: repoData.topics,
          lastUpdated: repoData.updated_at,
          ownerAvatar: repoData.owner.avatar_url,
          repoImage: repoImage,
          name: repoData.name
        };
      }
    } catch (error) {
      console.error('Error enhancing project with GitHub data:', error);
    }
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