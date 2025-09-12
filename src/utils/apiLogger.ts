/**
 * API Logger Utility
 * Provides consistent logging for all API calls across the application
 */

export interface ApiLogOptions {
  service: string;
  method: string;
  url: string;
  params?: any;
  headers?: Record<string, string>;
  body?: any;
  response?: any;
  error?: any;
  duration?: number;
}

export class ApiLogger {
  private static startTime: number = 0;

  /**
   * Log the start of an API call
   */
  static logStart(options: Pick<ApiLogOptions, 'service' | 'method' | 'url' | 'params' | 'headers' | 'body'>): void {
    this.startTime = Date.now();
    
    console.log(`🚀 [${options.service}] Starting ${options.method} request...`);
    console.log(`📡 [${options.service}] URL: ${options.url}`);
    
    if (options.params) {
      console.log(`🔍 [${options.service}] Params:`, JSON.stringify(options.params, null, 2));
    }
    
    if (options.headers) {
      console.log(`📤 [${options.service}] Headers:`, options.headers);
    }
    
    if (options.body) {
      console.log(`📦 [${options.service}] Body:`, JSON.stringify(options.body, null, 2));
    }
  }

  /**
   * Log a successful API response
   */
  static logSuccess(options: Pick<ApiLogOptions, 'service' | 'response'>): void {
    const duration = Date.now() - this.startTime;
    
    console.log(`✅ [${options.service}] Request successful (${duration}ms)`);
    console.log(`📥 [${options.service}] Response:`, JSON.stringify(options.response, null, 2));
  }

  /**
   * Log an API error
   */
  static logError(options: Pick<ApiLogOptions, 'service' | 'error'>): void {
    const duration = Date.now() - this.startTime;
    
    console.error(`❌ [${options.service}] Request failed (${duration}ms)`);
    console.error(`💥 [${options.service}] Error:`, options.error);
  }

  /**
   * Log API response details
   */
  static logResponse(options: Pick<ApiLogOptions, 'service' | 'response' | 'duration'>): void {
    console.log(`📊 [${options.service}] Response received (${options.duration}ms)`);
    console.log(`📈 [${options.service}] Data count:`, Array.isArray(options.response) ? options.response.length : 'N/A');
  }

  /**
   * Log authentication status
   */
  static logAuth(service: string, hasToken: boolean): void {
    console.log(`🔑 [${service}] Auth token present: ${hasToken}`);
  }

  /**
   * Log search parameters
   */
  static logSearch(service: string, params: any): void {
    console.log(`🔍 [${service}] Search parameters:`, JSON.stringify(params, null, 2));
  }

  /**
   * Log API URL construction
   */
  static logUrl(service: string, url: string): void {
    console.log(`🌐 [${service}] Constructed URL: ${url}`);
  }
}

/**
 * Helper function to wrap API calls with logging
 */
export async function withApiLogging<T>(
  service: string,
  method: string,
  url: string,
  apiCall: () => Promise<T>,
  options?: {
    params?: any;
    headers?: Record<string, string>;
    body?: any;
  }
): Promise<T> {
  ApiLogger.logStart({ service, method, url, ...options });
  
  try {
    const result = await apiCall();
    ApiLogger.logSuccess({ service, response: result });
    return result;
  } catch (error) {
    ApiLogger.logError({ service, error });
    throw error;
  }
}
