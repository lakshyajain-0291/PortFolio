import { APP_SETTINGS, DEFAULT_USER } from '@/config/env';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-darktech-border bg-darktech-background/70 py-10 backdrop-blur">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <a href="#home" className="font-rajdhani text-lg font-bold">
          <span className="text-darktech-neon-green">[</span>
          {APP_SETTINGS.APP_NAME}
          <span className="text-darktech-neon-green">]</span>
        </a>
        <p className="t1-label normal-case tracking-normal">
          © {currentYear} {DEFAULT_USER.NAME} · rendered in three.js from live repository data
        </p>
        <nav className="flex gap-6 text-sm text-darktech-muted">
          <a href="#home" className="transition-colors hover:text-darktech-neon-green">Home</a>
          <a href="#projects" className="transition-colors hover:text-darktech-neon-green">Projects</a>
          <a href="#experience" className="transition-colors hover:text-darktech-neon-green">Experience</a>
          <a href="#contact" className="transition-colors hover:text-darktech-neon-green">Contact</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
