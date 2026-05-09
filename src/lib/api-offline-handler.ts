/**
 * Offline Handler for API Client
 * 
 * Provides mock/empty responses when API is not available,
 * allowing the app to function gracefully in offline mode.
 */

// Intercept fetch to catch connection errors and provide fallbacks
const originalFetch = globalThis.fetch;

globalThis.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    return response;
  } catch (error: any) {
    // Network error occurred
    console.warn('[API Offline] Network error:', error.message);
    
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
    
    // Return mock responses for common API endpoints
    if (url.includes('/api/questions/stats')) {
      return new Response(JSON.stringify({
        total: 0,
        bySubject: [],
        recentlyAdded: 0
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (url.includes('/api/questions/tree')) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (url.includes('/api/study-sessions/stats')) {
      return new Response(JSON.stringify({
        totalSeconds: 0,
        todaySeconds: 0,
        streakDays: 0,
        bySubject: [],
        recentSessions: []
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (url.includes('/api/questions') && args[1]?.method === 'GET') {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (url.includes('/api/study-sessions') && args[1]?.method === 'GET') {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (url.includes('/api/weak-areas') && args[1]?.method === 'GET') {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (url.includes('/api/weak-areas/stats')) {
      return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    
    // For other endpoints, return error response
    return new Response(JSON.stringify({ error: 'API not available' }), { 
      status: 503, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};
