import { randomBytes } from 'crypto';

/**
 * Generates a secure random token for event sharing
 * @returns A random token string
 */
export function generateShareToken(): string {
  // Generate a random 32-byte token and convert to hex
  return randomBytes(32).toString('hex');
}

/**
 * Generates a share URL based on the token
 * @param token The share token
 * @param type The type of resource being shared (default: 'events')
 * @returns The full share URL
 */
export function generateShareUrl(token: string, type: 'events' | 'courses' = 'events'): string {
  // Using client-side path format for easier integration with frontend routing
  return `/${type}/shared/${token}`;
}