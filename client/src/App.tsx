import { Switch, Route } from "wouter";
import Dashboard from "@/pages/dashboard";
import Settings from "@/pages/settings";
import ApiDocs from "@/pages/api-docs";
import Courses from "@/pages/courses";
import Media from "@/pages/media";
import EventView from "@/pages/event-view";
import NotFound from "@/pages/not-found";
import { Sidebar } from "@/components/layout/Sidebar";
import { useState } from "react";

function App() {
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
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/courses" component={Courses} />
          <Route path="/media" component={Media} />
          <Route path="/settings" component={Settings} />
          <Route path="/api-docs" component={ApiDocs} />
          <Route path="/events/:id" component={EventView} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
