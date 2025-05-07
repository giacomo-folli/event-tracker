import { useState } from "react";
import { Event } from "@shared/schema";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Trash, Pencil, Share2, Users } from "lucide-react";
import { EventForm } from "./EventForm";
import { EventShareDialog } from "./EventShareDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface EventListProps {
  events: Event[];
  onEventChange: () => void;
}

export function EventList({ events, onEventChange }: EventListProps) {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [shareEvent, setShareEvent] = useState<Event | null>(null);

  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (eventId: number) => {
    setEventToDelete(eventId);
  };

  const confirmDelete = async () => {
    try {
      if (eventToDelete === null) return;
      
      await apiRequest("DELETE", `/api/events/${eventToDelete}`);
      
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully",
      });
      
      onEventChange();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete the event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEventToDelete(null);
    }
  };

  return (
    <>
      {/* Events Table (Desktop) */}
      <div className="hidden md:block overflow-hidden shadow-sm rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length > 0 ? (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <div>
                      {format(new Date(event.startDate), "yyyy-MM-dd")}
                      {format(new Date(event.startDate), "yyyy-MM-dd") !== format(new Date(event.endDate), "yyyy-MM-dd") && 
                        ` to ${format(new Date(event.endDate), "yyyy-MM-dd")}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(event.startDate), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell className="max-w-xs truncate">{event.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShareEvent(event)}
                      className="text-blue-600 hover:text-blue-700 mr-2"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Share</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(event)}
                      className="text-primary hover:text-primary mr-2"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(event.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No events found. Create your first event by clicking the "Add Event" button.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Events Cards (Mobile) */}
      <div className="md:hidden space-y-4">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="p-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{event.title}</h3>
                  <div className="ml-2 flex-shrink-0 flex">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShareEvent(event)}
                      className="mr-1 text-blue-600 hover:bg-blue-50"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(event)}
                      className="mr-1 text-primary hover:bg-primary-50"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(event.id)}
                      className="text-destructive hover:bg-red-50"
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                    <span>
                      {format(new Date(event.startDate), "yyyy-MM-dd")}
                      {format(new Date(event.startDate), "yyyy-MM-dd") !== format(new Date(event.endDate), "yyyy-MM-dd") && 
                        ` to ${format(new Date(event.endDate), "yyyy-MM-dd")}`}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>
                    {format(new Date(event.startDate), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
                  </span>
                </div>

                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  <span>{event.location}</span>
                </div>

                {event.description && (
                  <p className="mt-2 text-sm text-gray-500">{event.description}</p>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">
              No events found. Create your first event by clicking the "Add Event" button.
            </p>
          </Card>
        )}
      </div>

      {/* Event form modal */}
      {isFormOpen && (
        <EventForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedEvent(undefined);
          }}
          event={selectedEvent}
          onSuccess={onEventChange}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={eventToDelete !== null} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Share dialog */}
      {shareEvent && (
        <EventShareDialog 
          event={shareEvent} 
          isOpen={!!shareEvent} 
          onClose={() => setShareEvent(null)} 
        />
      )}
    </>
  );
}
