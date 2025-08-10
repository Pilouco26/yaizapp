// Configuration file for API endpoints and other app settings

// 🌐 Dynamic IP detection for development
// The app will automatically detect the best IP address to use
// Make sure your mobile device and computer are on the same WiFi network

export const API_CONFIG = {
  // Base URL for Mockoon API - will be set dynamically
  BASE_URL: '', // Will be populated by getDynamicBaseUrl()
  
  // API endpoints
  ENDPOINTS: {
    BILLS: '/bills',
    UPLOAD_BILLS: '/upload-bills',
  },
  
  // Timeout settings
  TIMEOUT: 10000, // 10 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Dynamic base URL that gets the IP address automatically
let dynamicBaseUrl: string | null = null;

// Helper function to get dynamic base URL
export const getDynamicBaseUrl = async (): Promise<string> => {
  if (dynamicBaseUrl) {
    return dynamicBaseUrl;
  }

  try {
    const { getLocalIPAddress } = await import('./networkUtils');
    const ipAddress = await getLocalIPAddress();
    dynamicBaseUrl = `http://${ipAddress}:3000`;
    

    
    return dynamicBaseUrl;
  } catch (error) {

    // Fallback to a known working IP
    dynamicBaseUrl = 'http://172.20.10.2:3000';
    return dynamicBaseUrl;
  }
};

// Helper function to get full API URL
export const getApiUrl = async (endpoint: string): Promise<string> => {
  const baseUrl = await getDynamicBaseUrl();
  return `${baseUrl}${endpoint}`;
};

// Helper function to check if we're in development mode
export const isDevelopment = __DEV__;

// Initialize the dynamic base URL when the module loads
if (isDevelopment) {
  getDynamicBaseUrl();
}
