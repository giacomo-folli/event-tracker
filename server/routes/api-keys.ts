import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { apiKeyFormSchema } from '@shared/schema';
import { isAuthenticated, getUserId } from '../middleware/auth-check';
import { ApiKeyAuthRequest } from '../middleware/api-key-auth';

const router = Router();

// Get all API keys for the authenticated user
router.get('/', isAuthenticated, async (req: ApiKeyAuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const apiKeys = await storage.getUserApiKeys(userId);
    
    // Don't send the actual key value in the response for security
    const safeApiKeys = apiKeys.map((key: any) => ({
      id: key.id,
      name: key.name,
      createdAt: key.createdAt,
      lastUsedAt: key.lastUsedAt,
      isActive: key.isActive,
      expiresAt: key.expiresAt,
    }));
    
    res.json({ apiKeys: safeApiKeys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create a new API key
router.post('/', isAuthenticated, async (req: ApiKeyAuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Validate request data
    const validationResult = apiKeyFormSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid API key data',
        details: validationResult.error.format() 
      });
    }
    
    const { name, expiryDays } = validationResult.data;
    
    // Create the API key (null expiryDays means it never expires)
    const apiKey = await storage.createApiKey(userId, name, expiryDays === null ? undefined : expiryDays);
    
    // Return the full key only once during creation
    res.status(201).json({ 
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // Important: this is the only time the full key is returned
        createdAt: apiKey.createdAt,
        isActive: apiKey.isActive,
        expiresAt: apiKey.expiresAt
      },
      message: 'API key created successfully. Save this key as it will not be shown again.'
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Toggle API key active status
router.put('/:id/toggle', isAuthenticated, async (req: ApiKeyAuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const keyId = parseInt(req.params.id);
    if (isNaN(keyId)) {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }
    
    // Check if the API key belongs to the user
    const apiKey = await storage.getApiKey(keyId);
    if (!apiKey || apiKey.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to manage this API key' });
    }
    
    const isActive = req.body.isActive === true;
    const updatedKey = await storage.toggleApiKeyStatus(keyId, isActive);
    
    if (!updatedKey) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ 
      apiKey: {
        id: updatedKey.id,
        name: updatedKey.name,
        isActive: updatedKey.isActive,
        createdAt: updatedKey.createdAt,
        lastUsedAt: updatedKey.lastUsedAt,
        expiresAt: updatedKey.expiresAt
      },
      message: `API key ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling API key status:', error);
    res.status(500).json({ error: 'Failed to update API key' });
  }
});

// Delete an API key
router.delete('/:id', isAuthenticated, async (req: ApiKeyAuthRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const keyId = parseInt(req.params.id);
    if (isNaN(keyId)) {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }
    
    // Check if the API key belongs to the user
    const apiKey = await storage.getApiKey(keyId);
    if (!apiKey || apiKey.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this API key' });
    }
    
    const success = await storage.deleteApiKey(keyId);
    
    if (!success) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

export default router;