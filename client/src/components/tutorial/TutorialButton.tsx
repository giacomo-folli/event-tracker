import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTutorial, TutorialFlow } from '@/hooks/useTutorial';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type TutorialButtonProps = {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
  flow?: TutorialFlow;
  showDropdown?: boolean;
};

const TutorialButton: React.FC<TutorialButtonProps> = ({
  variant = 'full',
  className = '',
  flow = 'main',
  showDropdown = false
}) => {
  const { startTutorial, hasTutorialBeenSeen } = useTutorial();

  // Check if this tutorial has been seen before
  const isSeen = hasTutorialBeenSeen(flow);
  
  // If it's just an icon button
  if (variant === 'icon') {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={!isSeen ? { 
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0, -5, 0]
        } : {}}
        transition={{ 
          repeat: !isSeen ? Infinity : 0, 
          repeatDelay: 3,
          duration: 1 
        }}
      >
        <Button
          size="sm"
          variant="ghost"
          className={`rounded-full p-2 ${className}`}
          onClick={() => startTutorial(flow)}
          aria-label="Start tutorial"
        >
          <HelpCircle className={`h-5 w-5 ${!isSeen ? 'text-primary' : 'text-muted-foreground'}`} />
        </Button>
      </motion.div>
    );
  }

  // If it's a full button with dropdown
  if (showDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`${className} ${!isSeen ? 'animate-pulse' : ''}`}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Tutorials
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Available Tutorials</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => startTutorial('main')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Main Tutorial</span>
            {!hasTutorialBeenSeen('main') && (
              <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startTutorial('events')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Events Management</span>
            {!hasTutorialBeenSeen('events') && (
              <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startTutorial('courses')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Courses Management</span>
            {!hasTutorialBeenSeen('courses') && (
              <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startTutorial('media')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Media Library</span>
            {!hasTutorialBeenSeen('media') && (
              <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startTutorial('calendar')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Calendar Tutorial</span>
            {!hasTutorialBeenSeen('calendar') && (
              <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => startTutorial('settings')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            <span>Settings Tutorial</span>
            {!hasTutorialBeenSeen('settings') && (
              <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default text button
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={!isSeen ? { 
        scale: [1, 1.03, 1],
      } : {}}
      transition={{ 
        repeat: !isSeen ? Infinity : 0, 
        repeatDelay: 3,
        duration: 1.5 
      }}
    >
      <Button
        variant="outline"
        className={`${className}`}
        onClick={() => startTutorial(flow)}
      >
        <HelpCircle className="mr-2 h-4 w-4" />
        {variant === 'text' ? 'Help' : 'Start Tutorial'}
        {!isSeen && (
          <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">New</span>
        )}
      </Button>
    </motion.div>
  );
};

export default TutorialButton;