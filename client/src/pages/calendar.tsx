import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { TrainingSession, Course, trainingSessionFormSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddSessionDialogOpen, setIsAddSessionDialogOpen] = useState(false);
  
  // Format month and year for display
  const monthYear = format(currentMonth, "MMMM yyyy");
  
  // Get the days of the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Extract year and month for API calls
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1; // 1-12 format
  
  // Fetch training sessions for the current month
  const { 
    data: sessionsData, 
    isLoading: isLoadingSessions, 
    error: sessionsError 
  } = useQuery({
    queryKey: ['/api/training-sessions/month', year, month],
    queryFn: async () => {
      const response = await fetch(`/api/training-sessions/month/${year}/${month}`);
      if (!response.ok) {
        throw new Error('Failed to fetch training sessions');
      }
      return response.json();
    }
  });
  
  // Fetch courses for the dropdown
  const { 
    data: coursesData, 
    isLoading: isLoadingCourses,
    error: coursesError
  } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    }
  });
  
  // Setup form for adding new training sessions
  const form = useForm<z.infer<typeof trainingSessionFormSchema>>({
    resolver: zodResolver(trainingSessionFormSchema),
    defaultValues: {
      courseId: undefined,
      date: selectedDate || new Date(),
      hour: 9, // Default to 9 AM
      minute: 0, // Default to 0 minutes
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceCount: 4
    }
  });
  
  // Update form when selected date changes
  useEffect(() => {
    if (selectedDate) {
      form.setValue('date', selectedDate);
    }
  }, [selectedDate, form]);
  
  // Mutation to create a new training session
  const createSessionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof trainingSessionFormSchema>) => {
      const res = await apiRequest("POST", "/api/training-sessions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-sessions/month'] });
      toast({
        title: "Success",
        description: "Training session created successfully"
      });
      setIsAddSessionDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mutation to delete a training session
  const deleteSessionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/training-sessions/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-sessions/month'] });
      toast({
        title: "Success",
        description: "Training session deleted successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof trainingSessionFormSchema>) => {
    const { isRecurring, recurrenceType, recurrenceCount, ...sessionData } = data;
    
    // If not recurring, just create a single session
    if (!isRecurring) {
      createSessionMutation.mutate({...sessionData, isRecurring: false});
      return;
    }
    
    // For recurring sessions, create multiple sessions
    const sessions = [];
    const baseDate = new Date(sessionData.date);
    
    for (let i = 0; i < (recurrenceCount || 1); i++) {
      const sessionDate = new Date(baseDate);
      
      // Calculate the date based on recurrence type
      if (recurrenceType === 'daily') {
        sessionDate.setDate(baseDate.getDate() + i);
      } else if (recurrenceType === 'weekly') {
        sessionDate.setDate(baseDate.getDate() + (i * 7));
      } else if (recurrenceType === 'monthly') {
        sessionDate.setMonth(baseDate.getMonth() + i);
      }
      
      // Create session with calculated date
      sessions.push({
        ...sessionData,
        date: sessionDate,
        isRecurring: true
      });
    }
    
    // Create all sessions sequentially
    Promise.all(sessions.map(session => 
      apiRequest("POST", "/api/training-sessions", session)
    ))
    .then(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-sessions/month'] });
      toast({
        title: "Success",
        description: `Created ${sessions.length} training sessions successfully`
      });
      setIsAddSessionDialogOpen(false);
      form.reset();
    })
    .catch(error => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    });
  };
  
  // Handle session deletion
  const handleDeleteSession = (id: number) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSessionMutation.mutate(id);
    }
  };
  
  // WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        if (data.type === 'training_session_created' || 
            data.type === 'training_session_deleted' || 
            data.type === 'training_session_updated') {
          // Refresh training sessions data
          queryClient.invalidateQueries({ queryKey: ['/api/training-sessions/month'] });
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    return () => {
      socket.close();
    };
  }, []);
  
  // Prepare the training sessions for display
  const sessions = sessionsData?.sessions || [];
  
  // Get courses for dropdown
  const courses = coursesData?.courses || [];
  
  // Function to get sessions for a specific day
  const getSessionsForDay = (day: Date) => {
    return sessions.filter((session: TrainingSession) => 
      isSameDay(new Date(session.date), day)
    );
  };
  
  // Function to get course name by ID
  const getCourseNameById = (courseId: number) => {
    const course = courses.find((c: Course) => c.id === courseId);
    return course ? course.title : "Unknown Course";
  };
  
  // Navigation functions
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());
  
  if (isLoadingSessions || isLoadingCourses) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (sessionsError || coursesError) {
    return <div className="text-red-500">Error loading data</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="bg-muted">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Training Calendar
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>Previous</Button>
              <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>Next</Button>
            </div>
          </div>
          <div className="text-2xl font-bold text-center pt-2">{monthYear}</div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center font-semibold p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((day, i) => {
              const dayNumber = format(day, "d");
              const daySessionsData = getSessionsForDay(day);
              
              return (
                <div
                  key={i}
                  className={`min-h-[100px] border p-1 ${
                    isSameMonth(day, currentMonth)
                      ? "bg-white"
                      : "bg-gray-100 text-gray-400"
                  } ${
                    isSameDay(day, new Date())
                      ? "border-blue-500 border-2"
                      : "border-gray-200"
                  }`}
                  onClick={() => {
                    setSelectedDate(day);
                    setIsAddSessionDialogOpen(true);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{dayNumber}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDate(day);
                        setIsAddSessionDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Sessions for this day */}
                  <div className="mt-1 space-y-1">
                    {daySessionsData.map((session: TrainingSession) => (
                      <div 
                        key={session.id} 
                        className="flex justify-between items-center text-xs bg-blue-100 p-1 rounded"
                      >
                        <span>{format(new Date(session.date), "HH:mm")} - {getCourseNameById(session.courseId)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog for adding training session */}
      <Dialog open={isAddSessionDialogOpen} onOpenChange={setIsAddSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Training Session</DialogTitle>
            <DialogDescription>
              {selectedDate && `For ${format(selectedDate, "MMMM d, yyyy")}`}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course: Course) => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="hour"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hour (0-23)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          max={23} 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minute"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Minute (0-59)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          max={59} 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Recurring session</FormLabel>
                      <FormDescription>
                        Create multiple sessions at once with a recurring pattern
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              {form.watch("isRecurring") && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/20">
                  <FormField
                    control={form.control}
                    name="recurrenceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recurrence Pattern</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pattern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recurrenceCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Occurrences</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={52} 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {form.watch("recurrenceType") === "daily" && 
                            "Sessions will be created daily starting from the selected date."}
                          {form.watch("recurrenceType") === "weekly" && 
                            "Sessions will be created weekly on the same day of week."}
                          {form.watch("recurrenceType") === "monthly" && 
                            "Sessions will be created monthly on the same day of month."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddSessionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? "Adding..." : form.watch("isRecurring") 
                    ? `Add ${form.watch("recurrenceCount") || 1} Sessions` 
                    : "Add Session"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}