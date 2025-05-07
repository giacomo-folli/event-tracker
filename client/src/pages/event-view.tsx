import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Event } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Share2 } from "lucide-react";
import { format } from "date-fns";
import { EventShareDialog } from "@/components/events/EventShareDialog";
import { useToast } from "@/hooks/use-toast";

export default function EventView() {
  const [, params] = useRoute("/events/:id");
  const eventId = params?.id ? parseInt(params.id) : null;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!eventId) {
      setError("Invalid event ID");
      setLoading(false);
      return;
    }

    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error('Event not found');
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        setError("Failed to load event. It may not exist or has been deleted.");
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <h2 className="text-xl font-medium">Loading event details...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Event Not Found</CardTitle>
            <CardDescription>
              {error || "The event you're looking for doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
            >
              Return to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy");
  };

  const formatTime = (date: Date) => {
    return format(new Date(date), "h:mm a");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                <CardDescription className="text-blue-100 mt-2">
                  Hosted by Event Management System
                </CardDescription>
              </div>
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex items-center gap-1"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            {event.description && (
              <div>
                <h3 className="text-lg font-medium">Description</h3>
                <p className="mt-2 text-gray-700">{event.description}</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Date</h4>
                  <p className="text-gray-700">{formatDate(event.startDate)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-900">Time</h4>
                  <p className="text-gray-700">
                    {formatTime(event.startDate)} – {formatTime(event.endDate)}
                  </p>
                </div>
              </div>
              
              {event.location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">Location</h4>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t flex justify-between items-center">
            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
              Public Event
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {event && (
        <EventShareDialog 
          event={event} 
          isOpen={isShareDialogOpen} 
          onClose={() => setIsShareDialogOpen(false)} 
        />
      )}
    </div>
  );
}