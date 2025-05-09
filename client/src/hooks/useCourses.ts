import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Course, UpdateCourseSharing } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useCourses() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all courses
  const coursesQuery = useQuery<{ courses: Course[] }>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await apiRequest("GET", '/api/courses');
      return response.json();
    },
  });
  
  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: (newCourse: Omit<Course, "id">) => 
      apiRequest("POST", "/api/courses", newCourse),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create course: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, ...course }: Course) => 
      apiRequest("PUT", `/api/courses/${id}`, course),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update course: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Share course mutation
  const shareCourseMutation = useMutation({
    mutationFn: async ({ id, isShared }: { id: number, isShared: boolean }) => {
      const response = await apiRequest("PUT", `/api/courses/${id}/share`, { isShared });
      return response.json();
    },
    onSuccess: (data: Course) => {
      toast({
        title: data.isShared ? "Course Shared" : "Course Unshared",
        description: data.isShared 
          ? "Course is now publicly accessible via the share link" 
          : "Course is no longer publicly accessible",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update sharing status: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/courses/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete course: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Get course by token
  const getCourseByToken = async (token: string) => {
    const response = await apiRequest("GET", `/api/courses/shared/${token}`);
    if (!response.ok) {
      throw new Error("Course not found or no longer shared");
    }
    return await response.json();
  };
  
  return {
    courses: coursesQuery.data?.courses || [],
    isLoading: coursesQuery.isLoading,
    isError: coursesQuery.isError,
    refetch: coursesQuery.refetch,
    createCourse: createCourseMutation.mutate,
    updateCourse: updateCourseMutation.mutate,
    shareCourse: shareCourseMutation.mutate,
    deleteCourse: deleteCourseMutation.mutate,
    getCourseByToken,
    isPending: 
      createCourseMutation.isPending || 
      updateCourseMutation.isPending || 
      shareCourseMutation.isPending ||
      deleteCourseMutation.isPending
  };
}