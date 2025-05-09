import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface ApiKeyAuthRequest extends Request {
  apiKey?: {
    id: number;
    name: string;
    userId: number;
  };
}

// Define the whitelist of allowed endpoints for API key authentication
const ALLOWED_ENDPOINTS: Record<string, RegExp[]> = {
  'GET': [/^\/api\/events(\/.*)?$/, /^\/api\/courses(\/.*)?$/, /^\/api\/media(\/.*)?$/, /^\/api\/training-sessions(\/.*)?$/],
  'POST': [/^\/api\/events\/\d+\/participants$/]
};

/**
 * Middleware to authenticate requests using API keys.
 * 
 * The API key should be provided in the 'X-API-Key' header.
 * API keys are restricted to:
 * - GET requests on all endpoints
 * - POST requests only for event participant registration
 * All other methods (PUT, DELETE, etc.) are not allowed with API key authentication.
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
    
    // Check if the HTTP method and endpoint are allowed with API key
    const method = req.method;
    const path = req.path;
    
    // Check if the request method is valid for API key authentication
    if (!ALLOWED_ENDPOINTS[method as keyof typeof ALLOWED_ENDPOINTS]) {
      return res.status(403).json({ 
        error: 'This HTTP method is not allowed with API key authentication',
        message: 'API keys can only be used for GET requests and POST requests for event registration'
      });
    }
    
    // Check if the endpoint is in the allowed list for the method
    const isAllowedEndpoint = ALLOWED_ENDPOINTS[method as keyof typeof ALLOWED_ENDPOINTS].some((pattern: RegExp) => pattern.test(path));
    if (!isAllowedEndpoint) {
      return res.status(403).json({ 
        error: 'This endpoint is not accessible with API key authentication',
        message: 'API keys have limited access to endpoints'
      });
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