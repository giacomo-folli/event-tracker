import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useEvents() {
  const queryClient = useQueryClient();
  
  // Get all events
  const eventsQuery = useQuery<{ events: Event[] }>({
    queryKey: ["/api/events"],
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: (newEvent: Omit<Event, "id">) => 
      apiRequest("POST", "/api/events", newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...event }: Event) => 
      apiRequest("PUT", `/api/events/${id}`, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/events/${id}`),
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
