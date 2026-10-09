import { useEffect, useState } from 'react';
import { AlertCircle, Download, FileText, Menu, RefreshCw, Sparkles, X } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { APP_SETTINGS, SECTION_NUMBERS } from '@/config/env';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pad2 } from './t1/layout';

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
  const { portfolio, isLoading: isRefreshing, refreshAllData, downloadPortfolioJSON } = usePortfolio();
  const resumeUrl = portfolio?.resumeUrl || '/resume/resume.pdf';

  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showReloadDialog, setShowReloadDialog] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleConfirmDownload = async () => {
    await downloadPortfolioJSON();
    setShowDownloadDialog(false);
  };

  const handleConfirmReload = async () => {
    await refreshAllData();
    setShowReloadDialog(false);
  };

  const actionsMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-darktech-border text-darktech-neon-green transition-colors hover:border-darktech-neon-green/60"
          title="Portfolio options"
          aria-label="Portfolio options"
        >
          <Sparkles size={16} className={isRefreshing ? 'animate-pulse' : ''} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-[3px] border-darktech-border bg-darktech-card">
        <DropdownMenuLabel className="t1-label">portfolio actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-darktech-border" />
        <DropdownMenuItem onClick={() => setShowDownloadDialog(true)} className="flex cursor-pointer items-center gap-2">
          <Download size={15} className="text-darktech-neon-green" />
          Download JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowReloadDialog(true)} className="flex cursor-pointer items-center gap-2">
          <RefreshCw size={15} className="text-darktech-holo-cyan" />
          Reload by AI
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
        isScrolled ? 'border-darktech-border/70 bg-darktech-background/75 backdrop-blur-xl' : 'border-transparent bg-transparent'
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="#home" className="group flex items-center gap-1 font-rajdhani text-xl font-bold tracking-wide">
          <span className="text-darktech-neon-green transition-transform group-hover:-translate-x-0.5">[</span>
          {APP_SETTINGS.APP_NAME}
          <span className="text-darktech-neon-green transition-transform group-hover:translate-x-0.5">]</span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item, i) => (
            <a
              key={item.target}
              href={item.target}
              className="group relative py-2 text-sm text-darktech-text/80 transition-colors hover:text-darktech-text"
            >
              <span className="t1-num mr-1.5 text-[0.65rem] text-darktech-neon-green/70">{pad2(i + 1)}</span>
              {item.label}
              <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-darktech-neon-green transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={resumeUrl}
            download
            className="hidden h-9 items-center gap-2 rounded-[3px] border border-darktech-border px-3 font-jetbrains text-xs text-darktech-holo-cyan transition-colors hover:border-darktech-holo-cyan/60 sm:inline-flex"
            title="Download resume"
          >
            <FileText size={14} /> resume
          </a>
          {actionsMenu}
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
            {NAV.map((item, i) => (
              <li key={item.target}>
                <a
                  href={item.target}
                  className="flex items-baseline gap-3 py-3 font-rajdhani text-2xl font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="t1-num text-xs text-darktech-neon-green">{pad2(i + 1)}</span>
                  {item.label}
                </a>
              </li>
            ))}
            <li className="sm:hidden">
              <a href={resumeUrl} download className="t1-link flex items-center gap-2 py-3 text-sm">
                <FileText size={14} /> Download resume
              </a>
            </li>
          </ul>
        </nav>
      )}

      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="rounded-[3px] border-darktech-border bg-darktech-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Portfolio Data</DialogTitle>
            <DialogDescription>
              Download your portfolio data as a JSON file to make manual edits or create a backup.
            </DialogDescription>
          </DialogHeader>
          <p className="t1-panel flex items-start gap-2 p-4 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-darktech-holo-cyan" />
            <span>
              After downloading, place the file in the{' '}
              <code className="rounded-[2px] bg-darktech-lighter px-1 font-jetbrains text-darktech-neon-green">data/</code>{' '}
              folder to use your custom portfolio data.
            </span>
          </p>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)} className="w-full rounded-[3px] sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleConfirmDownload} className="w-full rounded-[3px] sm:w-auto">
              Download portfolio.json
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <DialogContent className="rounded-[3px] border-darktech-border bg-darktech-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reload Portfolio with AI</DialogTitle>
            <DialogDescription>Regenerate your portfolio data using AI to refresh insights and analysis.</DialogDescription>
          </DialogHeader>
          <p className="t1-panel flex items-start gap-2 p-4 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-darktech-holo-cyan" />
            <span>
              This will refresh all your portfolio data from GitHub, resume, and generate new AI insights. Your custom
              changes may be overwritten.
            </span>
          </p>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setShowReloadDialog(false)} className="w-full rounded-[3px] sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleConfirmReload} disabled={isRefreshing} className="w-full rounded-[3px] sm:w-auto">
              {isRefreshing ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Reloading...
                </>
              ) : (
                'Reload with AI'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
