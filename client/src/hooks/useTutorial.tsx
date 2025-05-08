import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for tutorial steps
export type TutorialStep = {
  id: string;
  title: string;
  description: string;
  targetElement: string; // CSS selector for the element to highlight
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  order: number;
  route?: string; // Optional route to navigate to for this step
};

// Define the available tutorial flows
export type TutorialFlow = 'main' | 'events' | 'courses' | 'media' | 'calendar' | 'settings';

type TutorialContextType = {
  isActive: boolean;
  startTutorial: (flow?: TutorialFlow) => void;
  endTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  currentStep: TutorialStep | null;
  progress: number;
  isPaused: boolean;
  hasTutorialBeenSeen: (flow: TutorialFlow) => boolean;
  markTutorialAsSeen: (flow: TutorialFlow) => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Define tutorial steps for different flows
const tutorialSteps: Record<TutorialFlow, TutorialStep[]> = {
  main: [
    {
      id: 'welcome',
      title: 'Welcome to Event Manager!',
      description: 'This quick tutorial will show you how to use the main features of the application.',
      targetElement: 'body',
      position: 'center',
      order: 0,
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'This is your dashboard where you can see a summary of all your events and activities.',
      targetElement: '.dashboard-overview',
      position: 'bottom',
      order: 1,
    },
    {
      id: 'sidebar',
      title: 'Navigation',
      description: 'Use the sidebar to navigate between different sections of the application.',
      targetElement: '.sidebar',
      position: 'right',
      order: 2,
    },
    {
      id: 'create-event',
      title: 'Create Events',
      description: 'Click here to create a new event. You can set dates, add details, and more.',
      targetElement: '.create-event-button',
      position: 'bottom',
      order: 3,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Access your account settings to manage notifications, API keys, and more.',
      targetElement: '.sidebar-settings',
      position: 'right',
      order: 4,
      route: '/settings',
    },
  ],
  events: [
    {
      id: 'events-intro',
      title: 'Events Management',
      description: 'Here you can view and manage all your events.',
      targetElement: '.events-header',
      position: 'bottom',
      order: 0,
    },
    {
      id: 'event-details',
      title: 'Event Details',
      description: 'Click on any event to view its details and manage participants.',
      targetElement: '.event-card',
      position: 'bottom',
      order: 1,
    },
    {
      id: 'share-event',
      title: 'Share Events',
      description: 'You can share events with others using a secure link.',
      targetElement: '.share-button',
      position: 'left',
      order: 2,
    },
  ],
  courses: [
    {
      id: 'courses-intro',
      title: 'Courses Management',
      description: 'Here you can view and manage your training courses.',
      targetElement: '.courses-header',
      position: 'bottom',
      order: 0,
    },
    {
      id: 'course-details',
      title: 'Course Details',
      description: 'Click on any course to view its details and manage participants.',
      targetElement: '.course-card',
      position: 'bottom',
      order: 1,
    },
    {
      id: 'add-media',
      title: 'Add Media',
      description: 'You can add images, videos, and documents to your courses.',
      targetElement: '.add-media-button',
      position: 'bottom',
      order: 2,
    },
  ],
  media: [
    {
      id: 'media-intro',
      title: 'Media Library',
      description: 'This is your media library where you can upload and manage files.',
      targetElement: '.media-header',
      position: 'bottom',
      order: 0,
    },
    {
      id: 'upload-media',
      title: 'Upload Media',
      description: 'Click here to upload new images, videos, or documents.',
      targetElement: '.upload-button',
      position: 'left',
      order: 1,
    },
  ],
  calendar: [
    {
      id: 'calendar-intro',
      title: 'Training Calendar',
      description: 'View and manage your training sessions on this calendar.',
      targetElement: '.calendar-container',
      position: 'top',
      order: 0,
    },
    {
      id: 'add-session',
      title: 'Add Training Session',
      description: 'Click on a day to add a new training session.',
      targetElement: '.calendar-day',
      position: 'right',
      order: 1,
    },
  ],
  settings: [
    {
      id: 'settings-intro',
      title: 'Account Settings',
      description: 'Here you can configure your account settings.',
      targetElement: '.settings-header',
      position: 'bottom',
      order: 0,
    },
    {
      id: 'notification-settings',
      title: 'Notification Settings',
      description: 'Configure how you want to be notified about events and changes.',
      targetElement: '.notification-settings',
      position: 'right',
      order: 1,
    },
    {
      id: 'api-keys',
      title: 'API Keys',
      description: 'Generate and manage API keys for integrating with other applications.',
      targetElement: '.api-keys-section',
      position: 'bottom',
      order: 2,
    },
  ],
};

// Local storage key for tutorial completion status
const TUTORIAL_SEEN_KEY = 'eventManager_tutorialSeen';

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<TutorialFlow>('main');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [seenTutorials, setSeenTutorials] = useState<Record<TutorialFlow, boolean>>(() => {
    const storedData = localStorage.getItem(TUTORIAL_SEEN_KEY);
    return storedData
      ? JSON.parse(storedData)
      : {
          main: false,
          events: false,
          courses: false,
          media: false,
          calendar: false,
          settings: false,
        };
  });

  // Save seen tutorials to local storage
  useEffect(() => {
    localStorage.setItem(TUTORIAL_SEEN_KEY, JSON.stringify(seenTutorials));
  }, [seenTutorials]);

  const currentStep = isActive && tutorialSteps[currentFlow].length > currentStepIndex
    ? tutorialSteps[currentFlow][currentStepIndex]
    : null;

  // Calculate progress (0-100%)
  const progress = isActive && tutorialSteps[currentFlow].length > 0
    ? ((currentStepIndex + 1) / tutorialSteps[currentFlow].length) * 100
    : 0;

  const startTutorial = (flow: TutorialFlow = 'main') => {
    setCurrentFlow(flow);
    setCurrentStepIndex(0);
    setIsActive(true);
    setIsPaused(false);
  };

  const endTutorial = () => {
    setIsActive(false);
    markTutorialAsSeen(currentFlow);
  };

  const pauseTutorial = () => {
    setIsPaused(true);
  };

  const resumeTutorial = () => {
    setIsPaused(false);
  };

  const nextStep = () => {
    if (currentStepIndex < tutorialSteps[currentFlow].length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      endTutorial();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const hasTutorialBeenSeen = (flow: TutorialFlow): boolean => {
    return seenTutorials[flow];
  };

  const markTutorialAsSeen = (flow: TutorialFlow) => {
    setSeenTutorials(prev => ({
      ...prev,
      [flow]: true
    }));
  };

  const value = {
    isActive,
    startTutorial,
    endTutorial,
    pauseTutorial,
    resumeTutorial,
    nextStep,
    prevStep,
    currentStep,
    progress,
    isPaused,
    hasTutorialBeenSeen,
    markTutorialAsSeen
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};