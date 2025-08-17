import * as WebBrowser from 'expo-web-browser';
import { getOAuthConfig, getRedirectUri } from '../config/oauth';

// User data interface
export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  provider: 'google' | 'facebook' | 'direct';
}

// Initialize OAuth services
export const initializeOAuth = () => {
  try {
    // Initialize WebBrowser for OAuth
    WebBrowser.maybeCompleteAuthSession();
    console.log('Expo WebBrowser initialized successfully');
  } catch (error) {
    console.error('Error initializing OAuth:', error);
  }
};

// Google OAuth Service using WebBrowser
export class GoogleOAuthService {
  static async signIn(): Promise<OAuthUser> {
    try {
      const config = getOAuthConfig();
      
      if (!config.GOOGLE.CLIENT_ID) {
        throw new Error('Google CLIENT_ID not configured');
      }
      
      console.log('Starting Google OAuth with client ID:', config.GOOGLE.CLIENT_ID);
      
      // Create OAuth URL manually
      const redirectUri = getRedirectUri();
      const scopes = config.GOOGLE.SCOPES.join(' ');
      const authUrl = `${config.GOOGLE.AUTH_ENDPOINT}?` +
        `client_id=${encodeURIComponent(config.GOOGLE.CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&access_type=offline` +
        `&prompt=consent` +
        `&state=${encodeURIComponent('google_oauth_state')}`;
      
      console.log('Opening OAuth URL:', authUrl);
      
      // Open OAuth URL in WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      console.log('WebBrowser result:', result);
      
      if (result.type === 'success' && result.url) {
        console.log('OAuth successful, extracting code from URL...');
        
        // Extract authorization code from URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          console.log('Authorization code received, exchanging for token...');
          
          // Exchange authorization code for access token
          const tokenResponse = await this.exchangeCodeForToken(code, redirectUri);
          
          console.log('Token exchange successful, getting user info...');
          
          // Get user info using access token
          const userInfo = await this.getUserInfo(tokenResponse.access_token);
          
          console.log('User info retrieved:', userInfo);
          
          // Create user object
          const user: OAuthUser = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            photo: userInfo.picture,
            provider: 'google',
          };
          
          console.log('Google OAuth successful, user:', user);
          return user;
        } else {
          throw new Error('No authorization code received');
        }
      } else if (result.type === 'cancel') {
        console.log('OAuth was cancelled by user');
        throw new Error('Google OAuth was cancelled');
      } else {
        console.log('OAuth failed with result type:', result.type);
        throw new Error('Google OAuth failed');
      }
      
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  }
  
  // Exchange authorization code for access token
  private static async exchangeCodeForToken(code: string, redirectUri: string): Promise<any> {
    const config = getOAuthConfig();
    
    const tokenUrl = config.GOOGLE.TOKEN_ENDPOINT;
    const params = new URLSearchParams({
      code: code,
      client_id: config.GOOGLE.CLIENT_ID,
      client_secret: config.GOOGLE.CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange authorization code for token');
    }
    
    const tokenData = await response.json();
    return tokenData;
  }
  
  // Get user info from Google API
  private static async getUserInfo(accessToken: string): Promise<any> {
    const config = getOAuthConfig();
    
    const response = await fetch(config.GOOGLE.USER_INFO_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    return await response.json();
  }
  
  static async signOut(): Promise<void> {
    try {
      console.log('Google sign out completed');
    } catch (error) {
      console.error('Google sign out error:', error);
    }
  }
  
  static async isSignedIn(): Promise<boolean> {
    return false;
  }
  
  static async getCurrentUser(): Promise<OAuthUser | null> {
    return null;
  }
}

// Facebook OAuth Service
export class FacebookOAuthService {
  static async signIn(): Promise<OAuthUser> {
    try {
      const config = getOAuthConfig();
      
      if (!config.FACEBOOK.APP_ID) {
        throw new Error('Facebook APP_ID not configured');
      }
      
      // Create OAuth URL manually
      const redirectUri = getRedirectUri();
      const permissions = config.FACEBOOK.PERMISSIONS.join(',');
      const authUrl = `${config.FACEBOOK.AUTH_ENDPOINT}?` +
        `client_id=${encodeURIComponent(config.FACEBOOK.APP_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=${encodeURIComponent(permissions)}`;
      
      console.log('Starting Facebook OAuth with URL:', authUrl);
      
      // Open OAuth URL in WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      console.log('Facebook OAuth result:', result);
      
      if (result.type === 'success' && result.url) {
        // Extract authorization code from URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          // Exchange authorization code for access token
          const tokenResponse = await this.exchangeCodeForToken(code, redirectUri);
          
          // Get user info using access token
          const userInfo = await this.getUserInfo(tokenResponse.access_token);
          
          // Create user object
          const user: OAuthUser = {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            photo: userInfo.picture?.data?.url,
            provider: 'facebook',
          };
          
          console.log('Facebook OAuth successful, user:', user);
          return user;
        } else {
          throw new Error('No authorization code received');
        }
      } else if (result.type === 'cancel') {
        throw new Error('Facebook OAuth was cancelled');
      } else {
        throw new Error('Facebook OAuth failed');
      }
      
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      throw error;
    }
  }
  
  // Exchange authorization code for access token
  private static async exchangeCodeForToken(code: string, redirectUri: string): Promise<any> {
    const config = getOAuthConfig();
    
    const tokenUrl = config.FACEBOOK.TOKEN_ENDPOINT;
    const params = new URLSearchParams({
      code: code,
      client_id: config.FACEBOOK.APP_ID,
      client_secret: config.FACEBOOK.APP_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      throw new Error('Failed to exchange authorization code for token');
    }
    
    const tokenData = await response.json();
    return tokenData;
  }
  
  // Get user info from Facebook API
  private static async getUserInfo(accessToken: string): Promise<any> {
    const config = getOAuthConfig();
    
    const response = await fetch(`${config.FACEBOOK.USER_INFO_ENDPOINT}?fields=id,name,email,picture&access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    return await response.json();
  }
  
  static async signOut(): Promise<void> {
    console.log('Facebook sign out completed');
  }
}

// Combined OAuth Service
export class OAuthService {
  static async signInWithGoogle(): Promise<OAuthUser> {
    return await GoogleOAuthService.signIn();
  }
  
  static async signInWithFacebook(): Promise<OAuthUser> {
    return await FacebookOAuthService.signIn();
  }
  
  static async signOutFromGoogle(): Promise<void> {
    return await GoogleOAuthService.signOut();
  }
  
  static async signOutFromFacebook(): Promise<void> {
    return await FacebookOAuthService.signOut();
  }
  
  static async signOutFromAll(): Promise<void> {
    try {
      await Promise.all([
        GoogleOAuthService.signOut(),
        FacebookOAuthService.signOut(),
      ]);
    } catch (error) {
      console.error('Sign out from all providers error:', error);
      // Continue even if one fails
    }
  }
} 