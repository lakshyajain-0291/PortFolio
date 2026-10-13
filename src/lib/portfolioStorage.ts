import { isV2, toLegacy } from '../../shared/content/legacy';
import { repoKey } from '../../shared/content/build';

/**
 * The shape the older editions (templates 0 to 3) read. It is derived from
 * public/data/portfolio.json (schema v2) by shared/content/legacy.ts; the JSON
 * file is the only source.
 */
export interface PortfolioData {
  personalInfo?: {
    about?: string;
    availability?: string;
    institution?: string;
    graduationYear?: number;
    name?: string;
    title?: string;
    summary?: string;
    image?: string;
    phone?: string;
    email?: string;
    collegeEmail?: string;
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
    slug?: string;
    role?: string;
    status?: string;
    headline?: { value: string; unit?: string; label: string; kind: string; method?: string };
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
      proficiency?: number;
      justification: string;
    }>;
    technicalProfile?: {
      primaryStack?: string[];
      secondaryStack?: string[];
      languages?: Array<{ 
        name: string; 
        proficiency?: string;
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

/** Loads portfolio.json and maps it onto the older editions' shape. */
export async function loadPortfolio(): Promise<PortfolioData> {
  const res = await fetch('/data/portfolio.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load portfolio data (HTTP ${res.status}).`);
  const json: unknown = await res.json();
  if (!isV2(json)) throw new Error('portfolio.json is not in the version 2 format.');
  const legacy = toLegacy(json);
  // Attach live repository facts (stars, forks, commits, dates) to each project.
  const repos = new Map(
    (legacy.githubData?.repositories ?? []).map((r) => [repoKey(r.html_url) ?? r.full_name?.toLowerCase() ?? '', r]),
  );
  legacy.projects = legacy.projects.map((p) => {
    const r = repos.get(repoKey(p.github) ?? '');
    return r
      ? {
          ...p,
          stars: r.stargazers_count ?? undefined,
          forks: r.forks_count ?? undefined,
          commits: typeof r.commits === 'number' ? r.commits : undefined,
          timeline: { created_at: r.created_at, updated_at: r.updated_at, pushed_at: r.pushed_at },
        }
      : p;
  });
  return legacy as unknown as PortfolioData;
}
