// Environment variables configuration
// This file provides a centralized way to access environment variables

// For development, you can set these values directly here
// For production, these should be set via environment variables

export const ENV = {
  // API Authentication
  API_KEY: process.env.EXPO_PUBLIC_API_KEY || 'test-api-key',
  API_VALUE: process.env.EXPO_PUBLIC_API_VALUE || 'test-api-value',
  
  // OAuth Configuration
  GOOGLE_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '292228884076-q7ekohms81t3ue8mccthpded079h5mov.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '',
  FACEBOOK_APP_ID: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
  FACEBOOK_APP_SECRET: process.env.EXPO_PUBLIC_FACEBOOK_APP_SECRET || '',
  
  // Development Settings
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Debug function to check environment variables
export const debugEnv = () => {
  
  // Check if we're using fallback values
  const usingFallbacks = {
    API_KEY: ENV.API_KEY === 'test-api-key',
    API_VALUE: ENV.API_VALUE === 'test-api-value',
    GOOGLE_CLIENT_SECRET: ENV.GOOGLE_CLIENT_SECRET === '',
    FACEBOOK_APP_ID: ENV.FACEBOOK_APP_ID === '',
    FACEBOOK_APP_SECRET: ENV.FACEBOOK_APP_SECRET === '',
  };
  
  
  return ENV;
};
