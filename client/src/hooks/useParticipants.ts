import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { EventParticipant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type RegisterParticipantData = {
  email: string;
  name?: string;
  eventId: number;
};

export function useParticipants(eventId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Only fetch if eventId is provided
  const participantsQuery = useQuery({
    queryKey: ['/api/events/participants', eventId],
    queryFn: async () => {
      if (!eventId) return { participants: [] };
      const response = await apiRequest("GET", `/api/events/${eventId}/participants`);
      return await response.json();
    },
    enabled: !!eventId, // Only run the query if eventId is provided
  });

  const registerParticipantMutation = useMutation({
    mutationFn: async (data: RegisterParticipantData) => {
      const response = await apiRequest("POST", `/api/events/${data.eventId}/participants`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "You've been registered for this event.",
      });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['/api/events/participants', eventId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, attended }: { id: number; attended: boolean }) => {
      const response = await apiRequest("PUT", `/api/events/participants/${id}/attendance`, { attended });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance updated",
        description: "Participant attendance has been updated.",
      });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['/api/events/participants', eventId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteParticipantMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/events/participants/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Participant removed",
        description: "Participant has been removed from the event.",
      });
      if (eventId) {
        queryClient.invalidateQueries({ queryKey: ['/api/events/participants', eventId] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Removal failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    participants: participantsQuery.data?.participants as EventParticipant[] || [],
    isLoading: participantsQuery.isLoading,
    error: participantsQuery.error,
    registerParticipant: registerParticipantMutation.mutate,
    updateAttendance: updateAttendanceMutation.mutate,
    deleteParticipant: deleteParticipantMutation.mutate,
    isRegistering: registerParticipantMutation.isPending,
    isUpdating: updateAttendanceMutation.isPending,
    isDeleting: deleteParticipantMutation.isPending,
  };
}