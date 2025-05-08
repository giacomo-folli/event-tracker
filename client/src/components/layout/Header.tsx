import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

interface HeaderProps {
  title: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
  backRoute?: string;
}

export function Header({ title, showAddButton = false, onAddClick, backRoute }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {backRoute && (
            <Link href={backRoute}>
              <Button variant="ghost" size="sm" className="mr-2 p-0 h-8 w-8">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
          )}
          <h1 className="text-lg font-medium text-gray-900">{title}</h1>
        </div>
        {showAddButton && (
          <Button 
            onClick={onAddClick}
            className="inline-flex items-center create-event-button"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Event
          </Button>
        )}
      </div>
    </header>
  );
}
