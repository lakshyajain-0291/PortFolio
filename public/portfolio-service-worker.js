// Service worker to handle saving portfolio data to a file
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Portfolio Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Portfolio Service Worker activated');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Intercept requests to our custom save-portfolio endpoint
  if (event.request.url.includes('/api/save-portfolio')) {
    event.respondWith(handleSavePortfolio(event.request));
  }
});

async function handleSavePortfolio(request) {
  try {
    // Get the portfolio data from the request
    const portfolioData = await request.json();
    
    // Create the data directory if it doesn't exist
    const dataDirectory = await self.caches.open('portfolio-data-dir');
    
    // Store the portfolio data in the cache with a specific key
    await dataDirectory.put('/data/portfolio.json', new Response(
      JSON.stringify(portfolioData, null, 2),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    ));
    
    // Return success response
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    
    // Return error response
    return new Response(JSON.stringify({ 
      error: 'Failed to save portfolio data',
      details: error.message
    }), {
      headers: {
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
}