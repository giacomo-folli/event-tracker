import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface HeaderProps {
  title: string;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function Header({ title, showAddButton = false, onAddClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-medium text-gray-900">{title}</h1>
        {showAddButton && (
          <Button 
            onClick={onAddClick}
            className="inline-flex items-center"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Event
          </Button>
        )}
      </div>
    </header>
  );
}
