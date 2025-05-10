/**
 * Centralized configuration for frontend environment variables
 * This provides defaults for all environment-dependent values
 */

// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default User Information
export const DEFAULT_USER = {
    NAME: import.meta.env.VITE_DEFAULT_NAME || 'Lakshya Jain',
    TITLE: import.meta.env.VITE_DEFAULT_TITLE || 'Full-Stack Developer',
    EMAIL: import.meta.env.VITE_DEFAULT_EMAIL || 'lakshyajainrj19@gmail.com',
    BIO: import.meta.env.VITE_DEFAULT_BIO || 
        'I build innovative applications that leverage AI to solve complex problems. My portfolio showcases projects automatically updated from my LinkedIn, GitHub, and resume data.'
};

// Default Social Links
export const DEFAULT_SOCIAL = {
    GITHUB_URL: import.meta.env.VITE_DEFAULT_GITHUB_URL || 'https://github.com/lakshyajain-0291',
    GITHUB_USERNAME: import.meta.env.VITE_DEFAULT_GITHUB_USERNAME || 'lakshyajain-0291',
    LINKEDIN_URL: import.meta.env.VITE_DEFAULT_LINKEDIN_URL || 'https://www.linkedin.com/in/lakshya-jain-5b565a284/',
    LINKEDIN_USERNAME: import.meta.env.VITE_DEFAULT_LINKEDIN_USERNAME || 'lakshya-jain-5b565a284',
    TWITTER_URL: import.meta.env.VITE_DEFAULT_TWITTER_URL || '',
    WEBSITE_URL: import.meta.env.VITE_DEFAULT_WEBSITE_URL || ''
};

// Default Asset URLs
export const DEFAULT_ASSETS = {
    AVATAR: import.meta.env.VITE_DEFAULT_AVATAR || '/assets/default-avatar.png',
    PROJECT_IMAGE: import.meta.env.VITE_DEFAULT_PROJECT_IMAGE || '/assets/default-project.png',
    RESUME_URL: import.meta.env.VITE_DEFAULT_RESUME_URL || '/resume/resume.pdf',
};

// App Settings
export const APP_SETTINGS = {
    APP_NAME: import.meta.env.VITE_APP_NAME || 'LiveInsight',
    SITE_TITLE: import.meta.env.VITE_SITE_TITLE || 'Developer Portfolio',
    META_DESCRIPTION: import.meta.env.VITE_META_DESCRIPTION || 'Professional portfolio showcasing my projects and skills'
};

