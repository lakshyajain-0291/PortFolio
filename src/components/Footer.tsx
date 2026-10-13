import { usePortfolio } from '@/hooks/PortfolioContext';
import { PROFILE } from '../../shared/content/curated/profile';
import TemplateSwitcher from './TemplateSwitcher';

const FOOTER_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

const Footer = () => {
  const { portfolio } = usePortfolio();
  const currentYear = new Date().getFullYear();
  const asOf = (portfolio?.githubStats as { contributionsAsOf?: string } | undefined)?.contributionsAsOf;

  return (
    <footer className="relative z-10 border-t border-darktech-border bg-darktech-background/70 py-10 backdrop-blur">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <a href="#home" className="inline-flex min-h-[44px] items-center font-rajdhani text-lg font-bold">
          <span className="text-darktech-neon-green">[</span>
          {PROFILE.name}
          <span className="text-darktech-neon-green">]</span>
        </a>
        <p className="text-center text-sm text-darktech-muted">
          © {currentYear} {PROFILE.name}
          {asOf && (
            <>
              {' · '}GitHub data as of <time dateTime={asOf} className="t1-num">{asOf}</time>
            </>
          )}
        </p>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 text-sm text-darktech-muted">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-[44px] items-center transition-colors hover:text-darktech-neon-green"
            >
              {link.label}
            </a>
          ))}
        </nav>
        {/* Below 640px the floating switcher would cover content, so it lives here instead. */}
        <TemplateSwitcher variant="inline" className="sm:hidden" />
      </div>
    </footer>
  );
};

export default Footer;
