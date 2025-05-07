import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks";
import { useToast } from "@/hooks/use-toast";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema with additional validation
const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Use the real auth context
  const auth = useAuth();
  const { user, loginMutation, registerMutation } = auth;

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Handle login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle registration form
  const registerForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Loading states from mutations
  const isLoginLoading = loginMutation.isPending;
  const isRegisterLoading = registerMutation.isPending;

  // Handle login submission
  const handleLogin = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        // Redirect handled by AuthProvider
      },
      onError: (error) => {
        // Display error toast - already handled by AuthProvider
        // Reset the password field to allow user to try again
        loginForm.setValue("password", "");
      }
    });
  };

  // Handle registration submission
  const handleRegister = async (data: RegistrationFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        // Redirect handled by AuthProvider
      },
      onError: (error) => {
        // Error toast already handled by AuthProvider
        // Reset password only, keep other fields for correction
        registerForm.setValue("password", "");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6 items-center mx-auto">
          {/* Hero section */}
          <div className="space-y-6 text-center md:text-left order-2 md:order-1">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Event Management Platform
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Create, manage, and share events with a comprehensive and user-friendly interface.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 text-primary p-1 rounded-full">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-gray-700">Create and manage events</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 text-primary p-1 rounded-full">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-gray-700">Organize and share courses</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-primary/10 text-primary p-1 rounded-full">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-gray-700">Upload and manage media content</p>
              </div>
            </div>
          </div>

          {/* Auth forms */}
          <div className="w-full max-w-md space-y-8 order-1 md:order-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-2xl">Authentication</CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Tab */}
                  <TabsContent value="login">
                    <div className="space-y-4 py-2">
                      <Form {...loginForm}>
                        <form
                          onSubmit={loginForm.handleSubmit(handleLogin)}
                          className="space-y-4"
                        >
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter your username"
                                    {...field}
                                    disabled={isLoginLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    {...field}
                                    disabled={isLoginLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoginLoading}
                          >
                            {isLoginLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Logging in...
                              </>
                            ) : (
                              "Login"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </TabsContent>
                  
                  {/* Register Tab */}
                  <TabsContent value="register">
                    <div className="space-y-4 py-2">
                      <Form {...registerForm}>
                        <form
                          onSubmit={registerForm.handleSubmit(handleRegister)}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="John"
                                      {...field}
                                      disabled={isRegisterLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Doe"
                                      {...field}
                                      disabled={isRegisterLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    {...field}
                                    disabled={isRegisterLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="johndoe"
                                    {...field}
                                    disabled={isRegisterLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    placeholder="Create a password"
                                    {...field}
                                    disabled={isRegisterLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isRegisterLoading}
                          >
                            {isRegisterLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Creating account...
                              </>
                            ) : (
                              "Create Account"
                            )}
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}