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
import { Link as LinkIcon, ExternalLink, Loader2 } from "lucide-react";
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
            <div className="flex items-center">
              <Switch 
                id="share-toggle"
                checked={event.isShared || false}
                onCheckedChange={handleToggleSharing}
                disabled={toggleSharingMutation.isPending}
                className="mr-2"
              />
              <Label htmlFor="share-toggle" className="text-sm font-medium">
                {event.isShared ? "Public" : "Private"}
              </Label>
            </div>
            
            {event.isShared && event.shareUrl && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2 text-xs flex items-center"
                onClick={copyShareUrl}
              >
                <LinkIcon className="h-3.5 w-3.5 mr-1" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Event Details</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
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
              
              {event.isShared && event.shareUrl && (
                <div className="border rounded-md p-3 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Public Link
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      This event is publicly viewable at this link
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center text-xs"
                    onClick={() => event.shareUrl && window.open(event.shareUrl, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    View
                  </Button>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <h3 className="mb-4 text-lg font-medium">Edit Event</h3>
                <EditEventForm event={event} onSave={onSave} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="participants" className="mt-4">
            <ParticipantsList eventId={event.id} />
          </TabsContent>
        </Tabs>
        
        {toggleSharingMutation.isPending && (
          <div className="mt-4 flex justify-center py-2 bg-gray-50 rounded-md">
            <p className="text-sm flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating sharing status...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}