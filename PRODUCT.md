# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Lakshya Jain's personal portfolio, live at https://me.lakshy.tech. Two visitor groups matter, in this order of time pressure:

- **Recruiters skimming.** Recruiters and HR screening candidates, often in about a minute. Their job is to decide whether to shortlist. They need role, current/recent experience, education, and the resume within seconds, without needing to understand the presentation.
- **Engineers judging depth.** Hiring managers and interviewers checking whether the systems work is real. Their job is to verify claims: architecture, scale numbers, ownership, and code (GitHub). They will read further, follow links, and probe.

The open-source repo ("LiveInsight") is a side benefit. Developers who fork it are not the audience design decisions serve.

## Product Purpose

Present Lakshya as a backend and distributed systems engineer whose work holds up under scrutiny, and turn visits into shortlists, interviews, and conversations. The portfolio stays current on its own: resume and GitHub data feed one `portfolio.json`, which drives everything on screen.

Success: a recruiter leaves knowing who Lakshya is, what Lakshya has built, and how to get the resume or make contact. An engineer leaves convinced the depth is real. The site should also be distinctive enough to be remembered as Lakshya's own.

## Positioning

A portfolio that is itself a working system. It is generated from real resume and GitHub data, and the GitHub numbers are computed rather than typed in by hand. The work it shows is measured (load-tested concurrency, latency percentiles, cost reductions, ADR counts), not adjectives. The presentation can prove engineering competence directly, not just describe it.

## Operating Context

- Visitors arrive from resume links, LinkedIn, applications, and direct shares, on desktop and on phones.
- Recruiters may only scan the first screen. Engineers open GitHub repos, the resume PDF, and project links in other tabs.
- Content is updated by editing `public/data/portfolio.json` (schema v2, typed in `shared/content/schema.ts`). The owner maintains it by hand from the resume, project papers and reports; there is no AI regeneration.
- Deployed as a static SPA on Vercel. No backend is needed to serve the site.

## Capabilities and Constraints

- **Single data contract.** Everything renders from `public/data/portfolio.json` (schema v2): profile, experience, projects (tiered system / supporting / other, with case-study fields and metrics that name their kind and source), education, recognition, leadership, skills, sources and a GitHub snapshot. Diagram specs stay in `shared/content/architecture/` and are referenced by id. The Paper and Atlas read it through `shared/content/build.ts`; the older editions through `shared/content/legacy.ts`. GitHub figures go through `shared/github` so every surface shows the same numbers. Layouts must tolerate different lengths and counts.
- **Template set is open (explicitly undecided).** Templates are selected via `?template=` / `VITE_TEMPLATE_NUMBER`; with neither set, the Systems Paper is the default (owner decision, 2026-10-13): the dark tech look in `src/` (`0` and `1`), editorial (`2`, `src2/`), terminal (`3`, `src3/`), the Engineering Atlas (`atlas`, `templates/atlas/`) and the Systems Paper (`paper`, `templates/paper/`). Atlas and Paper render from the typed content model in `shared/content/`. None of them is fixed. Future work may add a template, replace one entirely, or merge them into one. The deciding question is whatever makes this portfolio the strongest and most unique for Lakshya. The default landing template is also undecided.
- **Bundle isolation.** Heavy dependencies (three.js, GSAP, Lenis) stay inside the template that uses them, and three.js loads lazily. Other surfaces do not pay for them.
- **Resume download** (`/resume/resume.pdf`) and **portfolio.json download** are existing functions.
- **Stack:** React 18 + TypeScript + Vite, Tailwind with shadcn/ui primitives, Framer Motion, GSAP, React Three Fiber.

## Brand Commitments

- Name: Lakshya Jain. Current title in data: "Backend & Distributed Systems Engineer". IIT Jodhpur, B.Tech CSE (2023–2027).
- The site must be unique to Lakshya and must not read as a generic developer-portfolio template. This is the user's own stated goal.
- No visual identity is binding. The three existing looks are evidence, not commitments.

## Evidence on Hand

- `public/data/portfolio.json`: 4 experience entries (26 Miles Capital quant developer intern, with metrics such as 500 concurrent users at p95 19 ms with zero errors and a projected 27% AWS cost reduction; libr founder; Inter IIT Tech Meet 14.0 domain lead; PMStack SDE intern), 14 projects (e.g. Mini-K8ts, FileNest, LIBR, GitCury), education (CGPA 8.97/10), 7 achievements (e.g. ranked 6th of 23 IITs at Inter IIT 14.0, head of Devlup Labs), 7 leadership roles, skills/tech stack, AI insights.
- GitHub data: 36 public repos, 39 stars, 28 forks, 2,949 contributions since 2023 (1,476 of them commits), language stats, 90 days of contributions, recent activity.
- Resume PDFs in `public/resume/`.
- Links: GitHub, LinkedIn, Codeforces, personal website, email.
- **Absent, do not fabricate:** no portrait photo or avatar (the owner removed it on 2026-10-13; `public/assets/` holds only a generic project placeholder), no project screenshots or images in the data, no testimonials or references, no press.

## Product Principles

1. **The shortlist answer comes first.** Role, recent experience, and the resume are reachable immediately on every surface. Spectacle never delays them.
2. **Proof over adjectives.** Lead with measured outcomes, real numbers, and links to code. Everything an engineer might probe should be verifiable.
3. **The site is evidence too.** Craft, performance, and engineering quality of the portfolio itself demonstrate the skills it claims.
4. **One truth, any presentation.** Content lives in the data, not the layout. Surfaces must survive regenerated content of varying shape.
5. **Distinctly Lakshya's.** Choose what is most memorable and true to Lakshya over what is conventional for portfolios.

## Accessibility & Inclusion

Existing commitments to keep: every animated layer honors `prefers-reduced-motion` (static fallbacks for WebGL, no scroll-jacking, instant output); text meets WCAG AA contrast; charts have a non-visual or table equivalent; focus states match hover states; heavy effects degrade on low-end devices or without WebGL.
