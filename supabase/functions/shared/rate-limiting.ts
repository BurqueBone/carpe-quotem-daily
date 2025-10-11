/**
 * Shared rate limiting utilities for Edge Functions
 * Provides IP-based rate limiting with configurable windows
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string; // IP address or other unique identifier
}

/**
 * Check if a request should be rate limited
 * Uses a simple in-memory approach suitable for edge functions
 * 
 * @param supabase - Supabase client instance
 * @param config - Rate limiting configuration
 * @returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  supabase: any,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining?: number }> {
  const { identifier, maxRequests, windowMs } = config;
  
  const windowStart = new Date(Date.now() - windowMs);
  
  try {
    // Count recent requests from this identifier
    const { count, error } = await supabase
      .from('security_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', identifier)
      .gte('timestamp', windowStart.toISOString());
    
    if (error) {
      console.error('Rate limit check error:', error);
      // Fail open - allow request if we can't check rate limit
      return { allowed: true };
    }
    
    const requestCount = count || 0;
    const allowed = requestCount < maxRequests;
    const remaining = Math.max(0, maxRequests - requestCount - 1);
    
    return { allowed, remaining };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request if we can't check rate limit
    return { allowed: true };
  }
}

/**
 * Log a request to security logs for rate limiting tracking
 * 
 * @param supabase - Supabase client instance
 * @param action - Action being performed
 * @param ipAddress - IP address of requester
 * @param userAgent - User agent string
 */
export async function logRequest(
  supabase: any,
  action: string,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  try {
    await supabase
      .from('security_logs')
      .insert({
        action,
        ip_address: ipAddress,
        user_agent: userAgent,
        table_name: 'rate_limit',
        user_id: null,
        target_user_id: null
      });
  } catch (error) {
    console.error('Failed to log request:', error);
    // Don't throw - logging failures shouldn't block requests
  }
}

/**
 * Extract IP address from request headers
 * Checks multiple headers used by different proxies
 * 
 * @param req - Request object
 * @returns IP address or 'unknown'
 */
export function getClientIP(req: Request): string {
  // Check various headers that might contain the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}
