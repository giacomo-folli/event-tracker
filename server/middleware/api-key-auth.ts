import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface ApiKeyAuthRequest extends Request {
  apiKey?: {
    id: number;
    name: string;
    userId: number;
  };
}

/**
 * Middleware to authenticate requests using API keys.
 * 
 * The API key should be provided in the 'X-API-Key' header.
 * If valid, adds apiKey object to the request containing the key's id, name, and userId.
 */
export async function apiKeyAuth(req: ApiKeyAuthRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return next(); // No API key provided, continue to next auth method
  }
  
  try {
    const key = await storage.getApiKeyByKey(apiKey);
    
    if (!key) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Check if the key is expired
    if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'API key expired' });
    }
    
    // Update last used timestamp
    await storage.updateApiKeyLastUsed(key.id);
    
    // Add apiKey info to request object for use in route handlers
    req.apiKey = {
      id: key.id,
      name: key.name,
      userId: key.userId
    };
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}