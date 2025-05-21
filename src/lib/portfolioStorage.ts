/**
 * Portfolio Storage Utility
 * Manages saving and retrieving portfolio data from a file
 */

// Type declaration for File System Access API
interface FileSystemDirectoryHandle {
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Window {
    showSaveFilePicker: (options?: {
      suggestedName?: string;
      types?: Array<{
        description: string;
        accept: { [key: string]: string[] };
      }>;
    }) => Promise<FileSystemFileHandle[]>;
  }
}

// Path to the portfolio data file
const PORTFOLIO_FILE_PATH = import.meta.env.VITE_PORTFOLIO_FILE_PATH || '/data/portfolio.json';
const DEFAULT_RESUME_PATH = import.meta.env.VITE_DEFAULT_RESUME_URL || '/resume/resume.pdf';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export interface PortfolioData {
  personalInfo?: {
    name?: string;
    title?: string;
    summary?: string;
    image?: string;
    phone?: string;
    email?: string;
    location?: string;
  };
  experience?: Array<{
    company?: string;
    title?: string;
    role?: string;
    dates?: string;
    duration?: string;
    description?: string;
    achievements?: string[];
    [key: string]: any;
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    dates?: string;
    duration?: string;
    description?: string;
    cgpa?: string;
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
    stars?: number;
    forks?: number;
    commits?: number;
    topics?: string[];
    timeline?: {
      created_at?: string;
      updated_at?: string;
      recent_commits?: string[];
      has_recent_activity?: boolean;
    };
    source?: string;
    [key: string]: any;
  }>;
  skills?: string[] | Array<{
    name?: string;
    level?: number;
    category?: string;
    [key: string]: any;
  }> | {
    [category: string]: string[];
  };
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
    topSkills?: Array<{
      name: string;
      category: string;
      proficiency: number;
      justification: string;
    }>;
    technicalProfile?: {
      primaryStack?: string[];
      secondaryStack?: string[];
      languages?: Array<{ 
        name: string; 
        proficiency: string;
      }>;
      methodologies?: string[];
      strengths?: string[];
      growthAreas?: string[];
    };
    careerTrajectory?: string;
    careerRecommendations?: {
      nextSteps?: string[];
      potentialRoles?: string[];
      skillsToAcquire?: string[];
    };
    summary?: {
      strengths?: string;
      strengthsAnalysis?: string;
      career_trajectory?: string;
      technical_focus?: string;
      technicalFocus?: string;
      learning_recommendations?: string;
      learningRecommendations?: string;
    };
    [key: string]: any;
  };
  techStack?: Array<{
    name?: string;
    icon?: string;
  }>;
  githubStats?: {
    totalPublicRepos?: number;
    totalStars?: number;
    totalForks?: number;
    totalCommits?: number;
    featuredRepos?: number;
  };
  lastUpdated?: Date;
  [key: string]: any;
}

