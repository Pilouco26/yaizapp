import { getOAuthRedirectURI } from '../utils/networkUtils';
import * as AuthSession from 'expo-auth-session';

// Import environment variables
import { ENV } from './env';

// OAuth Configuration using environment variables
// This follows Google's new OAuth 2.0 policy for URI validation

export const OAUTH_CONFIG = {
  // Google OAuth Configuration
  GOOGLE: {
    CLIENT_ID: ENV.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: ENV.GOOGLE_CLIENT_SECRET,
    
    // Scopes for Google Sign-In (following OAuth 2.0 best practices)
    SCOPES: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    
    // Authorization endpoints
    AUTH_ENDPOINT: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_ENDPOINT: 'https://oauth2.googleapis.com/token',
    REVOKE_ENDPOINT: 'https://oauth2.googleapis.com/revoke',
    
    // User info endpoint
    USER_INFO_ENDPOINT: 'https://www.googleapis.com/oauth2/v2/userinfo'
  },
  
  // Facebook OAuth Configuration
  FACEBOOK: {
    APP_ID: ENV.FACEBOOK_APP_ID,
    APP_SECRET: ENV.FACEBOOK_APP_SECRET,
    
    // Facebook permissions
    PERMISSIONS: ['public_profile', 'email'],
    
    // Authorization endpoints
    AUTH_ENDPOINT: 'https://www.facebook.com/v18.0/dialog/oauth',
    TOKEN_ENDPOINT: 'https://graph.facebook.com/v18.0/oauth/access_token',
    
    // User info endpoint
    USER_INFO_ENDPOINT: 'https://graph.facebook.com/v18.0/me'
  }
};

// Get OAuth configuration with validation
export const getOAuthConfig = () => {
  const config = OAUTH_CONFIG;
  
  // Validate required environment variables
  if (!config.GOOGLE.CLIENT_ID) {
    console.warn('Google CLIENT_ID not found in environment variables');
  }
  
  if (!config.FACEBOOK.APP_ID) {
    console.warn('Facebook APP_ID not found in environment variables');
  }
  
  return config;
};

// URI validation helper (following Google's OAuth 2.0 policy)
export const validateRedirectUri = (uri: string): boolean => {
  
  // For Expo Go development, accept localhost URI
  // For production, accept app scheme URI
  const validUris = [
    'http://localhost:8081/oauth/callback',
    'com.yaizapp.app://oauth/callback'
  ];
  
  const isValidScheme = validUris.includes(uri);
  
  ('URI validation result:', isValidScheme);
  
  if (!isValidScheme) {
    console.warn('Invalid redirect URI scheme:', uri);
    return false;
  }
  
  // Additional validation can be added here based on your requirements
  return true;
};

// Generate redirect URI for OAuth flows
export const getRedirectUri = (): string => {
  // For Expo Go development, use localhost redirect URI
  // This is the most reliable approach for development
  const redirectUri = __DEV__ 
    ? 'http://localhost:8081/oauth/callback'
    : 'com.yaizapp.app://oauth/callback';
  
  return redirectUri;
}; 