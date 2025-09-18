import { Platform } from 'react-native';
import { NETWORK_CONFIGS, COMMON_FALLBACK_IPS, NetworkConfig } from './networkConfigs';
import * as AuthSession from 'expo-auth-session';

// Global IP address for OAuth redirect URIs
let currentIPAddress = '172.20.10.2'; // Default fallback

// Function to get the current IP address
export const getCurrentIPAddress = (): string => {
  return currentIPAddress;
};

// Function to set the current IP address
export const setCurrentIPAddress = (ip: string): void => {
  currentIPAddress = ip;
  ('OAuth IP Address set to:', ip);
};

// Function to get the OAuth redirect URI with current IP
export const getOAuthRedirectURI = (): string => {
  // For Expo Go development, use localhost redirect URI
  // This is the most reliable approach for development
  const redirectURI = __DEV__ 
    ? 'http://localhost:8081/oauth/callback'
    : 'com.yaizapp.app://oauth/callback';
  
  ('OAuth Redirect URI for environment:', __DEV__ ? 'development' : 'production');
  ('OAuth Redirect URI:', redirectURI);
  return redirectURI;
};

// Function to detect IP address (for future use)
export const detectIPAddress = async (): Promise<string> => {
  try {
    // For now, we'll use the known IP address
    // In a production app, you might want to detect this dynamically
    const ip = '172.20.10.2';
    setCurrentIPAddress(ip);
    return ip;
  } catch (error) {
    console.error('Error detecting IP address:', error);
    return currentIPAddress;
  }
};

/**
 * Detects which network configuration is currently working
 * Tests all configured networks and returns the first one that responds
 */
export const detectCurrentNetwork = async (): Promise<NetworkConfig> => {
  
  // Test each network configuration
  for (const [key, config] of Object.entries(NETWORK_CONFIGS)) {
    try {
      const isValid = await validateIPAddress(config.ip, 3000);
      
      if (isValid) {
        return config;
      }
    } catch (error) {
      continue;
    }
  }
  
  return {
    name: 'Fallback Network',
    ip: '192.168.1.100',
    description: 'Default fallback IP'
  };
};

/**
 * Gets the local IP address of the device/computer
 * For development, this helps connect to localhost services
 */
export const getLocalIPAddress = async (): Promise<string> => {
  try {
    if (Platform.OS === 'web') {
      // For web development, use localhost
      return 'localhost';
    }

    // For mobile development, we need to detect the computer's IP
    // This is a common approach for React Native development
    
    // Method 1: Try to get from network interface (if available)
    try {
      // This would require additional native modules, but for now we'll use a fallback
      // In a real implementation, you might use react-native-network-info or similar
      throw new Error('Native network detection not implemented');
    } catch {
      // Method 2: Use a fallback approach with common local network ranges
      // This is a development-friendly approach
      return await discoverBestWorkingIP();
    }
  } catch (error) {
    return getFallbackIPAddress();
  }
};

/**
 * Fallback method to get a reasonable IP address for development
 * This tries common local network ranges
 */
const getFallbackIPAddress = (): string => {
  // Use the first common fallback IP
  return COMMON_FALLBACK_IPS[0];
};

/**
 * Attempts to find the best available IP address for the current network
 * This is a more sophisticated approach that could be implemented later
 */
export const discoverNetworkIP = async (): Promise<string> => {
  try {
    // This would be implemented with a native module like react-native-network-info
    // For now, we'll use the fallback
    return getFallbackIPAddress();
  } catch (error) {
    return getFallbackIPAddress();
  }
};

/**
 * Discovers the best working IP address by testing common network ranges
 * This is a smart fallback that tries to find a working connection
 */
export const discoverBestWorkingIP = async (): Promise<string> => {

  // Test each IP address to find one that works
  for (const ip of COMMON_FALLBACK_IPS) {
    try {
      const isValid = await validateIPAddress(ip, 3000);
      
      if (isValid) {
        return ip;
      }
    } catch (error) {
      continue;
    }
  }
  
  return getFallbackIPAddress();
};

/**
 * Validates if an IP address is reachable
 * Useful for testing connectivity before making API calls
 */
export const validateIPAddress = async (ipAddress: string, port: number = 3000): Promise<boolean> => {
  try {
    const testUrl = `http://${ipAddress}:${port}/api/bills`; // Updated endpoint
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    return false;
  }
};
