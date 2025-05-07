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
 * @returns The full share URL
 */
export function generateShareUrl(token: string): string {
  // Using client-side path format for easier integration with frontend routing
  return `/events/shared/${token}`;
}