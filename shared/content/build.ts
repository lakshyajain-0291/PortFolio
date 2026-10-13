/**
 * buildContent(json) -> PortfolioContent. Pure: no fetching, no React, no DOM.
 *
 * portfolio.json (schema v2, see schema.ts) is the single source of truth.
 * This adds what the file only references: the architecture diagrams, live
 * repository facts and the GitHub dataset. Anything marked `verified: false`
 * is hidden unless `includeUnverified` is set (development only).
 */
import { buildGitHubDataset } from '../github/githubDataset';
import { DIAGRAMS } from './architecture';
import { toLegacy } from './legacy';
import type { RawGithubRepo } from './raw';
import type { JsonLink, PortfolioJson } from './schema';
import type { CaseStudy, Link, PortfolioContent, ProjectSummary, RepoFacts, Source } from './types';

export interface BuildOptions {
  includeUnverified?: boolean;
}

/** "https://github.com/Owner/Repo/..." -> "owner/repo" */
export function repoKey(url?: string | null): string | null {
  const m = url?.match(/github\.com\/([^/?#]+)\/([^/?#]+)/i);
  return m ? `${m[1]}/${m[2].replace(/\.git$/, '')}`.toLowerCase() : null;
}

const link = (l: JsonLink): Link => ({ ...l, status: l.status ?? 'unchecked' });

const profileLink = (url: string | undefined, label: string): Link | undefined =>
  url ? { label, url, kind: 'profile', status: label === 'Codeforces' ? 'unchecked' : 'live' } : undefined;

function factsOf(repo?: RawGithubRepo): RepoFacts | undefined {
  if (!repo) return undefined;
  return {
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    commits: typeof repo.commits === 'number' ? repo.commits : 0,
    language: repo.language ?? 'Other',
  };
}

export function buildContent(json: PortfolioJson, options: BuildOptions = {}): PortfolioContent {
  const include = options.includeUnverified ?? false;
  const unverified: string[] = [];
  const keep = (id: string, verified?: boolean) => {
    if (verified === false) unverified.push(id);
    return verified !== false || include;
  };

  const repoIndex = new Map<string, RawGithubRepo>();
  (json.github.repositories as RawGithubRepo[]).forEach((r) => {
    const key = repoKey(r.html_url) ?? (r.full_name ? r.full_name.toLowerCase() : null);
    if (key) repoIndex.set(key, r);
  });
  const facts = (repo?: string) => (repo ? factsOf(repoIndex.get(repo.toLowerCase())) : undefined);

  const caseStudies: CaseStudy[] = json.projects
    .filter((p) => p.tier !== 'other' && keep(`project:${p.slug}`, p.verified))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      problem: p.problem ?? '',
      approach: p.approach ?? [],
      outcomes: (p.metrics ?? [])
        .filter((m) => keep(`metric:${m.id}`, m.verified))
        .map((m) => ({ ...m, verified: m.verified !== false })),
      stack: p.stack,
      role: p.role ?? '',
      context: p.context,
      period: p.period,
      links: p.links.map(link),
      diagramId: p.diagram,
      tier: p.tier === 'system' ? 'system' : 'supporting',
      repo: p.repo,
      repoFacts: facts(p.repo),
      sources: p.sources ?? [],
      verified: p.verified !== false,
    }));

  const otherProjects: ProjectSummary[] = json.projects
    .filter((p) => p.tier === 'other' && keep(`project:${p.slug}`, p.verified))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.description || p.summary,
      stack: p.stack,
      role: p.role,
      status: p.status,
      links: p.links.map(link),
      repo: facts(p.repo),
    }));

  const diagrams = Object.fromEntries(
    DIAGRAMS.filter((d) => keep(`diagram:${d.id}`, d.confirmed)).map((d) => [d.id, d]),
  );

  const sources: Record<string, Source> = Object.fromEntries(
    Object.entries(json.sources).map(([id, s]) => [id, { id, ...s }]),
  );

  const p = json.profile;
  const stats = json.github.stats;
  const contributions =
    typeof stats.totalContributions === 'number' && stats.totalCommits !== undefined
      ? {
          total: stats.totalContributions,
          commits: Number(String(stats.totalCommits).replace(/[^\d]/g, '')) || 0,
          since: stats.contributionsSince ?? 0,
          asOf: stats.contributionsAsOf ?? '',
        }
      : undefined;

  return {
    profile: {
      name: p.name,
      role: p.role,
      about: p.about,
      summary: p.summary,
      availability: p.availability,
      graduationYear: p.graduationYear,
      institution: p.institution,
      location: p.location,
      email: p.email,
      links: {
        github: profileLink(p.links.github, 'GitHub'),
        linkedin: profileLink(p.links.linkedin, 'LinkedIn'),
        website: profileLink(p.links.website, 'Website'),
        codeforces: profileLink(p.links.codeforces, 'Codeforces'),
        resume: { label: 'Resume (PDF)', url: p.resume, kind: 'resume', status: 'live' },
      },
    },
    caseStudies,
    otherProjects,
    experience: json.experience.map((e) => ({
      org: e.org,
      title: e.title,
      period: { start: e.start, end: e.end, current: /present/i.test(e.end) },
      location: e.location,
      points: e.points,
      links: e.links.map(link),
    })),
    education: json.education.map((e) => ({ ...e, grade: e.grade })),
    recognition: { awards: json.recognition, leadership: json.leadership },
    skills: json.skills.groups,
    code: { dataset: buildGitHubDataset(toLegacy(json)), contributions, languageBasis: 'repository count' },
    diagrams,
    sources,
    unverified,
    showUnverified: include,
  };
}
