import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { EventList } from "@/components/events/EventList";
import { EventForm } from "@/components/events/EventForm";
import { useEvents } from "@/hooks/useEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { events, isLoading, refetch } = useEvents();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddEvent = () => {
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Event Management" />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="space-y-4">
            <div className="hidden md:block overflow-hidden shadow-sm rounded-lg">
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header 
        title="Event Management" 
        showAddButton 
        onAddClick={handleAddEvent} 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        <div className="space-y-4 dashboard-overview">
          <EventList events={events} onEventChange={refetch} />
        </div>
      </main>
      
      {/* Event form modal */}
      {isFormOpen && (
        <EventForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
}
