import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { DEFAULT_ASSETS } from '../../src/config/env';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../src/components/ui/dropdown-menu';
import { Button } from '../../src/components/ui/button';

/**
 * Utility cluster pinned to the top-right corner: theme, résumé and the
 * portfolio data actions. Deliberately small — the page is the typography.
 */
const Header: React.FC = () => {
  const { isLoading: isRefreshing, refreshAllData, downloadPortfolioJSON } = usePortfolio();
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showReloadDialog, setShowReloadDialog] = useState(false);
  const resumeUrl = DEFAULT_ASSETS.RESUME_URL;

  const handleConfirmDownload = () => {
    downloadPortfolioJSON();
    setShowDownloadDialog(false);
  };

  const handleConfirmReload = async () => {
    await refreshAllData();
    setShowReloadDialog(false);
  };

  return (
    <>
      <div className="absolute right-4 top-4 z-40 flex items-center gap-1 rounded-[2px] bg-background/80 p-1 backdrop-blur sm:right-6 lg:fixed lg:right-8 lg:top-6">
        <a
          href={resumeUrl}
          download
          className="px-3 py-2 font-plex-mono text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          résumé
        </a>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-[2px] text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Portfolio actions"
              title="Portfolio actions"
            >
              <MoreHorizontal size={18} strokeWidth={1.6} className={isRefreshing ? 'animate-pulse' : ''} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-[2px]">
            <DropdownMenuLabel className="t2-meta font-normal uppercase">Portfolio data</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDownloadDialog(true)} className="cursor-pointer">
              Download JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowReloadDialog(true)} className="cursor-pointer">
              Reload by AI
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="rounded-[2px]">
          <DialogHeader>
            <DialogTitle className="t2-display text-2xl">Download portfolio data</DialogTitle>
            <DialogDescription>Download your portfolio data as a JSON file for backup or reuse.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            After downloading, place the file in the <code className="t2-tag">data/</code> folder to use your custom portfolio data.
          </p>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)} className="w-full rounded-[2px] sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleConfirmDownload} className="w-full rounded-[2px] sm:w-auto">
              Download portfolio.json
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <DialogContent className="rounded-[2px]">
          <DialogHeader>
            <DialogTitle className="t2-display text-2xl">Reload portfolio data</DialogTitle>
            <DialogDescription>This will reload your portfolio data from GitHub and other integrated sources.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setShowReloadDialog(false)} className="w-full rounded-[2px] sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleConfirmReload} className="w-full rounded-[2px] sm:w-auto" disabled={isRefreshing}>
              {isRefreshing ? 'Reloading...' : 'Reload Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
