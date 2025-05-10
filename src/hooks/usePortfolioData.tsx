import { usePortfolio } from './PortfolioContext';
import { DEFAULT_ASSETS } from '@/config/env';

// Types for portfolio data
interface Project {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  technologies?: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
}

interface Skill {
  name: string;
  category: string;
  level: number;
}

interface Experience {
  id?: string;
  company?: string;
  role?: string;
  duration?: string;
  description?: string;
  achievements?: string[];
}

interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  startYear?: number;
  endYear?: number;
  description?: string;
}

interface Insight {
  mostUsedLanguage?: string;
  preferredStack?: string;
  learningFocus?: string;
  topSkills?: Array<{
    name: string;
    category: string;
    proficiency: number;
    justification: string;
  }>;
  technicalProfile?: {
    primaryStack?: string[];
    secondaryStack?: string[];
    languages?: Array<{ name: string; proficiency: string }>;
    strengths?: string[];
    growthAreas?: string[];
  };
  careerAnalysis?: {
    careerPath?: string;
    specializations?: string[];
    potentialRoles?: string[];
  };
  summary?: {
    portfolioInsights?: {
      strengthsAnalysis?: string;
      technicalFocus?: string;
      learningRecommendations?: string;
    };
    strengthsAnalysis?: string;
    technicalFocus?: string;
    learningRecommendations?: string;
  };
  rawAnalyses?: {
    skillAnalysis?: {
      topSkills?: Array<{
        name: string;
        category: string;
        proficiency: number;
        justification: string;
      }>;
      skillCategories?: Record<string, string[]>;
      proficiencyDistribution?: Record<string, string[]>;
    };
    careerAnalysis?: any;
    technicalProfile?: any;
  };
}

interface UsePortfolioDataResult {
  isLoading: boolean;
  error: string | null;
  projects: Project[];
  experiences: Experience[];
  technologies: Skill[];
  resumeUrl: string | null;
  insights: Insight | null;
  processPortfolioData: (githubUrl: string | null, linkedinUrl: string | null) => Promise<void>;
  refreshData: () => Promise<void>;
}

// Helper to ensure URLs are absolute
function ensureAbsoluteUrl(url?: string): string {
  if (!url) return DEFAULT_ASSETS.PROJECT_IMAGE;
  
  // If it's already absolute, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // For server assets that start with /assets/ or /uploads/
  if (url.startsWith('/assets/') || url.startsWith('/uploads/')) {
    return url;
  }
  
  // For other relative URLs, assume they're from public directory
  return url;
}

// Process skills from the API response format
function processSkills(skills: any): Skill[] {
  if (!skills) return [];
  
  // If skills is an array (old format), return it
  if (Array.isArray(skills)) {
    return skills;
  }
  
  // If skills is an object with category keys (new API format)
  const processedSkills: Skill[] = [];
  
  Object.entries(skills).forEach(([category, skillsInCategory]) => {
    if (Array.isArray(skillsInCategory)) {
      // For simple arrays of skill names in each category
      skillsInCategory.forEach((skillName, index) => {
        // Generate a decreasing level based on position to show them in order
        const level = Math.max(30, 100 - (index * 5)); 
        processedSkills.push({
          name: skillName,
          category,
          level
        });
      });
    }
  });
  
  return processedSkills;
}

// Process experiences from the API response format
function processExperiences(experiences: any[]): Experience[] {
  if (!experiences) return [];
  
  return experiences.map(exp => {
    // Handle different API response formats for experience
    return {
      id: exp.id || `exp-${Math.random().toString(36).substring(2, 9)}`,
      company: exp.company || '',
      role: exp.title || exp.role || '',
      duration: exp.dates || exp.duration || '',
      description: exp.description || '',
      achievements: exp.achievements || []
    };
  });
}

export function usePortfolioData(): UsePortfolioDataResult {
  // Use the portfolio context
  const { portfolio, isLoading, error, processNewPortfolioData, refreshAllData } = usePortfolio();

  // Process and normalize data for components
  const projects = portfolio?.projects?.map(project => ({
    ...project,
    image: project.image ? ensureAbsoluteUrl(project.image) : DEFAULT_ASSETS.PROJECT_IMAGE
  })) || [];

  const experiences = processExperiences(portfolio?.experience || []);
  const technologies = processSkills(portfolio?.skills || []);
  const resumeUrl = portfolio?.resumeUrl || null;
  const insights = portfolio?.insights || null;

  return {
    isLoading,
    error,
    projects,
    experiences,
    technologies,
    resumeUrl,
    insights,
    processPortfolioData: processNewPortfolioData,
    refreshData: refreshAllData
  };
}