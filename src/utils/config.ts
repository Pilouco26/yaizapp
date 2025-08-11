// Configuration file for API endpoints and other app settings

// 🌐 Dynamic IP detection for development
// The app will automatically detect the best IP address to use
// Make sure your mobile device and computer are on the same WiFi network

// Import network configurations
import { NETWORK_CONFIGS } from './networkConfigs';

// Manual override - set this if you want to force a specific IP
const MANUAL_IP: string = ''; // Example: '192.168.1.50' - Leave empty for auto-detection

export const API_CONFIG = {
  // Base URL for Mockoon API - will be set dynamically
  BASE_URL: '', // Will be populated by getDynamicBaseUrl()
  
  // API endpoints - Updated to match Mockoon config
  ENDPOINTS: {
    BILLS: '/api/bills', // Changed from '/bills' to '/api/bills'
    UPLOAD_BILLS: '/api/bills', // POST endpoint for uploading bills
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
  const baseUrl = getDynamicBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;
  return fullUrl;
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
