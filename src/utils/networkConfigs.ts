// Network configurations for different environments
// Add your common network IPs here - the app will automatically detect which one works

export interface NetworkConfig {
  name: string;
  ip: string;
  description: string;
}

export const NETWORK_CONFIGS: Record<string, NetworkConfig> = {
  // Home Network 1 (most common)
  HOME_1: {
    name: 'Home Network 1',
    ip: '192.168.1.113',
    description: 'Standard home router (192.168.1.x)'
  },
  // Home Network 2 (alternative)
  HOME_2: {
    name: 'Home Network 2', 
    ip: '192.168.0.100',
    description: 'Alternative home router (192.168.0.x)'
  },
  // Your previous working network
  PREVIOUS: {
    name: 'Previous Network',
    ip: '172.20.10.2',
    description: 'Your previous working network'
  },
  // Office/Corporate network
  OFFICE: {
    name: 'Office Network',
    ip: '10.0.0.100',
    description: 'Corporate network (10.0.x.x)'
  }
};

// Common fallback IPs for testing
export const COMMON_FALLBACK_IPS = [
  '192.168.1.100', // Most common home network
  '192.168.0.100', // Alternative home network
  '10.0.0.100',    // Some routers use this range
  '172.20.10.2',   // Your previous working IP
  '172.16.0.100',  // Some corporate networks
]; 