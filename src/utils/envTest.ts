// Test file to verify environment variables are loading correctly
import { ENV, debugEnv } from '../config/env';

export const testEnvironmentVariables = () => {
  ('🧪 [EnvTest] Testing environment variables:');
  ('🧪 [EnvTest] ENV.API_KEY:', ENV.API_KEY);
  ('🧪 [EnvTest] ENV.API_VALUE:', ENV.API_VALUE);
  ('🧪 [EnvTest] ENV.GOOGLE_CLIENT_ID:', ENV.GOOGLE_CLIENT_ID);
  ('🧪 [EnvTest] ENV.GOOGLE_CLIENT_SECRET:', ENV.GOOGLE_CLIENT_SECRET);
  ('🧪 [EnvTest] ENV.FACEBOOK_APP_ID:', ENV.FACEBOOK_APP_ID);
  ('🧪 [EnvTest] ENV.FACEBOOK_APP_SECRET:', ENV.FACEBOOK_APP_SECRET);
  
  const allLoaded = [
    ENV.API_KEY,
    ENV.API_VALUE,
    ENV.GOOGLE_CLIENT_ID,
    ENV.GOOGLE_CLIENT_SECRET,
    ENV.FACEBOOK_APP_ID,
    ENV.FACEBOOK_APP_SECRET,
  ].every(value => value !== undefined && value !== '');
  
  ('🧪 [EnvTest] All environment variables loaded:', allLoaded);
  
  // Also run the debug function
  debugEnv();
  
  return allLoaded;
};
