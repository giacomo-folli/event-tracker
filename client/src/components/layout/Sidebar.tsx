import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Calendar, Settings, Code, LogOut } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  // Close sidebar on navigation on mobile
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <div 
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-10 w-64 bg-white shadow-lg lg:shadow-none transition-transform duration-300 lg:translate-x-0 lg:block",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="h-screen flex flex-col overflow-y-auto">
        {/* Logo */}
        <div className="px-6 pt-6 pb-4 flex items-center border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-semibold text-gray-900">Event Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          <Link href="/">
            <a 
              onClick={handleNavClick}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === "/" 
                  ? "bg-primary-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Calendar className="mr-3 h-5 w-5" />
              Event Management
            </a>
          </Link>

          <Link href="/settings">
            <a 
              onClick={handleNavClick}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === "/settings" 
                  ? "bg-primary-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Settings className="mr-3 h-5 w-5" />
              User Settings
            </a>
          </Link>

          <Link href="/api-docs">
            <a 
              onClick={handleNavClick}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                location === "/api-docs" 
                  ? "bg-primary-50 text-primary"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Code className="mr-3 h-5 w-5" />
              API Documentation
            </a>
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <a 
              href="#" 
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
