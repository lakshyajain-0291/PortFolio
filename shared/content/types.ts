/**
 * PortfolioContent: the single view model the Atlas and Paper templates render.
 * Built by build.ts from portfolio.json plus the hand-verified curated modules.
 * Every published number carries its kind and source so a template can say
 * whether it was measured, targeted or self-reported.
 */
import type { GitHubDataset } from '../github/githubDataset';
import type { ArchitectureSpec } from './architecture/types';

export type SourceKind = 'resume' | 'cv' | 'readme' | 'report' | 'code' | 'repo-doc' | 'github-api' | 'owner' | 'paper';

export interface Source {
  id: string;
  label: string;
  kind: SourceKind;
  url?: string;
}

/**
 * measured:      produced by a test or benchmark (method says which)
 * target:        a design goal, not yet achieved or not measured
 * projected:     an estimate of a future effect
 * self-reported: stated by the owner without a public artifact
 * count:         a tally (visitors, posts, ranks, stars)
 */
export type MetricKind = 'measured' | 'target' | 'projected' | 'self-reported' | 'count';

export interface Metric {
  id: string;
  /** Display value without the unit, e.g. "220+", "4.2", "<50". */
  value: string;
  unit?: string;
  /** What the number is, read after the value: "tasks/sec scheduling throughput". */
  label: string;
  kind: MetricKind;
  /** How or where it was obtained: "50-node simulated cluster, 2,000-task batch". */
  method?: string;
  source: string;
  verified: boolean;
}

export type LinkKind = 'repo' | 'demo' | 'website' | 'store' | 'report' | 'resume' | 'profile';
export type LinkStatus = 'live' | 'offline' | 'unchecked';

export interface Link {
  label: string;
  url: string;
  kind: LinkKind;
  status: LinkStatus;
  checkedAt?: string;
}

export interface Period {
  start: string;
  end: string;
  current: boolean;
}

export interface CaseStudy {
  slug: string;
  title: string;
  /** One sentence: what it is. */
  summary: string;
  problem: string;
  approach: string[];
  outcomes: Metric[];
  stack: string[];
  role: string;
  /** Course, programme or event the work belongs to, if any. */
  context?: string;
  period?: string;
  links: Link[];
  /** Matches a diagram in PortfolioContent.diagrams once its spec is confirmed. */
  diagramId?: string;
  /** 'system': gets an architecture diagram. 'supporting': text case study only. */
  tier: 'system' | 'supporting';
  /** owner/name of the matching GitHub repo, used to merge repo stats. */
  repo?: string;
  /** Filled by build.ts from the GitHub data when `repo` matches. */
  repoFacts?: RepoFacts;
  sources: string[];
  verified: boolean;
}

export interface RepoFacts {
  stars: number;
  forks: number;
  commits: number;
  language: string;
}

export interface Role {
  org: string;
  title: string;
  period: Period;
  location?: string;
  points: string[];
  links: Link[];
}

export interface ProjectSummary {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  role?: string;
  status?: 'offline';
  links: Link[];
  repo?: RepoFacts;
}

export interface LeadershipRole {
  role: string;
  org: string;
  period: string;
  description?: string;
}

export interface Course {
  name: string;
  grade?: string;
}

export interface Education {
  institution: string;
  degree: string;
  period: string;
  grade?: string;
  courses: Course[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface Profile {
  name: string;
  role: string;
  /** First-person introduction. */
  about: string;
  summary: string;
  availability: string;
  graduationYear?: number;
  institution: string;
  location: string;
  email: string;
  links: {
    github?: Link;
    linkedin?: Link;
    website?: Link;
    codeforces?: Link;
    resume: Link;
  };
}

export interface CodeRecord {
  dataset: GitHubDataset;
  contributions?: { total: number; commits: number; since: number; asOf: string };
  /** Language shares in GitHub data are shares of repository count, not of code. */
  languageBasis: 'repository count';
}

export interface PortfolioContent {
  profile: Profile;
  caseStudies: CaseStudy[];
  otherProjects: ProjectSummary[];
  experience: Role[];
  education: Education[];
  recognition: { awards: string[]; leadership: LeadershipRole[] };
  skills: SkillGroup[];
  code: CodeRecord;
  diagrams: Record<string, ArchitectureSpec>;
  sources: Record<string, Source>;
  /** Ids of items that are not yet verified. Hidden unless showUnverified (dev only). */
  unverified: string[];
  showUnverified: boolean;
}
