import { Request, Response, NextFunction } from 'express';
import { ApiKeyAuthRequest } from './api-key-auth';

/**
 * Middleware to check if a request is authenticated either by session or API key.
 * This allows endpoints to be accessed via either authentication method.
 */
export function isAuthenticated(req: ApiKeyAuthRequest, res: Response, next: NextFunction) {
  // Check if authenticated by session
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check if authenticated by API key
  if (req.apiKey) {
    return next();
  }
  
  // Not authenticated by any method
  return res.status(401).json({ error: 'Authentication required' });
}

/**
 * Helper function to get the user ID from either session or API key authentication
 */
export function getUserId(req: ApiKeyAuthRequest): number | undefined {
  // If authenticated by session
  if (req.isAuthenticated() && req.user) {
    return req.user.id;
  }
  
  // If authenticated by API key
  if (req.apiKey) {
    return req.apiKey.userId;
  }
  
  return undefined;
}