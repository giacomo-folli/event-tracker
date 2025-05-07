import { Switch, Route, Redirect } from "wouter";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import ApiDocs from "@/pages/api-docs";
import Courses from "@/pages/courses";
import Media from "@/pages/media";
import EventView from "@/pages/event-view";
import EventDetailsPage from "@/pages/event-details";
import SharedEventPage from "@/pages/shared-event";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";
import { ProtectedRoute } from "@/lib/ProtectedRoute";
import { AuthProvider, useAuth } from "./hooks/AuthProvider";

function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-20 p-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function UnauthenticatedApp() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
            <p className="mb-4">You need to log in to access this application.</p>
            <a href="/auth" className="text-primary hover:underline">
              Go to Login Page
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function AuthenticatedApp() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={Dashboard} />
        <Route path="/courses" component={Courses} />
        <Route path="/media" component={Media} />
        <Route path="/settings" component={Settings} />
        <Route path="/api-docs" component={ApiDocs} />
        <Route path="/events/:id" component={EventView} />
        <Route path="/admin/events/:id" component={EventDetailsPage} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

// This is a wrapper component that uses the auth context
function AppRoutes() {
  const { user, isLoading } = useAuth();
  
  // Show a loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes that don't require authentication */}
      <Route path="/auth">
        {user ? <Redirect to="/" /> : <AuthPage />}
      </Route>
      
      {/* Shared event public route */}
      <Route path="/events/shared/:token" component={SharedEventPage} />
      
      {/* All other routes require authentication */}
      <Route>
        {user ? <AuthenticatedApp /> : <Redirect to="/auth" />}
      </Route>
    </Switch>
  );
}

// Main app component that provides the auth context
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
