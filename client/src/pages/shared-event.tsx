import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Event } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ParticipantRegistrationForm from "@/components/events/ParticipantRegistrationForm";

export default function SharedEventPage() {
  const [, params] = useRoute("/events/shared/:token");
  const token = params?.token;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setError("Invalid share token");
      setLoading(false);
      return;
    }

    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/shared/${token}`);
        if (!response.ok) {
          throw new Error('Event not found or no longer shared');
        }
        const data = await response.json();
        setEvent(data.event);
      } catch (err) {
        setError("Failed to load event. It may not exist or is no longer shared.");
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
  }, [token, toast]);

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
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
                  <CardDescription className="text-blue-100 mt-2">
                    Shared Event
                  </CardDescription>
                </div>
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
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Date</h4>
                    <p className="mt-1 font-medium">{formatDate(new Date(event.startDate))}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Time</h4>
                    <p className="mt-1">
                      {formatTime(new Date(event.startDate))} - {formatTime(new Date(event.endDate))}
                    </p>
                  </div>
                </div>
                
                {event.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Location</h4>
                      <p className="mt-1">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="shadow-md h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Registration</CardTitle>
              <CardDescription>Sign up to attend this event</CardDescription>
            </CardHeader>
            
            <CardContent>
              {registrationSuccess ? (
                <div className="text-center py-6">
                  <div className="h-12 w-12 bg-green-100 text-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Registration Successful!</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Thank you for registering for this event. You'll receive updates via email.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setRegistrationSuccess(false)}
                    className="w-full"
                  >
                    Register another person
                  </Button>
                </div>
              ) : showRegistrationForm ? (
                <ParticipantRegistrationForm 
                  eventId={event.id}
                  eventTitle={event.title}
                  onSuccessfulRegistration={() => {
                    toast({
                      title: "Success!",
                      description: "You have successfully registered for this event.",
                    });
                    setRegistrationSuccess(true);
                    setShowRegistrationForm(false);
                  }}
                />
              ) : (
                <div className="text-center py-6">
                  <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Join this event</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Register now to attend and receive updates about this event.
                  </p>
                  <Button 
                    onClick={() => setShowRegistrationForm(true)}
                    className="w-full"
                  >
                    Register Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}