import type { PortfolioJson } from './schema';
import type { RawPortfolio } from './raw';

/**
 * The older editions (templates 0 to 3) were written against the first
 * portfolio.json shape. This maps the v2 file onto that shape so they keep
 * working, with a few additions they now read: profile `about`, and a
 * project's `role`, `status` and `headline` metric.
 */
export interface LegacyPortfolio extends RawPortfolio {
  personalInfo: NonNullable<RawPortfolio['personalInfo']> & { about?: string; institution?: string };
  projects: Array<
    NonNullable<RawPortfolio['projects']>[number] & {
      headline?: { value: string; unit?: string; label: string; kind: string; method?: string };
      slug?: string;
    }
  >;
  socialLinks: Record<string, string | undefined>;
  techStack: { name: string; icon?: string; category?: string }[];
  insights: { topSkills: { name: string; category: string; justification: string }[] };
  [key: string]: unknown;
}

const urlOf = (links: { kind: string; url: string }[], kind: string) => links.find((l) => l.kind === kind)?.url;

export function isV2(json: unknown): json is PortfolioJson {
  return Boolean(json && typeof json === 'object' && (json as { schemaVersion?: unknown }).schemaVersion === 2);
}

export function toLegacy(v: PortfolioJson): LegacyPortfolio {
  const p = v.profile;
  return {
    personalInfo: {
      name: p.name,
      title: p.role,
      summary: p.summary,
      about: p.about,
      availability: p.availability,
      graduationYear: p.graduationYear,
      institution: p.institution,
      email: p.email,
      collegeEmail: p.collegeEmail,
      phone: p.phone,
      location: p.location,
    },
    socialLinks: { ...p.links, email: p.email, collegeEmail: p.collegeEmail, phone: p.phone },
    resumeUrl: p.resume,
    experience: v.experience.map((e) => ({
      company: e.org,
      title: e.title,
      dates: `${e.start} - ${e.end}`,
      location: e.location,
      link: e.links.find((l) => l.kind !== 'repo')?.url,
      github: urlOf(e.links, 'repo'),
      achievements: e.points,
    })),
    education: v.education.map((e) => ({ institution: e.institution, degree: e.degree, dates: e.period, cgpa: e.grade })),
    coursework: (v.education[0]?.courses ?? []).map((c) => ({ course: c.name, grade: c.grade ?? null })),
    projects: v.projects.map((pr) => {
      const head = pr.metrics?.[0];
      return {
        id: pr.slug,
        slug: pr.slug,
        title: pr.title,
        description: pr.description,
        technologies: pr.stack,
        github: urlOf(pr.links, 'repo'),
        demo: urlOf(pr.links, 'demo') ?? urlOf(pr.links, 'store') ?? urlOf(pr.links, 'website'),
        featured: pr.featured ?? pr.tier !== 'other',
        role: pr.role,
        status: pr.status,
        headline: head ? { value: head.value, unit: head.unit, label: head.label, kind: head.kind, method: head.method } : undefined,
      };
    }),
    skills: v.skills.groups.map((g) => `${g.name}: ${g.items.join(', ')}`),
    techStack: v.skills.tools,
    insights: { topSkills: v.skills.highlights.map((h) => ({ name: h.name, category: h.area, justification: h.evidence })) },
    achievements: v.recognition,
    leadership: v.leadership.map((l) => ({ role: l.role, organization: l.org, duration: l.period, description: l.description })),
    githubStats: v.github.stats,
    githubData: {
      user: v.github.user as NonNullable<RawPortfolio['githubData']>['user'],
      repositories: v.github.repositories as NonNullable<RawPortfolio['githubData']>['repositories'],
      languageStats: v.github.languageStats as NonNullable<RawPortfolio['githubData']>['languageStats'],
      contributions: v.github.contributions as NonNullable<RawPortfolio['githubData']>['contributions'],
      recentActivity: v.github.recentActivity as NonNullable<RawPortfolio['githubData']>['recentActivity'],
    },
    lastUpdated: v.updated,
  };
}
