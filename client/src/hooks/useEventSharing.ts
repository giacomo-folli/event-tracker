import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UpdateEventSharing } from "@shared/schema";

interface ToggleSharingParams {
  eventId: number;
  isShared: boolean;
}

export function useEventSharing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation to toggle event sharing status
  const toggleSharingMutation = useMutation({
    mutationFn: async ({ eventId, isShared }: ToggleSharingParams) => {
      const sharingData: UpdateEventSharing = { isShared };
      const response = await apiRequest("PUT", `/api/events/${eventId}/share`, sharingData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update sharing status");
      }
      
      return await response.json();
    },
    onSuccess: (_data, variables) => {
      // Show different toast messages based on the action (enable/disable sharing)
      toast({
        title: variables.isShared ? "Event shared" : "Event sharing disabled",
        description: variables.isShared 
          ? "This event is now publicly accessible via a share link"
          : "This event is now private",
      });
      
      // Invalidate event queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', variables.eventId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sharing status",
        variant: "destructive",
      });
    },
  });

  return {
    toggleSharingMutation,
  };
}