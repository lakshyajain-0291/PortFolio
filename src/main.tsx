import { createRoot } from 'react-dom/client'
import { TEMPLATE_CONFIG } from './config/env'
import './index.css'

// Dynamically import the App component based on template number
const getApp = async () => {
  if (TEMPLATE_CONFIG.TEMPLATE_NUMBER === 3) {
    // Load App from src3 directory for terminal template
    const { default: App } = await import('../src3/App')
    return App
  } else if (TEMPLATE_CONFIG.TEMPLATE_NUMBER === 2) {
    // Load App from src2 directory for template 2
    const { default: App } = await import('../src2/App')
    return App
  } else if (TEMPLATE_CONFIG.TEMPLATE_NUMBER === 1) {
    // Load App from src directory for template 1
    const { default: App } = await import('./App')
    return App
  } else {
    // Default (template 0): Load App from src directory with default configuration
    const { default: App } = await import('./App')
    return App
  }
}

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

// Initialize the app with the correct template
getApp().then(App => {
  createRoot(document.getElementById('root')!).render(<App />)
})
