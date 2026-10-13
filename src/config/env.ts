/**
 * Centralized configuration for frontend environment variables
 * This provides defaults for all environment-dependent values
 */

// Templates 0-3 are the original numbered ones; 'atlas' and 'paper' share the
// typed content model in shared/content.
export const TEMPLATE_IDS = [0, 1, 2, 3, 'atlas', 'paper'] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const parseTemplateId = (value: string | null | undefined): TemplateId | null => {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (/^[0-3]$/.test(v)) return parseInt(v, 10) as TemplateId;
  return v === 'atlas' || v === 'paper' ? v : null;
};

// URL ?template= wins, then VITE_TEMPLATE_NUMBER, then the Systems Paper (owner's default, 2026-10-13).
const getTemplateId = (): TemplateId => {
  if (typeof window !== 'undefined') {
    const fromUrl = parseTemplateId(new URLSearchParams(window.location.search).get('template'));
    if (fromUrl !== null) return fromUrl;
  }
  return parseTemplateId(import.meta.env.VITE_TEMPLATE_NUMBER) ?? 'paper';
};

// Template Configuration
export const TEMPLATE_CONFIG = {
    TEMPLATE_NUMBER: getTemplateId()
};

// Default User Information
export const DEFAULT_USER = {
    NAME: import.meta.env.VITE_DEFAULT_NAME || 'Lakshya Jain',
    TITLE: import.meta.env.VITE_DEFAULT_TITLE || 'Backend & Distributed Systems Engineer',
    EMAIL: import.meta.env.VITE_DEFAULT_EMAIL || 'lakshyajainrj19@gmail.com',
    BIO: import.meta.env.VITE_DEFAULT_BIO || 
        'I build innovative applications that leverage AI to solve complex problems. My portfolio showcases projects automatically updated from my LinkedIn, GitHub, and resume data.',
    LOCATION: import.meta.env.VITE_DEFAULT_LOCATION || 'Jodhpur, India',
};

// Default Social Links
export const DEFAULT_SOCIAL = {
    GITHUB_URL: import.meta.env.VITE_DEFAULT_GITHUB_URL || 'https://github.com/lakshyajain-0291',
    GITHUB_USERNAME: import.meta.env.VITE_DEFAULT_GITHUB_USERNAME || 'lakshyajain-0291',
    LINKEDIN_URL: import.meta.env.VITE_DEFAULT_LINKEDIN_URL || 'https://www.linkedin.com/in/lakshyajain1503/',
    LINKEDIN_USERNAME: import.meta.env.VITE_DEFAULT_LINKEDIN_USERNAME || 'lakshyajain1503',
    TWITTER_URL: import.meta.env.VITE_DEFAULT_TWITTER_URL || '',
    WEBSITE_URL: import.meta.env.VITE_DEFAULT_WEBSITE_URL || 'https://me.lakshy.tech'
};

// Default Asset URLs
export const DEFAULT_ASSETS = {
    AVATAR: import.meta.env.VITE_DEFAULT_AVATAR || '',
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
