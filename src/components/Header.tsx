import { useEffect, useState } from 'react';
import { FileText, Menu, X } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { APP_SETTINGS, SECTION_NUMBERS } from '@/config/env';

const NAV = [
  { label: 'Home', target: '#home', order: SECTION_NUMBERS.HERO },
  { label: 'Experience', target: '#experience', order: SECTION_NUMBERS.EXPERIENCE },
  { label: 'Projects', target: '#projects', order: SECTION_NUMBERS.PROJECTS },
  { label: 'GitHub', target: '#github-stats', order: SECTION_NUMBERS.GITHUB_STATS },
  { label: 'Stack', target: '#tech-stack', order: SECTION_NUMBERS.TECH_STACK },
  { label: 'Education', target: '#education', order: SECTION_NUMBERS.EDUCATION },
  { label: 'Contact', target: '#contact', order: SECTION_NUMBERS.CONTACT },
].sort((a, b) => a.order - b.order);

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { portfolio } = usePortfolio();
  const resumeUrl = portfolio?.resumeUrl || '/resume/resume.pdf';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        isScrolled ? 'border-darktech-border/70 bg-darktech-background/75 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#home" className="group flex items-center gap-1 font-rajdhani text-xl font-bold tracking-wide">
          <span className="text-darktech-neon-green transition-transform group-hover:-translate-x-0.5">[</span>
          {portfolio?.personalInfo?.name || APP_SETTINGS.APP_NAME}
          <span className="text-darktech-neon-green transition-transform group-hover:translate-x-0.5">]</span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.target}
              href={item.target}
              className="group relative py-3 text-sm text-darktech-text/80 transition-colors hover:text-darktech-text"
            >
              {item.label}
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-darktech-neon-green transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={resumeUrl}
            className="inline-flex h-9 items-center gap-2 rounded-[3px] border border-darktech-border px-3 text-sm font-medium text-darktech-holo-cyan transition-colors hover:border-darktech-holo-cyan/60"
          >
            <FileText size={14} aria-hidden="true" /> Resume
          </a>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-darktech-border text-darktech-text lg:hidden"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="border-t border-darktech-border bg-darktech-background/95 backdrop-blur-xl lg:hidden" aria-label="Mobile">
          <ul className="container mx-auto flex flex-col px-4 py-3">
            {NAV.map((item) => (
              <li key={item.target}>
                <a
                  href={item.target}
                  className="flex items-baseline gap-3 py-3 font-rajdhani text-2xl font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

    </header>
  );
};

export default Header;
