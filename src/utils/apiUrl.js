/**
 * Get the API base URL
 * This should match the baseURL in services/API.js
 */
export const getApiBaseUrl = () => {
  // Check if we're in development or production
  // You can also use environment variables here
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  // For production, you might want to use:
  // return 'https://dme-devepm1.devoteam.com/api';
  return 'http://localhost:5000/api';
};

/**
 * Build full URL for API endpoints
 */
export const buildApiUrl = (path) => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

