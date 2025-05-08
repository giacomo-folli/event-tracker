import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { AccountForm } from "@/components/settings/AccountForm";
import { NotificationForm } from "@/components/settings/NotificationForm";
import { ApiKeysForm } from "@/components/settings/ApiKeysForm";
import { useSettings } from "@/hooks/useSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { user, isLoading, refetch } = useSettings();
  const [activeTab, setActiveTab] = useState("profile");

  if (isLoading || !user) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="User Settings" />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="User Settings" />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        <div className="bg-white shadow-sm rounded-lg p-6 settings-header">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications" className="notification-settings">Notifications</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="py-6">
                <ProfileForm user={user} onSuccess={refetch} />
              </div>
            </TabsContent>
            
            <TabsContent value="account">
              <div className="py-6">
                <AccountForm />
              </div>
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="py-6">
                <NotificationForm user={user} onSuccess={refetch} />
              </div>
            </TabsContent>
            
            <TabsContent value="api-keys">
              <div className="py-6 api-keys-section">
                <ApiKeysForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
