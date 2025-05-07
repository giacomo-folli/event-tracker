import { useMutation, useQuery } from "@tanstack/react-query";
import { Course, UpdateCourse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useCourses() {
  // Query to fetch all courses
  const coursesQuery = useQuery({
    queryKey: ['/api/courses'],
    refetchOnWindowFocus: false,
  });

  // Query to fetch a specific course
  const getCourse = (id: number) => {
    return useQuery({
      queryKey: ['/api/courses', id],
      enabled: !!id,
      refetchOnWindowFocus: false,
    });
  };

  // Mutation to create a new course
  const createCourseMutation = useMutation({
    mutationFn: (course: Omit<Course, "id">) => 
      apiRequest("POST", "/api/courses", course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    }
  });

  // Mutation to update an existing course
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, ...course }: Course) => 
      apiRequest("PUT", `/api/courses/${id}`, course),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', variables.id] });
    }
  });

  // Mutation to delete a course
  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    }
  });

  return {
    coursesQuery,
    getCourse,
    createCourseMutation,
    updateCourseMutation,
    deleteCourseMutation
  };
}