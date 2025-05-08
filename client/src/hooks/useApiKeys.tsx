import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ApiKey, apiKeyFormSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function useApiKeys() {
  const { toast } = useToast();
  
  // Fetch API keys
  const { 
    data: apiKeys = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/keys'],
    queryFn: async () => {
      const response = await fetch('/api/keys');
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      const data = await response.json();
      return data.apiKeys;
    }
  });
  
  // Create a new API key
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof apiKeyFormSchema>) => {
      const res = await apiRequest('POST', '/api/keys', data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: "API Key Created",
        description: "Your new API key has been created. Make sure to copy it now as it won't be shown again.",
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create API key",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Toggle API key status (active/inactive)
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest('PUT', `/api/keys/${id}/toggle`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: "API Key Updated",
        description: "The API key status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update API key",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete an API key
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/keys/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete API key",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    apiKeys,
    isLoading,
    error,
    refetch,
    createApiKey: createMutation.mutate,
    isCreating: createMutation.isPending,
    createdApiKey: createMutation.data?.apiKey,
    toggleApiKeyStatus: toggleStatusMutation.mutate,
    isToggling: toggleStatusMutation.isPending,
    deleteApiKey: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}