/**
 * Utility to detect if we're running inside Lovable preview iframe
 */
export function isLovablePreview(): boolean {
  // Check if hostname contains lovable domains
  const hostname = window.location.hostname;
  const isLovableDomain = hostname.includes('lovable.app') || hostname.includes('lovableproject.com');
  
  // Check for __lovable_token in URL (indicates Lovable editor)
  const hasLovableToken = window.location.search.includes('__lovable_token=');
  
  return isLovableDomain && hasLovableToken;
}

/**
 * Get a visual banner message for preview mode
 */
export function getPreviewBanner(): string {
  return '🔍 Lovable Preview Mode (Read-Only)';
}
