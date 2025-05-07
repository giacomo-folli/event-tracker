import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { MediaCard } from "@/components/media/MediaCard";
import { MediaUploadForm } from "@/components/media/MediaUploadForm";
import { useMedia } from "@/hooks/useMedia";
import { useCourses } from "@/hooks/useCourses";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Media() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteMediaId, setDeleteMediaId] = useState<number | null>(null);
  const { mediaQuery, deleteMedia, linkMediaToCourse } = useMedia();
  const { coursesQuery } = useCourses();
  const { toast } = useToast();

  const handleLinkToCourse = (mediaId: number, courseId: number) => {
    linkMediaToCourse({ mediaId, courseId });
    toast({
      title: "Media linked to course",
      description: "Media has been linked to the course successfully."
    });
  };

  const handleDeleteMedia = (id: number) => {
    setDeleteMediaId(id);
  };

  const confirmDelete = () => {
    if (deleteMediaId) {
      deleteMedia(deleteMediaId);
      toast({
        title: "Media deleted",
        description: "Media has been deleted successfully."
      });
      setDeleteMediaId(null);
    }
  };

  // Group media by type
  const groupedMedia = {
    image: mediaQuery.data?.media.filter(m => m.mediaType === 'image') || [],
    video: mediaQuery.data?.media.filter(m => m.mediaType === 'video') || [],
    document: mediaQuery.data?.media.filter(m => m.mediaType === 'document') || [],
    audio: mediaQuery.data?.media.filter(m => m.mediaType === 'audio') || []
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Header 
        title="Media Library" 
        showAddButton={true}
        onAddClick={() => setIsUploadDialogOpen(true)}
      />
      
      {mediaQuery.isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-center">
            <div className="h-6 bg-gray-200 rounded-md w-48 mb-4 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded-md w-full max-w-lg mx-auto"></div>
          </div>
        </div>
      ) : mediaQuery.data?.media && mediaQuery.data.media.length > 0 ? (
        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mediaQuery.data.media.map(media => (
                <MediaCard 
                  key={media.id} 
                  media={media}
                  onDelete={() => handleDeleteMedia(media.id)}
                  onUpdate={(data) => {}}
                  onLinkToCourse={(courseId) => handleLinkToCourse(media.id, courseId)}
                  courses={coursesQuery.data?.courses || []}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="images">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedMedia.image.map(media => (
                <MediaCard 
                  key={media.id} 
                  media={media}
                  onDelete={() => handleDeleteMedia(media.id)}
                  onUpdate={(data) => {}}
                  onLinkToCourse={(courseId) => handleLinkToCourse(media.id, courseId)}
                  courses={coursesQuery.data?.courses || []}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="videos">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedMedia.video.map(media => (
                <MediaCard 
                  key={media.id} 
                  media={media}
                  onDelete={() => handleDeleteMedia(media.id)}
                  onUpdate={(data) => {}}
                  onLinkToCourse={(courseId) => handleLinkToCourse(media.id, courseId)}
                  courses={coursesQuery.data?.courses || []}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedMedia.document.map(media => (
                <MediaCard 
                  key={media.id} 
                  media={media}
                  onDelete={() => handleDeleteMedia(media.id)}
                  onUpdate={(data) => {}}
                  onLinkToCourse={(courseId) => handleLinkToCourse(media.id, courseId)}
                  courses={coursesQuery.data?.courses || []}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="audio">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {groupedMedia.audio.map(media => (
                <MediaCard 
                  key={media.id} 
                  media={media}
                  onDelete={() => handleDeleteMedia(media.id)}
                  onUpdate={(data) => {}}
                  onLinkToCourse={(courseId) => handleLinkToCourse(media.id, courseId)}
                  courses={coursesQuery.data?.courses || []}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No media found</h3>
          <p className="text-muted-foreground mb-6">
            Upload some media files to start building your library.
          </p>
          <button 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Upload Media
          </button>
        </div>
      )}
      
      <MediaUploadForm 
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onSuccess={() => setIsUploadDialogOpen(false)}
      />
      
      <AlertDialog open={deleteMediaId !== null} onOpenChange={(open) => !open && setDeleteMediaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the media from the server and remove all references from courses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}