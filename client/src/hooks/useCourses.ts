import { useMutation, useQuery } from "@tanstack/react-query";
import { Course, UpdateCourse } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useCourses() {
  // Query to fetch all courses
  const coursesQuery = useQuery<{ courses: Course[] }>({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await apiRequest('/api/courses');
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  // Query to fetch a specific course
  const getCourse = (id: number) => {
    return useQuery<{ course: Course }>({
      queryKey: ['/api/courses', id],
      queryFn: async () => {
        const response = await apiRequest(`/api/courses/${id}`);
        return response.json();
      },
      enabled: !!id,
      refetchOnWindowFocus: false,
    });
  };

  // Mutation to create a new course
  const createCourseMutation = useMutation({
    mutationFn: (course: Omit<Course, "id">) => 
      apiRequest("/api/courses", "POST", course),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    }
  });

  // Mutation to update an existing course
  const updateCourseMutation = useMutation({
    mutationFn: ({ id, ...course }: Course) => 
      apiRequest(`/api/courses/${id}`, "PUT", course),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', variables.id] });
    }
  });

  // Mutation to delete a course
  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/courses/${id}`, "DELETE"),
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