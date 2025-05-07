import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Link2, Info, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMedia } from "@/hooks/useMedia";
import { Media } from "@shared/schema";
import { format } from 'date-fns';

const MediaUpdateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type MediaUpdateValues = z.infer<typeof MediaUpdateSchema>;

interface MediaLinkDialogProps {
  media: Media;
  courses: { id: number; title: string }[];
  onLinkToCourse: (courseId: number) => void;
}

function MediaLinkDialog({ media, courses, onLinkToCourse }: MediaLinkDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Link2 className="h-4 w-4 mr-2" />
          Link to Course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Media to Course</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <h3 className="text-sm font-medium mb-2">Select a course to link this media:</h3>
          {courses.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{course.title}</span>
                  <Button 
                    size="sm"
                    onClick={() => {
                      onLinkToCourse(course.id);
                    }}
                  >
                    Link
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No courses available.</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaInfoDialog({ media }: { media: Media }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="h-4 w-4 mr-2" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Media Details</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-1">Title</h3>
            <p className="text-sm">{media.title}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Description</h3>
            <p className="text-sm">{media.description || "No description"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">File Name</h3>
            <p className="text-sm">{media.fileName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Type</h3>
            <p className="text-sm">{media.fileType}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Size</h3>
            <p className="text-sm">{(media.fileSize / 1024).toFixed(2)} KB</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Uploaded</h3>
            <p className="text-sm">{format(new Date(media.uploadedAt), 'PPP')}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-1">Path</h3>
            <p className="text-sm break-all">{media.filePath}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaPreviewDialog({ media }: { media: Media }) {
  const getMediaContent = () => {
    const url = `/uploads/${media.filePath.split('/').pop()}`;
    
    if (media.mediaType === 'image') {
      return <img src={url} alt={media.title} className="max-w-full max-h-[500px] object-contain" />;
    } else if (media.mediaType === 'video') {
      return (
        <video controls className="max-w-full max-h-[500px]">
          <source src={url} type={media.fileType} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (media.mediaType === 'audio') {
      return (
        <audio controls className="w-full">
          <source src={url} type={media.fileType} />
          Your browser does not support the audio tag.
        </audio>
      );
    } else {
      // Document or other type
      return (
        <div className="text-center p-4">
          <p className="mb-4">Preview not available for this file type.</p>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-500 hover:underline"
          >
            Open file in new tab
          </a>
        </div>
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Preview: {media.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex justify-center">
          {getMediaContent()}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface MediaCardProps {
  media: Media;
  onDelete: () => void;
  onUpdate: (data: { title: string; description?: string }) => void;
  onLinkToCourse?: (courseId: number) => void;
  courses?: { id: number; title: string }[];
}

export function MediaCard({ media, onDelete, onUpdate, onLinkToCourse, courses = [] }: MediaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const getMediaTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThumbnail = () => {
    const url = `/uploads/${media.filePath.split('/').pop()}`;
    
    if (media.mediaType === 'image') {
      return (
        <div className="w-full h-40 overflow-hidden bg-gray-100 rounded-t-md">
          <img 
            src={url} 
            alt={media.title} 
            className="w-full h-full object-cover"
          />
        </div>
      );
    } else {
      // For non-image files, display an icon or placeholder
      const iconMap = {
        'video': '🎥',
        'document': '📄',
        'audio': '🎵',
      };
      
      return (
        <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-t-md">
          <span className="text-4xl">
            {iconMap[media.mediaType as 'video' | 'document' | 'audio'] || '📁'}
          </span>
        </div>
      );
    }
  };
  
  const form = useForm<MediaUpdateValues>({
    resolver: zodResolver(MediaUpdateSchema),
    defaultValues: {
      title: media.title,
      description: media.description || "",
    },
  });

  const handleSubmit = (data: MediaUpdateValues) => {
    try {
      onUpdate(data);
      setIsEditing(false);
      toast({
        title: "Media updated",
        description: "Media information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating media",
        description: "There was an error updating the media. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      {getThumbnail()}
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-1">{media.title}</CardTitle>
          <Badge variant="outline" className={getMediaTypeColor(media.mediaType)}>
            {media.mediaType}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
          {media.description || "No description"}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
        <MediaPreviewDialog media={media} />
        <MediaInfoDialog media={media} />
        
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Media Information</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 hover:bg-red-50"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        
        {onLinkToCourse && (
          <MediaLinkDialog 
            media={media} 
            courses={courses} 
            onLinkToCourse={onLinkToCourse} 
          />
        )}
      </CardFooter>
    </Card>
  );
}