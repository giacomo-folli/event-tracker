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
}

export default function ParticipantRegistrationForm({ eventId, eventTitle }: ParticipantRegistrationFormProps) {
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
      }
    });
  }

  if (success) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Registration Successful!</CardTitle>
          <CardDescription>
            Thank you for registering for <span className="font-semibold">{eventTitle}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            An email with the event details has been sent to your inbox.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => setSuccess(false)}
            className="w-full"
          >
            Register another participant
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Register for this Event</CardTitle>
        <CardDescription>
          Fill out the form below to register for <span className="font-semibold">{eventTitle}</span>
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : "Register Now"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}