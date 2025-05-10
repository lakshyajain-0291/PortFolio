import { useState, useEffect } from 'react';
import { Menu, X, Star, Download, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { APP_SETTINGS } from '@/config/env';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { portfolio, isLoading: isRefreshing, refreshAllData, downloadPortfolioJSON } = usePortfolio();
  
  // Resume URL
  const resumeUrl = portfolio?.resumeUrl || '/resume/resume.pdf';
  
  // Dialog states
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showReloadDialog, setShowReloadDialog] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', target: '#home' },
    { label: 'Projects', target: '#projects' },
    { label: 'Tech Stack', target: '#tech-stack' },
    { label: 'Experience', target: '#experience' },
    { label: 'Education', target: '#education' },
    { label: 'Contact', target: '#contact' }
  ];

  // Handle confirm download portfolio JSON
  const handleConfirmDownload = async () => {
    await downloadPortfolioJSON();
    setShowDownloadDialog(false);
  };

  // Handle confirm reload by AI
  const handleConfirmReload = async () => {
    await refreshAllData();
    setShowReloadDialog(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-darktech-background/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#home" className="text-2xl font-rajdhani font-bold text-gradient">
          {APP_SETTINGS.APP_NAME}
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <nav className="flex items-center space-x-6 mr-4">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.target}
                className="relative text-darktech-text hover:text-darktech-neon-green transition-colors duration-300 py-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-darktech-neon-green after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 ml-4">
            {/* Resume Download Button */}
            <a
              href="/resume/resume.pdf"
              download
              className="p-2 rounded-full bg-darktech-card hover:bg-darktech-lighter text-darktech-holo-cyan transition-all duration-300 hover:scale-105"
              title="Download Resume"
            >
              <FileText size={20} />
            </a>

            {/* Adding horizontal spacer */}
            <div className="w-2"></div>
            {/* Star Button with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-darktech-neon-green transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Portfolio Options"
                >
                  <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 128 128" 
                  className={`w-12 h-12 ${isRefreshing ? 'animate-pulse' : ''}`}
                  stroke="currentColor"
                  fill="currentColor"
                  >
                    <path d="M80.526 60.457a1.75 1.75 0 0 0-1.557-1.739C64.049 57.061 55.991 49 54.333 34.082a1.75 1.75 0 0 0-3.479 0C49.2 49 41.139 57.061 26.219 58.718a1.75 1.75 0 0 0 0 3.479c14.92 1.657 22.978 9.716 24.636 24.636a1.75 1.75 0 0 0 3.479 0c1.658-14.92 9.716-22.979 24.636-24.636a1.75 1.75 0 0 0 1.556-1.74zM52.594 78.148A26.275 26.275 0 0 0 34.9 60.457a26.275 26.275 0 0 0 17.694-17.691 26.276 26.276 0 0 0 17.691 17.691 26.275 26.275 0 0 0-17.691 17.691zM76.093 36.015c4.644.517 7.046 2.919 7.563 7.562a1.75 1.75 0 0 0 3.479 0c.516-4.643 2.918-7.045 7.562-7.562a1.75 1.75 0 0 0 0-3.479c-4.644-.517-7.046-2.919-7.562-7.562a1.75 1.75 0 0 0-3.479 0c-.516 4.644-2.919 7.046-7.562 7.562a1.75 1.75 0 0 0 0 3.479zm9.3-5.156a9.9 9.9 0 0 0 3.417 3.417 9.9 9.9 0 0 0-3.417 3.416 9.915 9.915 0 0 0-3.417-3.416 9.909 9.909 0 0 0 3.419-3.418zM101.781 84.9c-8.871-.985-13.662-5.776-14.647-14.647a1.75 1.75 0 0 0-3.479 0c-.986 8.871-5.777 13.662-14.648 14.647a1.75 1.75 0 0 0 0 3.479c8.871.986 13.662 5.777 14.648 14.648a1.75 1.75 0 0 0 3.479 0c.985-8.871 5.776-13.662 14.647-14.648a1.75 1.75 0 0 0 0-3.479zM85.395 95.655a16.454 16.454 0 0 0-9.017-9.017 16.449 16.449 0 0 0 9.017-9.016 16.447 16.447 0 0 0 9.016 9.016 16.452 16.452 0 0 0-9.016 9.017z"/>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Portfolio Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDownloadDialog(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Download size={16} className="text-darktech-neon-green" />
                  <span>Download JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowReloadDialog(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={16} className="text-darktech-cyber-pink" />
                  <span>Reload by AI</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-2 mr-4">
            {/* Mobile Resume Download Button */}
            <a
              href={resumeUrl}
              download="resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-darktech-card hover:bg-darktech-lighter text-darktech-holo-cyan transition-all duration-300"
              title="Download Resume"
            >
              <FileText size={18} />
            </a>
          
            {/* Mobile Star Button with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full bg-darktech-card hover:bg-darktech-lighter text-darktech-neon-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Portfolio Options"
                >
                  <Star 
                    size={18} 
                    className={`${isRefreshing ? 'animate-pulse' : ''}`} 
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Portfolio Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDownloadDialog(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Download size={16} className="text-darktech-neon-green" />
                  <span>Download JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowReloadDialog(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={16} className="text-darktech-cyber-pink" />
                  <span>Reload by AI</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <button 
            className="text-darktech-text hover:text-darktech-neon-green"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-darktech-lighter/95 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.target}
                className="text-darktech-text hover:text-darktech-neon-green transition-colors duration-300 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Download JSON Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Portfolio Data</DialogTitle>
            <DialogDescription>
              Download your portfolio data as a JSON file to make manual edits or create a backup.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-darktech-card/50 rounded-md text-sm">
            <p className="mb-2 flex items-start gap-2">
              <AlertCircle size={16} className="text-darktech-holo-cyan mt-1 flex-shrink-0" />
              <span>After downloading, place the file in the <code className="bg-darktech-card px-1 rounded text-darktech-neon-green">data/</code> folder to use your custom portfolio data.</span>
            </p>
          </div>
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
              className="bg-darktech-neon-green hover:bg-darktech-neon-green/80 text-darktech-background sm:w-auto w-full"
            >
              Download portfolio.json
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reload by AI Dialog */}
      <Dialog open={showReloadDialog} onOpenChange={setShowReloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reload Portfolio with AI</DialogTitle>
            <DialogDescription>
              Regenerate your portfolio data using AI to refresh insights and analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-darktech-card/50 rounded-md text-sm">
            <p className="mb-2 flex items-start gap-2">
              <AlertCircle size={16} className="text-darktech-cyber-pink mt-1 flex-shrink-0" />
              <span>This will refresh all your portfolio data from GitHub, resume, and generate new AI insights. Your custom changes may be overwritten.</span>
            </p>
          </div>
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
              disabled={isRefreshing}
              className="bg-darktech-cyber-pink hover:bg-darktech-cyber-pink/80 text-darktech-background sm:w-auto w-full"
            >
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
