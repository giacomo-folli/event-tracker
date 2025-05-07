import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteProps } from "wouter";

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

// Temporary mock auth for protected routes
const mockProtectedAuth = {
  user: { id: 1, username: "admin" }, // Simulating a logged-in user
  isLoading: false
};

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = mockProtectedAuth;

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}