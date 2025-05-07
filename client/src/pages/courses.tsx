import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { CourseList } from "@/components/courses/CourseList";
import { CourseForm } from "@/components/courses/CourseForm";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Courses() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data, isLoading, isError, refetch } = useQuery<{ courses: Course[] }>({
    queryKey: ['/api/courses'],
    refetchOnWindowFocus: false,
  });

  const handleAddClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleCourseChange = () => {
    refetch();
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <Header 
        title="Courses" 
        showAddButton 
        onAddClick={handleAddClick} 
      />
      
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-destructive mb-4">Failed to load courses</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : (
          <CourseList 
            courses={data?.courses || []} 
            onCourseChange={handleCourseChange} 
          />
        )}
      </div>

      <CourseForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCourseChange}
      />
    </div>
  );
}