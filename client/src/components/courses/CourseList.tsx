import { useState } from "react";
import { format } from "date-fns";
import { Course } from "@shared/schema";
import { CourseForm } from "./CourseForm";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/hooks/use-toast";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  GraduationCap, 
  Calendar, 
  User 
} from "lucide-react";

interface CourseListProps {
  courses: Course[];
  onCourseChange: () => void;
}

export function CourseList({ courses, onCourseChange }: CourseListProps) {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleEditClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCourse) return;

    try {
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
      });

      onCourseChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "default";
      case "intermediate":
        return "secondary";
      case "advanced":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <>
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center rounded-lg border border-dashed">
          <GraduationCap className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold text-lg">No courses yet</h3>
          <p className="text-muted-foreground">
            There are no courses to display. Click the "Add Course" button to create one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    {course.level && (
                      <Badge 
                        variant={getLevelBadgeVariant(course.level) as any} 
                        className="mb-2"
                      >
                        {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                      </Badge>
                    )}
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(course)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClick(course)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {course.duration && (
                  <CardDescription>Duration: {course.duration}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                {course.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                    {course.description}
                  </p>
                )}
                <div className="grid gap-1 text-sm">
                  {course.instructor && (
                    <div className="flex items-center text-muted-foreground">
                      <User className="mr-1 h-4 w-4" />
                      <span>{course.instructor}</span>
                    </div>
                  )}
                  {course.startDate && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-1 h-4 w-4" />
                      <span>Starts {format(new Date(course.startDate), "PPP")}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => handleEditClick(course)}
                >
                  Manage Course
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {isEditModalOpen && selectedCourse && (
        <CourseForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          course={selectedCourse}
          onSuccess={onCourseChange}
        />
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course &quot;{selectedCourse?.title}&quot;.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}