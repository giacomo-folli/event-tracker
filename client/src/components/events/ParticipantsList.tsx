import { useState } from "react";
import { useParticipants } from "@/hooks/useParticipants";
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
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Trash2, Loader2 } from "lucide-react";
import { EventParticipant } from "@shared/schema";

interface ParticipantsListProps {
  eventId: number;
}

export default function ParticipantsList({ eventId }: ParticipantsListProps) {
  const [participantToDelete, setParticipantToDelete] = useState<EventParticipant | null>(null);
  
  const { 
    participants, 
    isLoading, 
    updateAttendance, 
    deleteParticipant,
    isUpdating,
    isDeleting
  } = useParticipants(eventId);

  const handleAttendanceChange = (id: number, attended: boolean) => {
    updateAttendance({ id, attended });
  };

  const handleDelete = (participant: EventParticipant) => {
    setParticipantToDelete(participant);
  };

  const confirmDelete = () => {
    if (participantToDelete) {
      deleteParticipant(participantToDelete.id);
      setParticipantToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participants</CardTitle>
          <CardDescription>No participants have registered for this event yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Participants ({participants.length})</CardTitle>
          <CardDescription>Manage participants registered for this event</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Registered On</TableHead>
                <TableHead>Attended</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>{participant.name || "-"}</TableCell>
                  <TableCell>
                    {participant.registeredAt && 
                      format(new Date(participant.registeredAt), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>
                    <Checkbox 
                      checked={!!participant.attended}
                      onCheckedChange={(checked) => 
                        handleAttendanceChange(participant.id, checked as boolean)
                      }
                      disabled={isUpdating}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(participant)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!participantToDelete} onOpenChange={() => setParticipantToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {participantToDelete?.email} from this event.
              This action cannot be undone.
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
    </>
  );
}