import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Media } from "@shared/schema";

export function useMedia() {
  const queryClient = useQueryClient();

  // Get all media
  const mediaQuery = useQuery<{ media: Media[] }>({
    queryKey: ['/api/media'],
    staleTime: 1000 * 60, // 1 minute
  });

  // Get media for a specific course
  const getCourseMedia = (courseId: number) => 
    useQuery<{ media: (Media & { order: number })[] }>({
      queryKey: ['/api/courses', courseId, 'media'],
      queryFn: () => apiRequest(`/api/courses/${courseId}/media`),
      staleTime: 1000 * 60, // 1 minute
    });

  // Upload new media
  const uploadMediaMutation = useMutation({
    mutationFn: (formData: FormData) => 
      apiRequest('/api/media', 'POST', formData, { headers: {} }), // Let browser set content-type with boundary
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    }
  });

  // Delete media
  const deleteMediaMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/media/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    }
  });

  // Update media
  const updateMediaMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number, title: string, description?: string }) => 
      apiRequest(`/api/media/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media'] });
    }
  });

  // Link media to course
  const linkMediaToCourse = useMutation({
    mutationFn: ({ courseId, mediaId, order }: { courseId: number, mediaId: number, order?: number }) => 
      apiRequest(`/api/courses/${courseId}/media/${mediaId}`, 'POST', { order }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses', variables.courseId, 'media'] });
    }
  });

  // Unlink media from course
  const unlinkMediaFromCourse = useMutation({
    mutationFn: ({ courseId, mediaId }: { courseId: number, mediaId: number }) => 
      apiRequest(`/api/courses/${courseId}/media/${mediaId}`, 'DELETE'),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses', variables.courseId, 'media'] });
    }
  });

  // Update media order within course
  const updateMediaOrder = useMutation({
    mutationFn: ({ courseId, mediaId, order }: { courseId: number, mediaId: number, order: number }) => 
      apiRequest(`/api/courses/${courseId}/media/${mediaId}/order`, 'PUT', { order }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/courses', variables.courseId, 'media'] });
    }
  });

  return {
    mediaQuery,
    getCourseMedia,
    uploadMedia: uploadMediaMutation.mutate,
    uploadMediaAsync: uploadMediaMutation.mutateAsync,
    isUploading: uploadMediaMutation.isPending,
    deleteMedia: deleteMediaMutation.mutate,
    deleteMediaAsync: deleteMediaMutation.mutateAsync,
    isDeleting: deleteMediaMutation.isPending,
    updateMedia: updateMediaMutation.mutate,
    updateMediaAsync: updateMediaMutation.mutateAsync,
    isUpdating: updateMediaMutation.isPending,
    linkMediaToCourse: linkMediaToCourse.mutate,
    linkMediaToCourseAsync: linkMediaToCourse.mutateAsync,
    isLinking: linkMediaToCourse.isPending,
    unlinkMediaFromCourse: unlinkMediaFromCourse.mutate,
    unlinkMediaFromCourseAsync: unlinkMediaFromCourse.mutateAsync,
    isUnlinking: unlinkMediaFromCourse.isPending,
    updateMediaOrder: updateMediaOrder.mutate,
    updateMediaOrderAsync: updateMediaOrder.mutateAsync,
    isUpdatingOrder: updateMediaOrder.isPending,
  };
}