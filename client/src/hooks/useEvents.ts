import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useEvents() {
  const queryClient = useQueryClient();
  
  // Get all events
  const eventsQuery = useQuery<{ events: Event[] }>({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await apiRequest('/api/events');
      return response;
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (newEvent: Omit<Event, "id">) => 
      apiRequest("/api/events", "POST", newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...event }: Event) => 
      apiRequest(`/api/events/${id}`, "PUT", event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/events/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });
  
  return {
    events: eventsQuery.data?.events || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    refetch: eventsQuery.refetch,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    isPending: 
      createEventMutation.isPending || 
      updateEventMutation.isPending || 
      deleteEventMutation.isPending
  };
}
