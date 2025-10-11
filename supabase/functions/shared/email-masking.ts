/**
 * Shared utility for consistent email masking across Edge Functions
 * Prevents email exposure in logs while maintaining debugging capability
 */

/**
 * Masks an email address for logging purposes
 * Format: j***@e***
 * 
 * @param email - The email address to mask
 * @returns Masked email string
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '[invalid-email]';
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return '[malformed-email]';
  }

  const [localPart, domain] = parts;
  
  // Mask local part - show first character only
  const maskedLocal = localPart.charAt(0) + '***';
  
  // Mask domain - show first character only
  const maskedDomain = domain.charAt(0) + '***';
  
  return `${maskedLocal}@${maskedDomain}`;
}

/**
 * Masks an email address for display to users
 * Format: j***@example.com (shows full domain)
 * 
 * @param email - The email address to mask
 * @returns Masked email string with visible domain
 */
export function maskEmailForDisplay(email: string): string {
  if (!email || typeof email !== 'string') {
    return '[invalid-email]';
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return '[malformed-email]';
  }

  const [localPart, domain] = parts;
  
  // Mask local part - show first character only
  const maskedLocal = localPart.charAt(0) + '***';
  
  return `${maskedLocal}@${domain}`;
}
