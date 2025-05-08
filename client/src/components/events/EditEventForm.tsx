import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format, parse } from "date-fns";
import { z } from "zod";
import { Event } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Schema for the form
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

// Define an interface that includes the expected types for the API
interface EventApiUpdate {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string; // ISO string format for the API
  endDate: string; // ISO string format for the API
  creatorId: number | null;
  isShared: boolean;
  shareToken: string | null;
  shareUrl: string | null;
}

interface EditEventFormProps {
  event: Event;
  onSave: (updatedEvent: EventApiUpdate) => void;
}

export function EditEventForm({ event, onSave }: EditEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default values for the form
  const defaultValues: FormValues = {
    title: event.title,
    location: event.location || "",
    description: event.description || "",
    startDate: format(new Date(event.startDate), "yyyy-MM-dd"),
    startTime: format(new Date(event.startDate), "HH:mm"),
    endDate: format(new Date(event.endDate), "yyyy-MM-dd"),
    endTime: format(new Date(event.endDate), "HH:mm"),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Parse the dates
      const startDateTime = parse(
        `${values.startDate} ${values.startTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      
      const endDateTime = parse(
        `${values.endDate} ${values.endTime}`,
        "yyyy-MM-dd HH:mm",
        new Date()
      );
      
      // Create the updated event object
      const updatedEvent = {
        ...event,
        title: values.title,
        location: values.location,
        description: values.description || null,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      };
      
      // Call the onSave callback with the updated event
      onSave(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
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
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}