import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParticipants } from "@/hooks/useParticipants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventParticipantFormSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

type FormValues = z.infer<typeof eventParticipantFormSchema>;

interface ParticipantRegistrationFormProps {
  eventId: number;
  eventTitle: string;
  onSuccessfulRegistration?: () => void;
}

export default function ParticipantRegistrationForm({ 
  eventId, 
  eventTitle,
  onSuccessfulRegistration 
}: ParticipantRegistrationFormProps) {
  const [success, setSuccess] = useState(false);
  const { registerParticipant, isRegistering } = useParticipants();

  const form = useForm<FormValues>({
    resolver: zodResolver(eventParticipantFormSchema),
    defaultValues: {
      email: "",
      name: "",
      eventId: eventId,
    },
  });

  function onSubmit(data: FormValues) {
    registerParticipant(data, {
      onSuccess: () => {
        setSuccess(true);
        form.reset();
        
        // If parent component provided a success callback, call it
        if (onSuccessfulRegistration) {
          onSuccessfulRegistration();
        }
      }
    });
  }

  if (success) {
    return (
      <div className="w-full py-4">
        <div className="text-center">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
          <p className="text-gray-600 mb-2">
            Thank you for registering for <span className="font-semibold">{eventTitle}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            An email with the event details has been sent to your inbox.
          </p>
          
          <Button 
            variant="outline" 
            onClick={() => setSuccess(false)}
            className="w-full h-11 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            Register another participant
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your.email@example.com" 
                      {...field} 
                      className="h-11 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Full Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your name" 
                      {...field}
                      className="h-11 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : "Complete Registration"}
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-500 pt-2">
            By registering, you'll receive event updates and information via email
          </p>
        </form>
      </Form>
    </div>
  );
}