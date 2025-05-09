import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CourseParticipant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type RegisterCourseParticipantData = {
  email: string;
  courseId: number;
};

export function useCourseParticipants(courseId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Only fetch if courseId is provided
  const participantsQuery = useQuery({
    queryKey: ['/api/courses/participants', courseId],
    queryFn: async () => {
      if (!courseId) return { participants: [] };
      const response = await apiRequest("GET", `/api/courses/${courseId}/participants`);
      return await response.json();
    },
    enabled: !!courseId, // Only run the query if courseId is provided
  });

  const registerParticipantMutation = useMutation({
    mutationFn: async (data: RegisterCourseParticipantData) => {
      const response = await apiRequest("POST", `/api/courses/${data.courseId}/participants`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "You've been registered for this course.",
      });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['/api/courses/participants', courseId] });
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
      const response = await apiRequest("PUT", `/api/courses/${courseId}/participants/${id}`, { attended });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance updated",
        description: "Participant attendance has been updated.",
      });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['/api/courses/participants', courseId] });
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
      const response = await apiRequest("DELETE", `/api/courses/${courseId}/participants/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Participant removed",
        description: "Participant has been removed from the course.",
      });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['/api/courses/participants', courseId] });
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
    participants: participantsQuery.data?.participants as CourseParticipant[] || [],
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