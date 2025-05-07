import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Event } from "@shared/schema";
import { Header } from "@/components/layout/Header";
import EventDetails from "@/components/events/EventDetails";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function EventDetailsPage() {
  const [, params] = useRoute("/admin/events/:id");
  const eventId = params?.id ? parseInt(params.id) : null;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!eventId) return;

    async function fetchEvent() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Could not load event details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, toast]);

  const handleSaveEvent = async (updatedEvent: Event) => {
    try {
      const response = await apiRequest("PUT", `/api/events/${eventId}`, updatedEvent);
      if (!response.ok) {
        throw new Error("Failed to update event");
      }
      const data = await response.json();
      setEvent(data.event);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title={event ? `${event.title}` : "Event Details"} 
        backRoute="/dashboard"
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        {loading ? (
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