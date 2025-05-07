import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type SelectUser = User;

type SafeUser = Omit<SelectUser, "password">;

type AuthContextType = {
  user: SafeUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ user: SafeUser }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ user: SafeUser }, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data,
    error,
    isLoading,
  } = useQuery<{ user: SafeUser }>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const user = data?.user || null;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Logging in with credentials:", credentials);
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        console.log("Login response status:", res.status);
        const result = await res.json();
        console.log("Login response data:", result);
        return result;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Login success, updating user data:", data);
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
      
      // Redirect to main page after successful login
      window.location.href = "/";
    },
    onError: (error: Error) => {
      console.error("Login mutation error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", userData);
      const result = await res.json();
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.firstName}!`,
      });
      
      // Redirect to main page after successful registration
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Logging out...");
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Redirect to auth page after successful logout
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    ...context,
    // Add these properties for backward compatibility with existing components
    logout: context.logoutMutation.mutate,
    isLoggingOut: context.logoutMutation.isPending
  };
}