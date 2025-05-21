/**
 * Centralized configuration for frontend environment variables
 * This provides defaults for all environment-dependent values
 */

// Get template number from URL query parameters or environment variable
const getTemplateNumber = (): number => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const templateParam = urlParams.get('template');
    
    // If template param exists and is a number between 0-3, use it
    if (templateParam && /^[0-3]$/.test(templateParam)) {
      return parseInt(templateParam, 10);
    }
  }
  
  // Otherwise fall back to the configured template or 0 as default
  return parseInt(import.meta.env.VITE_TEMPLATE_NUMBER || '0', 10);
};

// Template Configuration
export const TEMPLATE_CONFIG = {
    TEMPLATE_NUMBER: getTemplateNumber()
};

// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Default User Information
export const DEFAULT_USER = {
    NAME: import.meta.env.VITE_DEFAULT_NAME || 'Lakshya Jain',
    TITLE: import.meta.env.VITE_DEFAULT_TITLE || 'Full-Stack Developer',
    EMAIL: import.meta.env.VITE_DEFAULT_EMAIL || 'lakshyajainrj19@gmail.com',
    BIO: import.meta.env.VITE_DEFAULT_BIO || 
        'I build innovative applications that leverage AI to solve complex problems. My portfolio showcases projects automatically updated from my LinkedIn, GitHub, and resume data.',
    LOCATION: import.meta.env.VITE_DEFAULT_LOCATION || 'Remote',
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

// Section ordering configuration - all will be 0 if template is set to 0
export const SECTION_NUMBERS = {
    HERO: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 1,
    PROJECTS: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 3,
    GITHUB_STATS: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 4,
    TECH_STACK: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 5,
    INSIGHTS: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 8,
    EXPERIENCE: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 2,
    EDUCATION: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 6,
    CONTACT: TEMPLATE_CONFIG.TEMPLATE_NUMBER === 0 ? 0 : 7
};

// export const SECTION_NUMBERS = {
//     HERO: 0,
//     PROJECTS: 0,
//     GITHUB_STATS: 0,
//     TECH_STACK: 0,
//     INSIGHTS: 0,
//     EXPERIENCE: 0,
//     EDUCATION: 0,
//     CONTACT: 0
// };

// Form Settings
export const FORM_SETTINGS = {
    // Example Google Form URL - replace with actual form URL from .env
    GOOGLE_FORM_URL: import.meta.env.VITE_GOOGLE_FORM_URL || 'https://docs.google.com/forms/d/e/1FAIpQLScJNBMiU714RJjpTokSEgVVFWI1Q0YGF1zc6vkOtwQLD38vTw/formResponse',
    // Field IDs from the Google Form
    GOOGLE_FORM_NAME_FIELD: import.meta.env.VITE_GOOGLE_FORM_NAME_FIELD || 'entry.1234567890',
    GOOGLE_FORM_EMAIL_FIELD: import.meta.env.VITE_GOOGLE_FORM_EMAIL_FIELD || 'entry.0987654321',
    GOOGLE_FORM_MESSAGE_FIELD: import.meta.env.VITE_GOOGLE_FORM_MESSAGE_FIELD || 'entry.1357924680'
};
