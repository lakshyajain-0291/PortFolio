/**
 * One dataset, three renderings.
 *
 * Pure functions that normalise the GitHub-related parts of the portfolio data
 * (githubStats + githubData + github-sourced projects) into a single shape that
 * every template renders in its own way. Nothing here fetches; it only reads the
 * PortfolioData object already loaded by PortfolioContext.
 */
import type { PortfolioData } from '../../src/lib/portfolioStorage';

export interface RepoStat {
  name: string;
  url: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  commits: number;
  topics: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface LanguageShare {
  name: string;
  /** 0–100 */
  percent: number;
  repoCount: number;
}

export interface ContributionPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ActivityEvent {
  repo: string;
  type: string;
  ref: string;
  at: Date | null;
}

export interface GitHubTotals {
  repos: number;
  stars: number;
  forks: number;
  commits: number;
  /** Original label, e.g. "2800+" — keep the author's own rounding when present */
  commitsLabel: string;
  followers: number;
  following: number;
}

export interface GitHubDataset {
  username: string | null;
  profileUrl: string | null;
  avatarUrl: string | null;
  bio: string;
  memberSince: Date | null;
  totals: GitHubTotals;
  /** Sorted by commits (desc), then stars */
  repos: RepoStat[];
  /** Sorted by percent (desc) */
  languages: LanguageShare[];
  /** Oldest → newest */
  contributions: ContributionPoint[];
  contributionTotal: number;
  activeDays: number;
  longestStreak: number;
  /** Newest first */
  activity: ActivityEvent[];
  hasData: boolean;
}

/** Parses counts that may arrive as "2800+", "1.2k" or plain numbers. */
export function parseCount(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const match = value.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*([kKmM])?/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase();
  return Math.round(unit === 'k' ? n * 1_000 : unit === 'm' ? n * 1_000_000 : n);
}

export function toDate(value: unknown): Date | null {
  if (!value || (typeof value !== 'string' && !(value instanceof Date))) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function extractGithubUsername(url?: string | null): string | null {
  if (!url) return null;
  const match = url.match(/github\.com\/([^/?#]+)/);
  return match ? match[1] : null;
}

const repoNameFromUrl = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/github\.com\/[^/]+\/([^/?#]+)/);
  return match ? match[1].replace(/\.git$/, '') : null;
};

// Loose shapes of the raw JSON — the stored data is not strictly typed.
interface RawRepo {
  name?: string;
  html_url?: string;
  description?: string;
  language?: string;
  stargazers_count?: number;
  forks_count?: number;
  commits?: number | string;
  topics?: string[];
  created_at?: string;
  updated_at?: string;
}

interface RawGithubData {
  user?: {
    login?: string;
    html_url?: string;
    avatar_url?: string;
    bio?: string;
    followers?: number;
    following?: number;
    created_at?: string;
    public_repos?: number;
  };
  repositories?: RawRepo[];
  languageStats?: Record<string, number>;
  contributions?: Array<{ date?: string; count?: number }>;
  recentActivity?: Array<{ repo?: string; type?: string; created_at?: string; payload?: { ref?: string } }>;
}

function reposFromRaw(raw: RawGithubData | undefined): RepoStat[] {
  return (raw?.repositories ?? [])
    .filter((r): r is RawRepo & { name: string } => Boolean(r?.name))
    .map((r) => ({
      name: r.name,
      url: r.html_url ?? '',
      description: r.description ?? '',
      language: r.language || 'Other',
      stars: parseCount(r.stargazers_count),
      forks: parseCount(r.forks_count),
      commits: parseCount(r.commits),
      topics: r.topics ?? [],
      createdAt: toDate(r.created_at),
      updatedAt: toDate(r.updated_at),
    }));
}

/** Fallback when githubData is absent (e.g. data fetched fresh from the API). */
function reposFromProjects(portfolio: PortfolioData): RepoStat[] {
  return (portfolio.projects ?? [])
    .filter((p) => p.source === 'github' || /github\.com/.test(p.github ?? ''))
    .map((p) => ({
      name: repoNameFromUrl(p.github) ?? p.title ?? 'repository',
      url: p.github ?? '',
      description: p.description ?? '',
      language: p.technologies?.[0] || 'Other',
      stars: parseCount(p.stars),
      forks: parseCount(p.forks),
      commits: parseCount(p.commits),
      topics: p.topics ?? [],
      createdAt: toDate(p.timeline?.created_at),
      updatedAt: toDate(p.timeline?.updated_at),
    }));
}

function languagesFrom(raw: RawGithubData | undefined, repos: RepoStat[]): LanguageShare[] {
  const repoCounts = new Map<string, number>();
  repos.forEach((r) => repoCounts.set(r.language, (repoCounts.get(r.language) ?? 0) + 1));

  const stats = raw?.languageStats;
  if (stats && Object.keys(stats).length > 0) {
    return Object.entries(stats)
      .map(([name, percent]) => ({ name, percent: Number(percent) || 0, repoCount: repoCounts.get(name) ?? 0 }))
      .sort((a, b) => b.percent - a.percent);
  }

  const total = repos.length || 1;
  return [...repoCounts.entries()]
    .map(([name, count]) => ({ name, percent: Math.round((count / total) * 1000) / 10, repoCount: count }))
    .sort((a, b) => b.percent - a.percent);
}

function contributionsFrom(raw: RawGithubData | undefined): ContributionPoint[] {
  return (raw?.contributions ?? [])
    .filter((c) => typeof c?.date === 'string')
    .map((c) => ({ date: c.date as string, count: parseCount(c.count) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function longestStreakOf(points: ContributionPoint[]): number {
  let best = 0;
  let run = 0;
  points.forEach((p) => {
    run = p.count > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  });
  return best;
}

const EMPTY_TOTALS: GitHubTotals = {
  repos: 0,
  stars: 0,
  forks: 0,
  commits: 0,
  commitsLabel: '0',
  followers: 0,
  following: 0,
};

export function buildGitHubDataset(portfolio: PortfolioData | null | undefined): GitHubDataset {
  if (!portfolio) {
    return {
      username: null,
      profileUrl: null,
      avatarUrl: null,
      bio: '',
      memberSince: null,
      totals: EMPTY_TOTALS,
      repos: [],
      languages: [],
      contributions: [],
      contributionTotal: 0,
      activeDays: 0,
      longestStreak: 0,
      activity: [],
      hasData: false,
    };
  }

  const raw = portfolio.githubData as RawGithubData | undefined;
  const stats = portfolio.githubStats ?? {};

  const rawRepos = reposFromRaw(raw);
  const repos = (rawRepos.length > 0 ? rawRepos : reposFromProjects(portfolio)).sort(
    (a, b) => b.commits - a.commits || b.stars - a.stars,
  );

  const sum = (key: 'stars' | 'forks' | 'commits') => repos.reduce((acc, r) => acc + r[key], 0);
  const commitsRaw = (stats as { totalCommits?: unknown }).totalCommits;
  const commits = parseCount(commitsRaw) || sum('commits');

  const contributions = contributionsFrom(raw);
  const profileUrl = raw?.user?.html_url ?? portfolio.socialLinks?.github ?? null;

  const totals: GitHubTotals = {
    repos: parseCount(stats.totalPublicRepos) || parseCount(raw?.user?.public_repos) || repos.length,
    stars: parseCount(stats.totalStars) || sum('stars'),
    forks: parseCount(stats.totalForks) || sum('forks'),
    commits,
    commitsLabel: typeof commitsRaw === 'string' && commitsRaw.trim() ? commitsRaw.trim() : formatCompact(commits),
    followers: parseCount(raw?.user?.followers),
    following: parseCount(raw?.user?.following),
  };

  const activity: ActivityEvent[] = (raw?.recentActivity ?? [])
    .map((e) => ({
      repo: e.repo ?? '',
      type: e.type ?? 'Event',
      ref: (e.payload?.ref ?? '').replace('refs/heads/', ''),
      at: toDate(e.created_at),
    }))
    .sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0));

  return {
    username: raw?.user?.login ?? extractGithubUsername(profileUrl),
    profileUrl,
    avatarUrl: raw?.user?.avatar_url ?? null,
    bio: raw?.user?.bio ?? '',
    memberSince: toDate(raw?.user?.created_at),
    totals,
    repos,
    languages: languagesFrom(raw, repos),
    contributions,
    contributionTotal: contributions.reduce((acc, c) => acc + c.count, 0),
    activeDays: contributions.filter((c) => c.count > 0).length,
    longestStreak: longestStreakOf(contributions),
    activity,
    hasData: repos.length > 0 || totals.repos > 0,
  };
}

/* ── formatting helpers shared by all templates ─────────────────────────── */

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 10_000) return `${Math.round(n / 1_000)}k`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

export function formatMonthYear(date: Date | null): string {
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function relativeTime(date: Date | null, now: Date = new Date()): string {
  if (!date) return '';
  const days = Math.round((now.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30.4);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}
