import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register the portfolio service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/portfolio-service-worker.js')
      .then(registration => {
        console.log('Portfolio Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Portfolio Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
