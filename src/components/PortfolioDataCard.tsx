import React, { useState } from 'react';
import { Download, FolderDown, Info, X } from 'lucide-react';
import { usePortfolio } from '@/hooks/PortfolioContext';
import { PortfolioData } from '@/lib/portfolioStorage';

const PortfolioDataCard = () => {
  const { portfolio } = usePortfolio();
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownload = () => {
    if (!portfolio) return;
    
    // Create a Blob from the portfolio data
    const jsonData = JSON.stringify(portfolio, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio.json';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Show instructions after download
    setShowInstructions(true);
  };

  return (
    <div className="glass-panel p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">Portfolio Data</h3>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="p-2 rounded-full hover:bg-darktech-background/30 transition-colors"
          aria-label="Toggle instructions"
        >
          <Info size={18} className="text-darktech-holo-cyan" />
        </button>
      </div>
      
      <p className="text-darktech-muted mb-6">
        Download your portfolio data as JSON to edit it manually or back it up.
      </p>
      
      <button
        onClick={handleDownload}
        className="w-full py-3 px-6 flex items-center justify-center gap-2 bg-darktech-card hover:bg-darktech-lighter border border-darktech-border rounded-lg transition-all duration-300 hover:border-darktech-neon-green/50"
      >
        <Download size={18} className="text-darktech-neon-green" />
        <span>Download portfolio.json</span>
      </button>
      
      {showInstructions && (
        <div className="mt-6 relative">
          <div className="absolute right-0 top-0">
            <button 
              onClick={() => setShowInstructions(false)}
              className="p-1 rounded-full hover:bg-darktech-background/30 transition-colors"
            >
              <X size={18} className="text-darktech-muted" />
            </button>
          </div>
          
          <div className="p-4 rounded-lg bg-darktech-background border border-darktech-border">
            <h4 className="font-medium text-darktech-holo-cyan mb-3 flex items-center gap-2">
              <FolderDown size={16} />
              How to use your portfolio.json
            </h4>
            
            <ol className="list-decimal text-sm list-inside space-y-2 text-darktech-muted">
              <li>Place <code className="bg-darktech-card px-1 rounded text-darktech-neon-green">portfolio.json</code> in the <code className="bg-darktech-card px-1 rounded text-darktech-holo-cyan">data/</code> folder</li>
              <li>Edit the file with any text editor to customize your portfolio</li>
              <li>Refresh the page to see your changes</li>
              <li>The site will automatically load from your custom data file</li>
            </ol>
            
            <div className="mt-4 p-3 rounded bg-darktech-card/50 text-xs">
              <p className="text-darktech-cyber-pink">💡 Tip: Keep a backup of your portfolio.json file for future use.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDataCard;