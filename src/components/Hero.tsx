import { useLayoutEffect, useRef } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { DEFAULT_USER, SECTION_NUMBERS } from '@/config/env';
import { useGitHubDataset } from '../../shared/github/useGitHubDataset';
import { gsap, SplitText } from './t1/gsap';
import { align } from './t1/layout';

const SECTION_IDS: Record<string, string> = {
  EXPERIENCE: 'experience',
  PROJECTS: 'projects',
  GITHUB_STATS: 'github-stats',
  TECH_STACK: 'tech-stack',
  EDUCATION: 'education',
  CONTACT: 'contact',
};

// The section that follows the hero in SECTION_NUMBERS order.
const nextSectionId =
  Object.entries(SECTION_IDS)
    .map(([key, id]) => ({ id, order: SECTION_NUMBERS[key as keyof typeof SECTION_NUMBERS] }))
    .filter((s) => s.order >= SECTION_NUMBERS.HERO)
    .sort((a, b) => a.order - b.order)[0]?.id ?? 'projects';

const Hero = () => {
  const { portfolio, isLoading } = usePortfolio();
  const { dataset } = useGitHubDataset();
  const sectionRef = useRef<HTMLElement>(null);
  const a = align(SECTION_NUMBERS.HERO);

  const name = portfolio?.personalInfo?.name || DEFAULT_USER.NAME;
  const title = portfolio?.personalInfo?.title || DEFAULT_USER.TITLE;
  const bio = portfolio?.personalInfo?.summary || DEFAULT_USER.BIO;
  const resumeUrl = portfolio?.resumeUrl || '/resume/resume.pdf';
  const [first, ...rest] = name.trim().split(/\s+/);
  const topLanguage = dataset.languages[0];

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root || isLoading) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const split = SplitText.create(root.querySelectorAll('[data-hero-name]'), { type: 'chars', mask: 'chars' });
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .from(split.chars, { yPercent: 115, duration: 1.2, stagger: 0.04 })
          .from('[data-hero-in]', { y: 28, autoAlpha: 0, duration: 1, stagger: 0.09 }, '-=0.9')
          .from('[data-hero-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.2 }, '<');

        // As the reader leaves the hero, the copy lifts and thins out of the scene's way.
        gsap.to('[data-hero-content]', {
          yPercent: -14,
          autoAlpha: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }, root);

    return () => ctx.revert();
  }, [isLoading, name]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center pb-24 pt-32"
      data-section-number={SECTION_NUMBERS.HERO !== 0 ? SECTION_NUMBERS.HERO : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        {isLoading ? (
          <p className="t1-label animate-pulse">booting profile…</p>
        ) : (
          <div data-hero-content className={`flex w-full flex-col md:w-4/5 ${a.block} ${a.items} ${a.text}`}>
            <p data-hero-in className={`t1-label mb-8 flex items-center gap-3 ${a.justify}`}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-darktech-neon-green opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-darktech-neon-green" />
              </span>
              <span className="text-darktech-text">{title}</span>
            </p>

            <h1 className="font-rajdhani text-[clamp(3.6rem,12vw,9.5rem)] font-bold uppercase leading-[0.82] tracking-[-0.02em]">
              <span className="sr-only">{name}</span>
              <span aria-hidden="true" data-hero-name className="block">
                {first}
              </span>
              {rest.length > 0 && (
                <span aria-hidden="true" data-hero-name className="block text-darktech-neon-green">
                  {rest.join(' ')}
                </span>
              )}
            </h1>

            <p data-hero-in className="mt-6 font-rajdhani text-2xl font-semibold text-darktech-text/80 sm:text-3xl">
              Building the Future with Dev and AI
            </p>

            <div data-hero-rule className={`my-8 h-px w-full max-w-2xl bg-darktech-border ${a.push}`} />

            <div data-hero-in className={`t1-panel max-w-2xl p-6 text-left ${a.push}`}>
              <p className="t1-label mb-3">readme.md</p>
              <p className="text-base leading-relaxed text-darktech-text/85 sm:text-lg">{bio}</p>
            </div>

            <div data-hero-in className={`mt-8 flex flex-wrap items-center gap-3 ${a.justify}`}>
              <a
                href="#projects"
                className="group inline-flex items-center gap-3 rounded-[3px] bg-darktech-neon-green px-6 py-3.5 font-semibold text-darktech-background transition-colors hover:bg-darktech-neon-green/90"
              >
                View projects
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-[3px] border border-darktech-border bg-darktech-background/40 px-6 py-3.5 font-medium backdrop-blur transition-colors hover:border-darktech-neon-green/60"
              >
                Contact
              </a>
              <a href={resumeUrl} download className="t1-link inline-flex items-center gap-2 px-3 py-3.5 text-sm">
                <FileText size={16} />
                Resume
              </a>
            </div>

            {dataset.hasData && (
              <div data-hero-in className={`mt-12 flex max-w-2xl flex-col gap-2 ${a.items}`}>
                <p className="t1-num flex flex-wrap gap-x-5 gap-y-1 text-sm text-darktech-text">
                  <span><b className="font-medium text-darktech-neon-green">{dataset.totals.repos}</b> repos</span>
                  <span><b className="font-medium text-darktech-neon-green">{dataset.totals.stars}</b> stars</span>
                  <span><b className="font-medium text-darktech-neon-green">{dataset.totals.commitsLabel}</b> commits</span>
                  {topLanguage && (
                    <span>
                      <b className="font-medium text-darktech-neon-green">{topLanguage.name}</b> {topLanguage.percent}%
                    </span>
                  )}
                </p>
                <p className="t1-label normal-case tracking-normal">
                  ↳ every column in the field behind this text is one of my repositories — height is commits, glow is stars.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <a
        href={`#${nextSectionId}`}
        className="t1-label absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
        aria-label="Scroll to next section"
      >
        scroll
        <span className="block h-10 w-px overflow-hidden bg-darktech-border">
          <span className="block h-1/2 w-px bg-darktech-neon-green motion-safe:animate-[t1-scroll-cue_1.8s_ease-in-out_infinite]" />
        </span>
      </a>
    </section>
  );
};

export default Hero;
