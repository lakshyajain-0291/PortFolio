import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Globe } from 'lucide-react';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { DEFAULT_USER, DEFAULT_SOCIAL } from '../../src/config/env';
import { NAV_ITEMS, useActiveSection } from '../sections';
import { PROFILE } from '../../shared/content/curated/profile';
import { leading, rule, typeset } from '../motion';

const Hero = () => {
  const { portfolio } = usePortfolio();
  const active = useActiveSection(NAV_ITEMS.map((n) => n.id));

  const name = portfolio?.personalInfo?.name || DEFAULT_USER.NAME;
  const title = portfolio?.personalInfo?.title || DEFAULT_USER.TITLE;
  const location = portfolio?.personalInfo?.location || DEFAULT_USER.LOCATION;
  const social = portfolio?.socialLinks ?? {};
  const email = social.email || portfolio?.personalInfo?.email || DEFAULT_USER.EMAIL;
  const resumeUrl = portfolio?.resumeUrl || PROFILE.resumeUrl;
  const latest = portfolio?.experience?.[0];
  const latestRole = latest ? [latest.title || latest.role, latest.company].filter(Boolean).join(', ') : '';

  const links = [
    { href: social.github || DEFAULT_SOCIAL.GITHUB_URL, label: 'GitHub', icon: Github },
    { href: social.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL, label: 'LinkedIn', icon: Linkedin },
    { href: `mailto:${email}`, label: 'Email', icon: Mail },
    ...(social.website ? [{ href: social.website, label: 'Website', icon: Globe }] : []),
  ];

  return (
    <header id="home" className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[42%] lg:flex-col lg:justify-between lg:py-24">
      <motion.div variants={leading(0.09, 0.1)} initial="hidden" animate="show">
        <h1 className="t2-display text-[clamp(2.75rem,6vw,4.5rem)] text-foreground">
          {name.split(/\s+/).map((word, i) => (
            <motion.span key={i} variants={typeset} className="mr-[0.22em] inline-block pb-[0.08em] last:mr-0">
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p variants={typeset} className="mt-4 text-lg font-medium tracking-tight text-foreground sm:text-xl">
          {title}
        </motion.p>
        <motion.p variants={typeset} className="t2-serif mt-4 max-w-sm text-lg italic leading-snug text-muted-foreground">
          {PROFILE.institution} · B.Tech CSE · Class of {PROFILE.graduationYear}
        </motion.p>
        {/* Always mounted with two lines reserved: the role arrives with the JSON and must not shift the page. */}
        <motion.p variants={typeset} className="t2-serif mt-1 min-h-[2lh] max-w-sm text-lg italic leading-snug text-muted-foreground">
          {latestRole ? <>Most recently {latestRole}</> : '\u00a0'}
        </motion.p>

        <nav className="mt-16 hidden lg:block" aria-label="In-page navigation">
          <ul className="w-max">
            {NAV_ITEMS.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="group flex items-center py-2.5" aria-current={isActive ? 'true' : undefined}>
                    <span
                      className={`mr-4 h-px transition-all duration-300 ease-out group-hover:w-16 group-hover:bg-foreground group-focus-visible:w-16 group-focus-visible:bg-foreground motion-reduce:transition-none ${
                        isActive ? 'w-16 bg-foreground' : 'w-8 bg-muted-foreground/60'
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.16em] transition-colors group-hover:text-foreground group-focus-visible:text-foreground ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </motion.div>

      <motion.div variants={leading(0.06, 0.6)} initial="hidden" animate="show" className="mt-10">
        <motion.span variants={rule} className="mb-6 block h-px w-24 origin-left bg-border" aria-hidden="true" />
        <ul className="-ml-3 flex flex-wrap items-center gap-x-1" aria-label="Elsewhere">
          {links.map(({ href, label, icon: Icon }) => (
            <li key={label}>
              {/* 44px hit area around a 20px glyph; the negative margin above keeps it aligned with the rule */}
              <a
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="inline-flex h-11 w-11 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon size={20} strokeWidth={1.6} />
              </a>
            </li>
          ))}
          <li className="ml-3">
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="t2-link inline-flex min-h-11 items-center font-medium">
              Résumé (PDF)
            </a>
          </li>
        </ul>
        <p className="t2-meta mt-2">{location}</p>
      </motion.div>
    </header>
  );
};

export default Hero;
