/**
 * Shape of public/data/portfolio.json, schema version 2. This file is the one
 * source of truth for everything the site says: every edition reads it, the
 * Paper and Atlas directly (through build.ts) and the older editions through
 * legacy.ts. Architecture diagrams stay in shared/content/architecture and are
 * referenced here by id.
 *
 * Editing rules
 * - Every number in a metric names its kind and a source id from `sources`.
 * - Set `verified: false` on anything not yet checked: it shows in development
 *   and is hidden in production.
 */
import type { MetricKind, LinkKind, SourceKind } from './types';

export interface JsonLink {
  label: string;
  url: string;
  kind: LinkKind;
  /** Last result of a link check: live (HTTP 200), offline, or not checked. */
  status?: 'live' | 'offline' | 'unchecked';
  checkedAt?: string;
}

export interface JsonMetric {
  id: string;
  value: string;
  unit?: string;
  label: string;
  kind: MetricKind;
  method?: string;
  /** Id in `sources`. */
  source: string;
  verified?: boolean;
}

export interface JsonProfile {
  name: string;
  role: string;
  institution: string;
  graduationYear: number;
  location: string;
  /** First-person introduction, shown near the top of every edition. */
  about: string;
  /** One-sentence third-person summary, used in metadata and short spots. */
  summary: string;
  availability: string;
  email: string;
  collegeEmail?: string;
  phone?: string;
  resume: string;
  links: {
    github?: string;
    linkedin?: string;
    website?: string;
    codeforces?: string;
  };
}

export interface JsonExperience {
  org: string;
  title: string;
  /** "May 2026" */
  start: string;
  /** "Jul 2026" or "Present" */
  end: string;
  location?: string;
  points: string[];
  links: JsonLink[];
}

/**
 * system:     full case study with an architecture diagram
 * supporting: case study without a diagram
 * other:      listed under Other projects
 */
export type ProjectTier = 'system' | 'supporting' | 'other';

export interface JsonProject {
  slug: string;
  title: string;
  tier: ProjectTier;
  /** One line: what it is. */
  summary: string;
  /** A short paragraph for project lists in the older editions. */
  description: string;
  role?: string;
  context?: string;
  period?: string;
  stack: string[];
  /** owner/repo on GitHub, used to attach live repository facts. */
  repo?: string;
  links: JsonLink[];
  status?: 'offline';
  /** Shown in lists when true. */
  featured?: boolean;
  /** Case-study fields (tiers system and supporting). */
  problem?: string;
  approach?: string[];
  metrics?: JsonMetric[];
  /** Id of a spec in shared/content/architecture. */
  diagram?: string;
  sources?: string[];
  verified?: boolean;
}

export interface JsonEducation {
  institution: string;
  degree: string;
  period: string;
  grade?: string;
  courses: { name: string; grade?: string }[];
}

export interface JsonLeadership {
  role: string;
  org: string;
  period: string;
  description?: string;
}

export interface JsonSkills {
  groups: { name: string; items: string[] }[];
  /** Skills with the work they were used in. */
  highlights: { name: string; area: string; evidence: string }[];
  /** Flat tool list with optional icon URLs (older editions). */
  tools: { name: string; icon?: string }[];
}

export interface JsonSource {
  label: string;
  kind: SourceKind;
  url?: string;
}

export interface JsonGitHub {
  stats: {
    totalPublicRepos?: number;
    totalStars?: number;
    totalForks?: number;
    totalCommits?: number | string;
    totalContributions?: number;
    contributionsAsOf?: string;
    contributionsSince?: number;
    featuredRepos?: number;
  };
  user?: Record<string, unknown>;
  repositories: Record<string, unknown>[];
  languageStats?: unknown;
  contributions?: unknown[];
  recentActivity?: unknown[];
}

export interface PortfolioJson {
  schemaVersion: 2;
  /** Date of the last content review, YYYY-MM-DD. */
  updated: string;
  profile: JsonProfile;
  experience: JsonExperience[];
  projects: JsonProject[];
  education: JsonEducation[];
  recognition: string[];
  leadership: JsonLeadership[];
  skills: JsonSkills;
  sources: Record<string, JsonSource>;
  github: JsonGitHub;
}
