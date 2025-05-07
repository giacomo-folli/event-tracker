import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useEventSharing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleSharingMutation = useMutation({
    mutationFn: async ({ eventId, isShared }: { eventId: number, isShared: boolean }) => {
      const response = await apiRequest(
        "PUT", 
        `/api/events/${eventId}/share`,
        { isShared }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update sharing status");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Update the event in the cache
      queryClient.invalidateQueries({ queryKey: [`/api/events/${data.event.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      
      const actionText = data.event.isShared ? "shared" : "unshared";
      toast({
        title: "Success",
        description: `Event ${actionText} successfully`,
      });
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