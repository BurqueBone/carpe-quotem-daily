import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Masks an email address for privacy protection
 * Example: john.doe@example.com -> j***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email; // Return original if invalid format
  
  // Show first character and mask the rest of local part
  let maskedLocal = localPart.charAt(0);
  if (localPart.length > 1) {
    maskedLocal += '*'.repeat(Math.min(localPart.length - 1, 6)); // Max 6 asterisks
  }
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Masks an email for logging purposes with more aggressive masking
 * Example: john.doe@example.com -> j***@e***
 */
export function maskEmailForLogs(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return '[invalid-email]';
  
  const maskedLocal = localPart.charAt(0) + '***';
  const maskedDomain = domain.charAt(0) + '***';
  
  return `${maskedLocal}@${maskedDomain}`;
}
