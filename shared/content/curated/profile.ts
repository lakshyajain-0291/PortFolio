/**
 * Painted before portfolio.json arrives, so the first screen never waits on a
 * fetch. Keep these in step with `profile` in public/data/portfolio.json, which
 * is the source of truth for everything else.
 */
export const PROFILE = {
  name: 'Lakshya Jain',
  role: 'Backend & Distributed Systems Engineer',
  institution: 'IIT Jodhpur',
  graduationYear: 2027,
  resumeUrl: '/resume/resume.pdf',
} as const;
