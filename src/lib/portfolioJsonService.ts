import { api } from './api';

/**
 * Interface for portfolio data structure
 */
export interface PortfolioData {
  personalInfo?: {
    name?: string;
    title?: string;
    summary?: string;
  };
  experience?: Array<{
    id?: string;
    company?: string;
    role?: string;
    duration?: string;
    description?: string;
    achievements?: string[];
    [key: string]: any;
  }>;
  education?: Array<{
    id?: string;
    institution?: string;
    degree?: string;
    duration?: string;
    description?: string;
    [key: string]: any;
  }>;
  projects?: Array<{
    id?: string;
    title?: string;
    description?: string;
    technologies?: string[];
    github?: string;
    demo?: string;
    image?: string;
    featured?: boolean;
    [key: string]: any;
  }>;
  skills?: Array<{
    name?: string;
    level?: number;
    category?: string;
    [key: string]: any;
  }>;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    [key: string]: string;
  };
  resumeUrl?: string;
  insights?: {
    mostUsedLanguage?: string;
    preferredStack?: string;
    learningFocus?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Default portfolio data to use when no data is available
const defaultPortfolioData: PortfolioData = {
  personalInfo: {
    name: "Your Name",
    title: "Software Developer",
    summary: "A skilled developer passionate about creating impactful solutions."
  },
  socialLinks: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername"
  },
  experience: [],
  education: [],
  projects: [],
  skills: []
};

/**
 * Service for handling portfolio JSON data
 */
export const portfolioJsonService = {
  /**
   * Retrieves portfolio data from localStorage or default data if not available
   */
  async getPortfolioData(): Promise<PortfolioData> {
    try {
      // First try to load from localStorage
      const storedData = localStorage.getItem('portfolioData');
      
      if (storedData) {
        return JSON.parse(storedData);
      }
      
      // If no data in localStorage, return default data
      return defaultPortfolioData;
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      return defaultPortfolioData;
    }
  },

  /**
   * Saves portfolio data to localStorage
   */
  async savePortfolioData(data: PortfolioData): Promise<void> {
    try {
      localStorage.setItem('portfolioData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving portfolio data to localStorage:', error);
      throw error;
    }
  },

  /**
   * Process and update portfolio data from resume PDF, GitHub and LinkedIn
   */
  async processPortfolioData(resumeFile: File | null, githubUrl: string | null, linkedinUrl: string | null): Promise<PortfolioData> {
    try {
      // Create FormData object to send files
      const formData = new FormData();
      
      // Add resume file if provided
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }
      
      // Add GitHub and LinkedIn URLs if provided
      if (githubUrl) {
        formData.append('githubUrl', githubUrl);
      }
      
      if (linkedinUrl) {
        formData.append('linkedinUrl', linkedinUrl);
      }
      
      // Call the API endpoint
      const response = await api.post('/portfolio/getportfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Get the processed data
      const processedData: PortfolioData = response.data;
      
      // Save to localStorage
      await this.savePortfolioData(processedData);
      
      return processedData;
    } catch (error) {
      console.error('Error processing portfolio data:', error);
      throw error;
    }
  },
};

export default portfolioJsonService;