import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { portfolioStorage, PortfolioData } from '../lib/portfolioStorage';
import { useToast } from './use-toast';
import { DEFAULT_SOCIAL } from '@/config/env';

interface PortfolioContextType {
  portfolio: PortfolioData | null;
  isLoading: boolean;
  error: string | null;
  updatePortfolio: (data: PortfolioData) => Promise<void>;
  refreshAllData: () => Promise<void>;
  processNewPortfolioData: (githubUrl: string | null, linkedinUrl: string | null) => Promise<void>;
  downloadPortfolioJSON: () => Promise<void>;
}

// Export the context so it can be imported directly
export const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Listen for portfolio file download events
  useEffect(() => {
    const handleFileDownload = (event: Event) => {
      const customEvent = event as CustomEvent<{ filename: string }>;
      toast({
        title: "Portfolio data downloaded!",
        description: (
          <div className="space-y-2">
            <p>File saved as: <span className="font-bold">portfolio.json</span></p>
            <p>📝 To use your editable portfolio:</p>
            <ol className="list-decimal list-inside pl-2 space-y-1 text-sm">
              <li>Place the <span className="font-mono font-medium">portfolio.json</span> file in the <span className="font-mono font-medium">data/</span> folder of your site</li>
              <li>Refresh the page to load your editable data</li>
            </ol>
          </div>
        ),
        duration: 8000,
      });
    };

    window.addEventListener('portfolioDataDownloaded', handleFileDownload);
    return () => {
      window.removeEventListener('portfolioDataDownloaded', handleFileDownload);
    };
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Try to get data from portfolio.json or localStorage (following the priority)
        const data = await portfolioStorage.getPortfolio();
        
        // If we got data from either source, use it
        if (data && Object.keys(data).length > 0) {
          setPortfolio(data);
          setError(null);
        } else {
          // Only fetch from API if both data sources failed (as a last resort)
          console.log('No data found in portfolio.json or localStorage, fetching from API');
          await fetchFromAPI(DEFAULT_SOCIAL.GITHUB_URL, DEFAULT_SOCIAL.LINKEDIN_URL);
        }
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to fetch portfolio data');
        
        // Only try API as a fallback if there was an error getting data from other sources
        await fetchFromAPI(DEFAULT_SOCIAL.GITHUB_URL, DEFAULT_SOCIAL.LINKEDIN_URL);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch data from API using default resume and optional GitHub and LinkedIn URLs
  const fetchFromAPI = async (githubUrl: string | null = null, linkedinUrl: string | null = null) => {
    try {
      setIsLoading(true);
      const data = await portfolioStorage.fetchFromAPI(githubUrl, linkedinUrl);
      
      if (data) {
        setPortfolio(data);
        setError(null);
        
        // The data will be available for download via the header button
        toast({
          title: "API data fetched successfully",
          description: "Portfolio data is now available for download via the header button.",
        });
      }
    } catch (err) {
      console.error('Error fetching from API:', err);
      setError('Failed to fetch data from API');
      toast({
        title: "Error fetching data",
        description: "Could not load data from the API. Using default data instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePortfolio = async (data: PortfolioData) => {
    try {
      setIsLoading(true);
      await portfolioStorage.savePortfolio(data);
      setPortfolio(data);
      setError(null);
    } catch (err) {
      console.error('Error updating portfolio data:', err);
      setError('Failed to update portfolio data');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data by calling the API again and updating the saved file
  const refreshAllData = async () => {
    try {
      setIsLoading(true);
      
      // Use the current GitHub and LinkedIn URLs if they exist
      const githubUrl = portfolio?.socialLinks?.github || DEFAULT_SOCIAL.GITHUB_URL || null;
      const linkedinUrl = portfolio?.socialLinks?.linkedin || DEFAULT_SOCIAL.LINKEDIN_URL || null;
      
      await fetchFromAPI(githubUrl, linkedinUrl);
    } catch (err) {
      console.error('Error refreshing portfolio data:', err);
      setError('Failed to refresh portfolio data');
    }
  };

  // Process new data with custom GitHub and LinkedIn URLs
  const processNewPortfolioData = async (githubUrl: string | null, linkedinUrl: string | null): Promise<void> => {
    await fetchFromAPI(githubUrl, linkedinUrl);
  };

  // Download the current portfolio data as JSON
  const downloadPortfolioJSON = async (): Promise<void> => {
    try {
      // Check if data exists in localStorage first
      const localStorageData = localStorage.getItem('portfolioData');
      const parsedData = localStorageData ? JSON.parse(localStorageData) : null;

      console.log('Parsed data:', parsedData);
      
      if (parsedData) {
        // If data exists, download it
        const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        toast({
          title: "No data available",
          description: "No portfolio data found to download.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error downloading portfolio data:', err);
      toast({
      title: "Download failed",
      description: "Failed to download portfolio data.",
      variant: "destructive",
      });
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        isLoading,
        error,
        updatePortfolio,
        refreshAllData,
        processNewPortfolioData,
        downloadPortfolioJSON,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};