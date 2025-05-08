import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Event } from "@shared/schema";
import { Header } from "@/components/layout/Header";
import EventDetails from "@/components/events/EventDetails";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function EventDetailsPage() {
  const [, params] = useRoute("/admin/events/:id");
  const eventId = params?.id ? parseInt(params.id) : null;
  const { toast } = useToast();
  // State to store the local version of the event (for immediate UI updates)
  const [localEvent, setLocalEvent] = useState<Event | null>(null);

  // Use React Query to fetch event data
  const { 
    data: eventData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/events', eventId?.toString()],
    queryFn: async () => {
      if (!eventId) return null;
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event");
      }
      const data = await response.json();
      console.log("Fetched event data:", data.event);
      return data.event;
    },
    enabled: !!eventId,
  });

  // Update localEvent when eventData changes
  useEffect(() => {
    if (eventData) {
      setLocalEvent(eventData);
    }
  }, [eventData]);

  // Extract event from local state
  const event = localEvent || eventData as Event | null;

  // Show error toast if query fails
  if (error) {
    console.error("Error fetching event:", error);
    toast({
      title: "Error",
      description: "Could not load event details",
      variant: "destructive",
    });
  }

  // Define interface to match EditEventForm
  interface EventApiUpdate {
    id: number;
    title: string;
    description: string | null;
    location: string | null;
    startDate: string; // ISO string format for the API
    endDate: string; // ISO string format for the API
    creatorId: number | null;
    isShared: boolean;
    shareToken: string | null;
    shareUrl: string | null;
  }
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (updatedEvent: EventApiUpdate) => {
      if (!eventId) throw new Error("No event ID available");
      const response = await apiRequest("PUT", `/api/events/${eventId}`, updatedEvent);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error (" + response.status + "):", errorData);
        throw new Error("Failed to update event");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Update successful. Server response:", data);
      
      // Update local state with the server response
      setLocalEvent(data.event);
      
      // Invalidate queries to refresh the list view
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  });

  const handleSaveEvent = async (updatedEvent: EventApiUpdate) => {
    console.log('Sending updated event to API:', updatedEvent);
    
    // Immediately update the local state for instant UI feedback
    if (event) {
      // Convert the dates properly for the local state object
      const updatedLocalEvent = {
        ...event,
        title: updatedEvent.title,
        description: updatedEvent.description,
        location: updatedEvent.location,
        isShared: updatedEvent.isShared,
        shareToken: updatedEvent.shareToken,
        shareUrl: updatedEvent.shareUrl
      };
      
      setLocalEvent(updatedLocalEvent);
    }
    
    // Send update to the server
    updateEventMutation.mutate(updatedEvent);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title={event ? `${event.title}` : "Event Details"} 
        backRoute="/"
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : event ? (
          <EventDetails event={event} onSave={handleSaveEvent} />
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Event not found</p>
          </div>
        )}
      </main>
    </div>
  );
}