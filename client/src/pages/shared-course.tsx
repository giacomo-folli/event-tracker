import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Course } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Book, Calendar, GraduationCap, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import CourseParticipantRegistrationForm from "@/components/courses/CourseParticipantRegistrationForm";
import { useCourses } from "@/hooks";

export default function SharedCoursePage() {
  const [, params] = useRoute("/courses/shared/:token");
  const token = params?.token;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { toast } = useToast();
  const { getCourseByToken } = useCourses();

  useEffect(() => {
    if (!token) {
      setError("Invalid share token");
      setLoading(false);
      return;
    }

    async function fetchCourse() {
      try {
        // Type assertion to ensure token is treated as a string
        const tokenString = token as string;
        const data = await getCourseByToken(tokenString);
        setCourse(data.course);
      } catch (err) {
        setError("Failed to load course. It may not exist or is no longer shared.");
        toast({
          title: "Error",
          description: "Could not load course details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [token, toast, getCourseByToken]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <h2 className="text-xl font-medium">Loading course details...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>
              {error || "The course you're looking for doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
            >
              Return to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Date not specified";
    return format(new Date(date), "MMMM d, yyyy");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Course Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl mb-2">
            {course.title}
          </h1>
          <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
            Shared Course
          </Badge>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Course Details - Takes up 3/5 of the space on large screens */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg overflow-hidden border-none">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-6">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">Course Details</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                {course.description && (
                  <div>
                    <h3 className="text-lg font-medium border-b border-gray-200 pb-2 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-5 rounded-lg space-y-5 border border-gray-100">
                  {course.instructor && (
                    <div className="flex items-start">
                      <GraduationCap className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Instructor</h4>
                        <p className="mt-1 font-medium text-gray-900">{course.instructor}</p>
                      </div>
                    </div>
                  )}
                  
                  {course.level && (
                    <div className="flex items-start">
                      <Book className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Level</h4>
                        <p className="mt-1 text-gray-900">{course.level}</p>
                      </div>
                    </div>
                  )}
                  
                  {course.startDate && (
                    <div className="flex items-start">
                      <Calendar className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Start Date</h4>
                        <p className="mt-1 text-gray-900">{formatDate(course.startDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  {course.duration && (
                    <div className="flex items-start">
                      <Book className="h-6 w-6 text-blue-500 mr-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Duration</h4>
                        <p className="mt-1 text-gray-900">{course.duration}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Registration Form - Takes up 2/5 of the space on large screens */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg h-full border-none">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardTitle className="text-xl font-bold">Course Registration</CardTitle>
                <CardDescription className="text-indigo-100 mt-1">
                  Sign up to participate in this course
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {registrationSuccess ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium mb-3">Registration Successful!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for registering for this course. You'll receive updates via email.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => setRegistrationSuccess(false)}
                      className="w-full"
                    >
                      Register another person
                    </Button>
                  </div>
                ) : showRegistrationForm ? (
                  <CourseParticipantRegistrationForm 
                    courseId={course.id}
                    courseTitle={course.title}
                    onSuccessfulRegistration={() => {
                      toast({
                        title: "Success!",
                        description: "You have successfully registered for this course.",
                      });
                      setRegistrationSuccess(true);
                      setShowRegistrationForm(false);
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="h-16 w-16 mx-auto text-indigo-500 mb-4" />
                    <h3 className="text-xl font-medium mb-3">Join this course</h3>
                    <p className="text-gray-600 mb-6">
                      Register now to participate and receive updates about this course.
                    </p>
                    <Button 
                      onClick={() => setShowRegistrationForm(true)}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      Register Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}