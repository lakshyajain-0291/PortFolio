import { useLayoutEffect, useRef } from 'react';
import { ArrowRight, FileText } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { SECTION_NUMBERS } from '@/config/env';
import { PROFILE } from '../../shared/content/curated/profile';
import { useGitHubDataset } from '../../shared/github/useGitHubDataset';
import { gsap, SplitText } from './t1/gsap';
import { align } from './t1/layout';

// The hero paints from curated PROFILE, so there is no loading state to show.
const [FIRST_NAME, ...REST_NAME] = PROFILE.name.trim().split(/\s+/);
const AVAILABILITY = `${PROFILE.institution}, graduating ${PROFILE.graduationYear}. Open to new-grad backend and infrastructure roles.`;

const Hero = () => {
  const { portfolio } = usePortfolio();
  const { dataset } = useGitHubDataset();
  const sectionRef = useRef<HTMLElement>(null);
  const a = align(SECTION_NUMBERS.HERO);
  const centred = a.side === 'center';
  const resumeUrl = portfolio?.resumeUrl || PROFILE.resumeUrl;
  // Sentence breaks only where a capital follows, so "14.0" stays intact.
  const aboutSentences = (portfolio?.personalInfo?.about ?? '').split(/(?<=[.!?])\s+(?=[A-Z])/);
  const aboutLead = aboutSentences.slice(0, 2).join(' ');
  const aboutRest = aboutSentences.slice(2).join(' ');

  useLayoutEffect(() => {
    const root = sectionRef.current;
    if (!root) return;

    let cancelled = false;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const intro = root.querySelectorAll('h1, [data-hero-in], [data-hero-rule]');
        // Hold the intro until the display face has loaded, so SplitText measures
        // Rajdhani rather than the fallback.
        gsap.set(intro, { autoAlpha: 0 });
        (document.fonts?.ready ?? Promise.resolve()).then(() => {
          if (cancelled) return;
          ctx.add(() => {
            gsap.set(intro, { autoAlpha: 1 });
            const split = SplitText.create(root.querySelectorAll('[data-hero-name]'), { type: 'chars', mask: 'chars' });
            gsap
              .timeline({ defaults: { ease: 'expo.out' } })
              .from(split.chars, { yPercent: 115, duration: 1.2, stagger: 0.04 })
              .from('[data-hero-in]', { y: 28, autoAlpha: 0, duration: 1, stagger: 0.09 }, '-=0.9')
              .from('[data-hero-rule]', { scaleX: 0, transformOrigin: 'left center', duration: 1.2 }, '<');
          });
        });

        // As the reader leaves the hero, the copy lifts and thins out of the scene's way.
        gsap.to('[data-hero-content]', {
          yPercent: -14,
          autoAlpha: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
    }, root);

    return () => {
      cancelled = true;
      ctx.revert();
    };
  }, []);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center pb-24 pt-32"
      data-section-number={SECTION_NUMBERS.HERO !== 0 ? SECTION_NUMBERS.HERO : 0}
    >
      <div className="container relative z-[1] mx-auto px-4">
        <div
          data-hero-content
          className={`relative isolate flex w-full flex-col md:w-4/5 ${a.block} ${a.items} ${a.text}`}
        >
          {centred && <div aria-hidden="true" className="t1-hero-scrim" />}

          <h1 className="font-rajdhani text-[clamp(3.6rem,12vw,9.5rem)] font-bold uppercase leading-[0.82] tracking-[-0.02em]">
            <span className="sr-only">{PROFILE.name}</span>
            <span aria-hidden="true" data-hero-name className="block">
              {FIRST_NAME}
            </span>
            {REST_NAME.length > 0 && (
              <span aria-hidden="true" data-hero-name className="block text-darktech-neon-green">
                {REST_NAME.join(' ')}
              </span>
            )}
          </h1>

          <p data-hero-in className="mt-6 font-rajdhani text-2xl font-semibold text-darktech-text sm:text-3xl">
            {PROFILE.role}
          </p>
          <p data-hero-in className="mt-3 text-sm text-darktech-text/80 sm:text-base">
            {AVAILABILITY}
          </p>

          <div data-hero-rule className={`my-8 h-px w-full max-w-2xl bg-darktech-border ${a.push}`} />

          <p data-hero-in className={`max-w-2xl text-base leading-relaxed text-darktech-text/85 sm:text-lg ${a.push}`}>
            {aboutLead}
            {aboutRest && <span className="hidden sm:inline"> {aboutRest}</span>}
          </p>

          <div data-hero-in className={`mt-8 flex flex-wrap items-center gap-3 ${a.justify}`}>
            <a
              href={resumeUrl}
              className="inline-flex items-center gap-2.5 rounded-[3px] bg-darktech-neon-green px-6 py-3.5 font-semibold text-darktech-background transition-colors hover:bg-darktech-neon-green/90"
            >
              <FileText size={18} />
              Resume (PDF)
            </a>
            <a
              href="#projects"
              className="group inline-flex items-center gap-2.5 rounded-[3px] border border-darktech-border bg-darktech-background/40 px-6 py-3.5 font-medium backdrop-blur transition-colors hover:border-darktech-neon-green/60"
            >
              View projects
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
            <a href="#contact" className="t1-link inline-flex items-center px-3 py-3.5">
              Contact
            </a>
          </div>

          {dataset.hasData && (
            <p data-hero-in className="mt-12 max-w-2xl text-sm text-darktech-muted">
              Every column in the field behind this text is one of my repositories: height is commits, glow is stars.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
