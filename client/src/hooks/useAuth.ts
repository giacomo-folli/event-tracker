import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", "POST"),
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully"
      });
      // Redirect to home page after logout
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return {
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
}