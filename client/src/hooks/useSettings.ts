import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, UpdateUserSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Type without password for safety
type SafeUser = Omit<User, "password">;

// Password update schema
const PasswordUpdate = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
});

type PasswordUpdateData = z.infer<typeof PasswordUpdate>;

export function useSettings() {
  const queryClient = useQueryClient();
  
  // Get user settings
  const userQuery = useQuery<{ user: SafeUser }>({
    queryKey: ["/api/user"],
  });
  
  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: UpdateUserSettings) => 
      apiRequest("PUT", "/api/user/settings", settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    }
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: (passwordData: PasswordUpdateData) => 
      apiRequest("PUT", "/api/user/password", passwordData)
  });
  
  return {
    user: userQuery.data?.user,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    refetch: userQuery.refetch,
    updateSettings: updateSettingsMutation.mutateAsync,
    updatePassword: updatePasswordMutation.mutateAsync,
    isPending: updateSettingsMutation.isPending || updatePasswordMutation.isPending
  };
}
