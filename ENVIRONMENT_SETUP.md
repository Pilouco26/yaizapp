# Environment Variables Setup Guide

This guide explains how to properly set up environment variables for the YaizApp React Native Expo project.

## Problem Solved

The original issue was that `process.env.EXPO_PUBLIC_API_KEY` and other environment variables were returning `undefined` because:

1. No `.env` file was created
2. The babel configuration wasn't set up to handle environment variables properly
3. The project wasn't using the correct method to load environment variables in React Native/Expo

## Solution Implemented

### 1. Installed Required Packages

```bash
npm install react-native-dotenv
```

### 2. Updated Babel Configuration

Updated `babel.config.js` to include the `react-native-dotenv` plugin:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'nativewind/babel',
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blocklist: null,
          allowlist: null,
          safe: false,
          allowUndefined: true,
          verbose: false,
        },
      ],
    ],
  };
};
```

### 3. Created TypeScript Declarations

Created `src/types/env.d.ts` to provide TypeScript support for environment variables:

```typescript
declare module '@env' {
  export const EXPO_PUBLIC_API_KEY: string;
  export const EXPO_PUBLIC_API_VALUE: string;
  export const EXPO_PUBLIC_GOOGLE_CLIENT_ID: string;
  export const EXPO_PUBLIC_GOOGLE_CLIENT_SECRET: string;
  export const EXPO_PUBLIC_FACEBOOK_APP_ID: string;
  export const EXPO_PUBLIC_FACEBOOK_APP_SECRET: string;
  export const NODE_ENV: string;
}
```

### 4. Updated Configuration Files

Updated `src/utils/config.ts` and `src/config/oauth.ts` to import environment variables using the `@env` module instead of `process.env`.

## How to Set Up Your Environment Variables

### Step 1: Create a `.env` file

Create a `.env` file in your project root with the following content:

```env
# YaizApp Environment Variables
# Copy this file to .env for local development

# API Authentication
EXPO_PUBLIC_API_KEY=your_actual_api_key_here
EXPO_PUBLIC_API_VALUE=your_actual_api_value_here

# OAuth Configuration
EXPO_PUBLIC_GOOGLE_CLIENT_ID=292228884076-q7ekohms81t3ue8mccthpded079h5mov.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
EXPO_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id_here
EXPO_PUBLIC_FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Development Settings
NODE_ENV=development
```

### Step 2: Replace Placeholder Values

Replace the placeholder values with your actual API credentials:

- `your_actual_api_key_here` → Your actual API key
- `your_actual_api_value_here` → Your actual API value
- `your_google_client_secret_here` → Your Google OAuth client secret
- `your_facebook_app_id_here` → Your Facebook App ID
- `your_facebook_app_secret_here` → Your Facebook App Secret

### Step 3: Restart the Development Server

After creating the `.env` file, you must restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
# or
expo start
```

### Step 4: Test Environment Variables

You can test if the environment variables are loading correctly by importing and calling the test function:

```typescript
import { testEnvironmentVariables } from './src/utils/envTest';

// Call this function to test
testEnvironmentVariables();
```

## Important Notes

1. **File Location**: The `.env` file must be in the project root (same level as `package.json`)

2. **Variable Naming**: All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in client-side code

3. **Restart Required**: You must restart the development server after creating or modifying the `.env` file

4. **Git Ignore**: The `.env` file is already in `.gitignore`, so it won't be committed to version control

5. **Security**: Never commit your actual API keys to version control. Use the `.env` file for local development and set environment variables in your production deployment platform.

## Troubleshooting

### Environment Variables Still Undefined

1. Check that the `.env` file is in the project root
2. Verify the variable names start with `EXPO_PUBLIC_`
3. Restart the development server
4. Check the console logs for debugging information

### TypeScript Errors

1. Make sure `src/types/env.d.ts` exists
2. Restart your TypeScript language server
3. Check that the variable names in the declaration file match your `.env` file

### Babel Configuration Issues

1. Verify `babel.config.js` includes the `react-native-dotenv` plugin
2. Make sure `react-native-dotenv` is installed
3. Clear the Metro cache: `npx expo start --clear`

## Production Deployment

For production deployments, set the environment variables in your deployment platform:

- **Expo/EAS**: Use `eas secret:create` or the EAS dashboard
- **Vercel**: Use the Environment Variables section in the dashboard
- **Netlify**: Use the Environment Variables section in the dashboard
- **Heroku**: Use `heroku config:set` or the dashboard

The environment variables will be automatically available in your production build.

## API Authentication Format

The API uses apikey authentication with the following format:

**Authentication Type:** `apikey`
- **Key:** `key` → **Value:** `{your_api_key}`
- **Key:** `value` → **Value:** `{your_api_value}`

**Example URL:**
```
https://yaizapp-backend.onrender.com/api/users/searchBy?id=1&key=your_api_key&value=your_api_value
```

The authentication parameters are automatically added to all API requests as query parameters, not as headers.
