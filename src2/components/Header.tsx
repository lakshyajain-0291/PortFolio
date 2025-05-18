import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Menu, X, FileText, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import { APP_SETTINGS, DEFAULT_ASSETS } from '../../src/config/env';

// Import UI components from the main template
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../src/components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../src/components/ui/dropdown-menu";

import { Button } from "../../src/components/ui/button";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { portfolio, isLoading: isRefreshing, refreshAllData, downloadPortfolioJSON } = usePortfolio();
  
  // Dialog states
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showReloadDialog, setShowReloadDialog] = useState(false);
  
  // Resume URL - Use absolute path to the PDF in public folder
  const resumeUrl = DEFAULT_ASSETS.RESUME_URL;

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navigationItems = [
    { label: 'Home', href: '#home' },
    { label: 'Projects', href: '#projects' },
    { label: 'Tech Stack', href: '#tech-stack' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ];

  // Handle portfolio download
  const handleConfirmDownload = () => {
    downloadPortfolioJSON();
    setShowDownloadDialog(false);
  };

  // Handle portfolio reload
  const handleConfirmReload = async () => {
    await refreshAllData();
    setShowReloadDialog(false);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 ${
          isScrolled 
            ? 'bg-background/80 backdrop-blur-lg shadow-md' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-2">
              <span className="text-xl font-semibold bg-clip-textbg-gradient-to-r from-blue-500 to-purple-500">
                {APP_SETTINGS.APP_NAME}
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-foreground/80 hover:text-primary transition-colors duration-300"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Theme toggle and action buttons */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <a
                href={resumeUrl}
                download
                className="rounded-md p-2 hover:bg-accent transition-colors"
                title="Download Resume"
              >
                <FileText size={20} />
              </a>
              
              {/* Portfolio Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="rounded-md p-2 flex items-center hover:bg-accent transition-colors"
                    title="Portfolio Options"
                  >
                    <span className="hidden sm:inline mr-1">Actions</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Portfolio Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setShowDownloadDialog(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={16} className="text-blue-500" />
                    <span>Download JSON</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowReloadDialog(true)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={16} className={`text-purple-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Reload by AI</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile menu button */}
              <button
                className="md:hidden rounded-md p-2 hover:bg-accent transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isOpen && (
            <nav className="md:hidden mt-4 py-4 border-t border-border">
              <ul className="flex flex-col gap-4">
                {navigationItems.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-foreground/80 hover:text-primary transition-colors block py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Download Portfolio Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Portfolio Data</DialogTitle>
            <DialogDescription>
              Download your portfolio data as a JSON file for backup or reuse.
            </DialogDescription>
          </DialogHeader>
          <p className="flex items-start gap-2 text-sm">
            <span>After downloading, place the file in the <code className="bg-accent px-1 rounded">data/</code> folder to use your custom portfolio data.</span>
          </p>
          <DialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDownloadDialog(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDownload}
              className="sm:w-auto w-full" 
            >
              Download portfolio.json
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reload Portfolio Dialog */}
      <Dialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reload Portfolio Data</DialogTitle>
            <DialogDescription>
              This will reload your portfolio data from GitHub and other integrated sources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReloadDialog(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmReload}
              className="sm:w-auto w-full"
              disabled={isRefreshing}
            >
              {isRefreshing ? "Reloading..." : "Reload Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;