import { useState } from "react";
import { Event } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import ParticipantsList from "./ParticipantsList";
import { EditEventForm } from "./EditEventForm";

interface EventDetailsProps {
  event: Event;
  onSave: (updatedEvent: Event) => void;
}

export default function EventDetails({ event, onSave }: EventDetailsProps) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
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
      </CardContent>
    </Card>
  );
}