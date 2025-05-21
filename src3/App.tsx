import React from 'react';
import { PortfolioProvider } from '../src/hooks/PortfolioContext';
import { Toaster } from '../src/components/ui/toaster';
import Terminal from '../src3/components/Terminal';
import './styles/terminal.css';

const App = () => {
  return (
    <PortfolioProvider>
      <div className="terminal-container">
        <Terminal />
        <Toaster />
      </div>
    </PortfolioProvider>
  );
};

export default App;