// Default portfolio data to use when no file is available
const defaultPortfolioData: PortfolioData = {
  personalInfo: {
    name: import.meta.env.VITE_DEFAULT_NAME || "Lakshya Jain",
    title: import.meta.env.VITE_DEFAULT_TITLE || "Software Developer",
    summary: import.meta.env.VITE_DEFAULT_BIO || "A skilled developer passionate about creating impactful solutions.",
    image: import.meta.env.VITE_DEFAULT_AVATAR || "/assets/default-avatar.png",
    phone: import.meta.env.VITE_DEFAULT_PHONE || "+91-7976123107",
    email: import.meta.env.VITE_DEFAULT_EMAIL || "lakshyajainrj19@gmail.com",
    location: import.meta.env.VITE_DEFAULT_LOCATION || "India",
  },
  socialLinks: {
    github: import.meta.env.VITE_DEFAULT_GITHUB_URL || "https://github.com/lakshyajain-0291",
    linkedin: import.meta.env.VITE_DEFAULT_LINKEDIN_URL || "https://linkedin.com/in/yourusername"
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  insights: {},
  techStack: [],
  githubStats: {
    totalPublicRepos: 0,
    totalStars: 0,
    totalForks: 0,
    totalCommits: 0,
    featuredRepos: 0
  },
  resumeUrl: DEFAULT_RESUME_PATH,
  lastUpdated: new Date()
};

// Helper function to process API response data
const processApiResponse = (apiData: any): PortfolioData => {
  if (!apiData || !apiData.data) {
    console.error('Using default data, Invalid API response:', apiData);

    return defaultPortfolioData;
  }

  const { data } = apiData;
  
  // Build a cleaned portfolio data object from API response
  const portfolioData: PortfolioData = {
    personalInfo: data.personalInfo || defaultPortfolioData.personalInfo,
    experience: data.experience || [],
    education: data.education || [],
    projects: data.projects || [],
    skills: data.skills || [],
    socialLinks: data.socialLinks || defaultPortfolioData.socialLinks,
    resumeUrl: data.resumeUrl || DEFAULT_RESUME_PATH,
    insights: data.insights || {},
    techStack: data.techStack || [],
    githubStats: data.githubStats || {
      totalPublicRepos: 0,
      totalStars: 0,
      totalForks: 0,
      totalCommits: 0,
      featuredRepos: 0
    },
    lastUpdated: new Date()
  };

  console.log('Processed portfolio data from API:', portfolioData);

  return portfolioData;
};

// Store fileHandle when user first selects it
let savedFileHandle = null;

export const portfolioStorage = {
  /**
   * Load portfolio data from localStorage or file
   */
  async getPortfolio(): Promise<PortfolioData> {
    try {
      // First try to load from file (highest priority)
      try {
        const response = await fetch(PORTFOLIO_FILE_PATH);
        if (response.ok) {
          const fileData = await response.json();
          // If data comes from API response format, extract the actual data
          const portfolioData = fileData.data ? fileData.data : fileData;
          return { ...defaultPortfolioData, ...portfolioData };
        }
      } catch (fileError) {
        console.log('File data not available, checking localStorage:', fileError);
      }
      
      // If file loading fails, check localStorage (second priority)
      const localData = localStorage.getItem('portfolioData');
      if (localData) {
        const parsedData = JSON.parse(localData);
        return { ...defaultPortfolioData, ...parsedData };
      }


      // Return default data if neither file nor localStorage has data
      return defaultPortfolioData;
    }
    catch (error) {
      console.error('Error loading portfolio data:', error);
      return defaultPortfolioData; // Return default data on error
    }
  },
  /**
   * Save portfolio data to localStorage
   */
  async savePortfolio(data: PortfolioData): Promise<void> {
    try {
      // Clear any existing portfolio data from localStorage first
      localStorage.removeItem('portfolioData');
      
      // Store the new portfolio data
      localStorage.setItem('portfolioData', JSON.stringify({
        ...data,
        lastUpdated: new Date(),
      }));
      
      console.log('Portfolio data saved to localStorage');
    } catch (error) {
      console.error('Failed to save portfolio data to localStorage:', error);
    }
  },

  /**
   * Save portfolio data to data/portfolio.json
   */
  // Store fileHandle when user first selects it

async saveToFile(data: PortfolioData): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    
    // If we don't have a file handle yet, we need user interaction once
    if (!savedFileHandle) {
      savedFileHandle = await window.showSaveFilePicker({
        suggestedName: 'portfolio.json',
        types: [{ 
          description: 'JSON Files',
          accept: { 'application/json': ['.json'] }
        }],
      });
    }
    
    // Check if we still have permission
    const permission = await savedFileHandle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') {
      const newPermission = await savedFileHandle.requestPermission({ mode: 'readwrite' });
      if (newPermission !== 'granted') {
        throw new Error('Permission to write to the file was denied');
      }
    }
    
    // Write to the file
    const writable = await savedFileHandle.createWritable();
    await writable.write(jsonData);
    await writable.close();
    console.log('Portfolio data saved automatically');
  } catch (error) {
    console.error('Failed to save portfolio data:', error);
  }
},

  /**
   * Fetch portfolio data from the API and save it locally
   */
  async fetchFromAPI(githubUrl: string | null = null, linkedinUrl: string | null = null): Promise<PortfolioData> {
    try {
      const formData = new FormData();

      // console.log('Default resume path:', DEFAULT_RESUME_PATH);

      const resumeFile = await fetch(DEFAULT_RESUME_PATH);
      if (resumeFile.ok) {
        const resumeBlob = await resumeFile.blob();
        // Make sure we're getting a PDF file, not an HTML error page
        if (resumeBlob.type === 'application/pdf') {
          formData.append('resume', resumeBlob, 'Resume.pdf');
        } else {
          console.log('Resume file is not a PDF (received type:', resumeBlob.type, ')');
          console.error('Received response:', await resumeBlob.text());
          // Optionally handle this error, perhaps by notifying the user
        }
      }

      // Add Github and LinkedIn URLs if provided
      if (githubUrl) {
        formData.append('githubUrl', githubUrl);
      }
      
      if (linkedinUrl) {
        formData.append('linkedinUrl', linkedinUrl);
      }

      // Call the API endpoint
      const response = await fetch(`${API_URL}/portfolio/`, {
        method: 'POST',
        headers: {
          'API-Key': API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data from API: ${response.status}`);
      }

      const apiResponse = await response.json();
      const processedData = processApiResponse(apiResponse);

      // Save the processed data locally (background saving)
      portfolioStorage.savePortfolio(processedData); // Save to localStorage
      portfolioStorage.saveToFile(processedData);   // Save to portfolio.json

      return processedData;
    } catch (error) {
      console.error('Error fetching data from API:', error);
      return defaultPortfolioData;
    }
  },

  _saveViaDownload(jsonData: string): void {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Dispatch a custom event to notify that the download has completed
    const event = new CustomEvent('portfolioDataDownloaded', {
      detail: { filename: 'portfolio.json' }
    });
    window.dispatchEvent(event);

    console.log('Portfolio data downloaded as portfolio.json');
  },

  /**
   * Download portfolio data as a JSON file
   */
  downloadPortfolioJSON(data: any): void {
    try {
      console.log('Downloading portfolio data:', data);
      const jsonData = JSON.stringify(data, null, 2);
      portfolioStorage._saveViaDownload(jsonData);
    } catch (error) {
      console.error('Failed to download portfolio data:', error);
    }
  },
};

export default portfolioStorage;