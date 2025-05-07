import { useState } from "react";
import { Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import ParticipantsList from "./ParticipantsList";
import { EditEventForm } from "./EditEventForm";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEventSharing } from "@/hooks/useEventSharing";
import { useToast } from "@/hooks/use-toast";
import { Link as LinkIcon, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventDetailsProps {
  event: Event;
  onSave: (updatedEvent: Event) => void;
}

export default function EventDetails({ event, onSave }: EventDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");
  const { toggleSharingMutation } = useEventSharing();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Function to toggle event sharing
  const handleToggleSharing = async () => {
    try {
      await toggleSharingMutation.mutateAsync({
        eventId: event.id,
        isShared: !event.isShared
      });
    } catch (error) {
      console.error('Error toggling event sharing:', error);
    }
  };

  // Function to copy share URL to clipboard
  const copyShareUrl = () => {
    if (event.shareUrl) {
      navigator.clipboard.writeText(event.shareUrl)
        .then(() => {
          setCopied(true);
          toast({
            title: "Copied!",
            description: "Event link copied to clipboard",
          });
          
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          toast({
            title: "Error",
            description: "Failed to copy link to clipboard",
            variant: "destructive",
          });
        });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{event.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={event.isShared ? "bg-green-100 text-green-800 hover:bg-green-100" : ""} variant={event.isShared ? "outline" : "secondary"}>
              {event.isShared ? "Shared" : "Private"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1">{event.location || "No location specified"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date and Time</h3>
                <p className="mt-1">
                  {format(new Date(event.startDate), "PPP")} at {" "}
                  {format(new Date(event.startDate), "p")} - {format(new Date(event.endDate), "p")}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{event.description || "No description provided"}</p>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="mb-4 text-lg font-medium">Edit Event</h3>
                <EditEventForm event={event} onSave={onSave} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="participants" className="mt-4">
            <ParticipantsList eventId={event.id} />
          </TabsContent>

          <TabsContent value="sharing" className="mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Event Sharing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  When an event is shared, anyone with the link can view the event details and register as a participant without logging in.
                </p>
                
                <div className="flex items-center space-x-2 mb-6">
                  <Switch 
                    id="share-toggle"
                    checked={event.isShared || false}
                    onCheckedChange={handleToggleSharing}
                    disabled={toggleSharingMutation.isPending}
                  />
                  <Label htmlFor="share-toggle">
                    {event.isShared ? "Event is publicly shared" : "Event is private"}
                  </Label>
                </div>
              </div>

              {event.isShared && event.shareUrl && (
                <div className="border rounded-md p-4 bg-gray-50">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Share Link
                  </h4>
                  
                  <div className="flex mt-2">
                    <Input 
                      readOnly 
                      value={event.shareUrl}
                      className="flex-1 bg-white"
                    />
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="ml-2"
                      onClick={copyShareUrl}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center text-sm"
                      onClick={() => event.shareUrl && window.open(event.shareUrl, '_blank')}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Open shared page
                    </Button>
                  </div>
                </div>
              )}

              {toggleSharingMutation.isPending && (
                <div className="flex justify-center py-4">
                  <p className="text-sm">Updating sharing status...</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}