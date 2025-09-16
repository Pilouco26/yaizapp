// Configuration file for API endpoints and other app settings

// 🌐 Dynamic IP detection for development
// The app will automatically detect the best IP address to use
// Make sure your mobile device and computer are on the same WiFi network

// Import network configurations
import { NETWORK_CONFIGS } from './networkConfigs';

// Import environment variables
import { ENV } from '../config/env';

// Manual override - set this if you want to force a specific IP
const MANUAL_IP: string = ''; // Example: '192.168.1.50' - Leave empty for auto-detection

export const API_CONFIG = {
  // Base URL for YaizApp Backend API
  BASE_URL: 'https://yaizapp-backend.onrender.com',
  
  // API Key for authentication
  API_KEY: ENV.API_KEY,
  
  // API Value for authentication
  API_VALUE: ENV.API_VALUE,
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      DEV_TOKEN: '/api/auth/dev-token',
    },
    
    // Health
    HEALTH: {
      BASE: '/api/health',
      SEARCH: '/api/health/searchBy',
    },
    
    // Users
    USERS: {
      BASE: '/api/users',
      SEARCH: '/api/users/searchBy',
    },
    
    // Families
    FAMILIES: {
      BASE: '/api/families',
      SEARCH: '/api/families/searchBy',
    },
    
    // Months
    MONTHS: {
      BASE: '/api/months',
      SEARCH: '/api/months/searchBy',
    },
    
    // Goals
    GOALS: {
      BASE: '/api/goals',
      SEARCH: '/api/goals/searchBy',
    },
    
    // Transactions
    TRANSACTIONS: {
      BASE: '/api/transactions',
      SEARCH: '/api/transactions/searchBy',
    },
    
    // Notifications
    NOTIFICATIONS: {
      BASE: '/api/notifications',
      SEARCH: '/api/notifications/searchBy',
    },
    
    // Banks
    BANKS: '/api/banks',
    
    // Legacy endpoints (for backward compatibility)
    BILLS: '/api/bills',
    UPLOAD_BILLS: '/api/bills',
  },
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Dynamic base URL that gets the IP address automatically
let dynamicBaseUrl: string | null = null;
let currentNetwork: string = '';

// Helper function to get manual IP if set
function getManualIP(): string | null {
  return MANUAL_IP && MANUAL_IP.trim().length > 0 ? MANUAL_IP.trim() : null;
}

// Helper function to detect current network
function detectCurrentNetwork(): { ip: string; name: string } | null {
  // For now, return the first available network config
  // This can be enhanced later with actual network detection
  const firstConfig = Object.values(NETWORK_CONFIGS)[0];
  if (firstConfig) {
    return { ip: firstConfig.ip, name: firstConfig.name };
  }
  return null;
}

// Helper function to get fallback base URL
function getFallbackBaseUrl(): string {
  const fallbackConfig = Object.values(NETWORK_CONFIGS)[0];
  return fallbackConfig ? `http://${fallbackConfig.ip}:3000` : 'http://localhost:3000';
}

// Helper function to get dynamic base URL
export function getDynamicBaseUrl(): string {
  const manualIP = getManualIP();
  if (manualIP) {
    const dynamicBaseUrl = `http://${manualIP}:3000`;
    return dynamicBaseUrl;
  }

  const networkInfo = detectCurrentNetwork();
  if (networkInfo) {
    const dynamicBaseUrl = `http://${networkInfo.ip}:3000`;
    return dynamicBaseUrl;
  }

  return getFallbackBaseUrl();
}

// Helper function to get full API URL
export function getFullApiUrl(endpoint: string, currentNetwork?: string): string {
  // Use production API URL for all endpoints
  const baseUrl = API_CONFIG.BASE_URL;
  const fullUrl = `${baseUrl}${endpoint}`;
  return fullUrl;
}

// Helper function to get full API URL with apikey authentication
export function getFullApiUrlWithAuth(endpoint: string, currentNetwork?: string): string {
  const baseUrl = API_CONFIG.BASE_URL;
  
  const authConfig = getApiAuthConfig();

  // Prefer header-based authentication; simply return the base URL joined with the endpoint.
  // The actual header will be injected by getDefaultHeaders().
  if (authConfig) {
    const fullUrl = `${baseUrl}${endpoint}`;
    return fullUrl;
  }

  // Fallback: if no auth configuration exist, keep previous behaviour of unauthenticated URL
  const fullUrl = `${baseUrl}${endpoint}`;
  return fullUrl;
}

// Helper function to get default headers
export function getDefaultHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  // Base headers required for all requests
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // If API authentication is configured, inject the auth header automatically.
  // Many backend endpoints expect a header where the KEY is stored in `API_KEY` (e.g. "auth")
  // and the VALUE is stored in `API_VALUE`.
  if (API_CONFIG.API_KEY && API_CONFIG.API_VALUE) {
    baseHeaders[API_CONFIG.API_KEY] = API_CONFIG.API_VALUE;
  }

  // Merge with any caller-provided headers (caller headers take precedence)
  const headers: Record<string, string> = {
    ...baseHeaders,
    ...additionalHeaders,
  };

  return headers;
}

// Helper function to get API authentication configuration
export function getApiAuthConfig(): { key: string; value: string } | null {
  if (API_CONFIG.API_KEY && API_CONFIG.API_VALUE) {
    return {
      key: API_CONFIG.API_KEY,
      value: API_CONFIG.API_VALUE,
    };
  } else {
    return null;
  }
}

// Helper function to get current network info
export const getCurrentNetworkInfo = () => ({
  name: currentNetwork,
  baseUrl: dynamicBaseUrl
});

// Helper function to check if we're in development mode
export const isDevelopment = __DEV__;

// Initialize the dynamic base URL when the module loads
if (isDevelopment) {
  getDynamicBaseUrl();
}
