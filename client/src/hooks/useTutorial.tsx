import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import TutorialPopover from '@/components/tutorial/TutorialPopover';

export type TutorialStep = {
  id: string;
  order: number;
  title: string;
  description: string;
  targetElement: string; // CSS selector for the element to highlight
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  route?: string; // Optional route to navigate to for this step
};

interface TutorialContextType {
  isActive: boolean;
  currentStep: TutorialStep | null;
  progress: number;
  isPaused: boolean;
  hasCompletedTutorial: boolean;
  startTutorial: () => void;
  endTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  goToStep: (stepId: string) => void;
}

// Tutorial steps data - defines the complete tutorial flow
const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    order: 0,
    title: 'Welcome to Event Admin!',
    description: 'This quick tutorial will guide you through the main features of our platform. Let\'s get started!',
    targetElement: '.sidebar',
    position: 'right',
    route: '/'
  },
  {
    id: 'event-management',
    order: 1,
    title: 'Event Management',
    description: 'This is your main dashboard where you can view, create, and manage all your events.',
    targetElement: '.dashboard-overview',
    position: 'bottom',
    route: '/'
  },
  {
    id: 'create-event',
    order: 2,
    title: 'Create New Events',
    description: 'Click this button to create a new event with details like title, dates, location, and description.',
    targetElement: '.create-event-button',
    position: 'left',
    route: '/'
  },
  {
    id: 'event-list',
    order: 3,
    title: 'Your Events',
    description: 'All your events will appear in this list. Click on any event to view and edit its details.',
    targetElement: '.events-header',
    position: 'bottom',
    route: '/'
  },
  {
    id: 'settings-navigation',
    order: 4,
    title: 'User Settings',
    description: 'Navigate to your settings page to customize your profile and application preferences.',
    targetElement: '.settings-nav-item',
    position: 'right',
    route: '/'
  },
  {
    id: 'notification-settings',
    order: 5,
    title: 'Notification Settings',
    description: 'Configure how you receive notifications about events, attendees, and system updates.',
    targetElement: '.notification-settings',
    position: 'bottom',
    route: '/settings'
  },
  {
    id: 'api-keys',
    order: 6,
    title: 'API Keys',
    description: 'Generate and manage API keys to integrate our system with your other tools and applications.',
    targetElement: '.api-keys-section',
    position: 'top',
    route: '/settings'
  },
  {
    id: 'completion',
    order: 7,
    title: 'You\'re All Set!',
    description: 'You\'ve completed the tutorial and are ready to use Event Admin. Explore the platform and let us know if you have any questions!',
    targetElement: '.page-header',
    position: 'bottom',
    route: '/'
  }
];

// Default context value
const defaultContext: TutorialContextType = {
  isActive: false,
  currentStep: null,
  progress: 0,
  isPaused: false,
  hasCompletedTutorial: false,
  startTutorial: () => {},
  endTutorial: () => {},
  nextStep: () => {},
  prevStep: () => {},
  pauseTutorial: () => {},
  resumeTutorial: () => {},
  goToStep: () => {}
};

const TutorialContext = createContext<TutorialContextType>(defaultContext);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(() => {
    // Check localStorage to see if tutorial has been completed
    return localStorage.getItem('tutorialCompleted') === 'true';
  });
  
  // Calculate progress percentage
  const progress = Math.min(
    ((currentStepIndex + 1) / tutorialSteps.length) * 100,
    100
  );
  
  const currentStep = isActive ? tutorialSteps[currentStepIndex] || null : null;

  // Store tutorial state in local storage
  useEffect(() => {
    // Only store if the tutorial is active
    if (isActive) {
      localStorage.setItem('tutorialState', JSON.stringify({
        isActive,
        currentStepIndex,
        isPaused,
      }));
    } else {
      // Clear when tutorial ends
      localStorage.removeItem('tutorialState');
    }
  }, [isActive, currentStepIndex, isPaused]);
  
  // Restore tutorial state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem('tutorialState');
    if (savedState) {
      try {
        const { isActive, currentStepIndex, isPaused } = JSON.parse(savedState);
        setIsActive(isActive);
        setCurrentStepIndex(currentStepIndex);
        setIsPaused(isPaused);
      } catch (error) {
        console.error('Error parsing tutorial state:', error);
        localStorage.removeItem('tutorialState');
      }
    }
  }, []);

  const startTutorial = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setIsPaused(false);
  }, []);

  const endTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setIsPaused(false);
    setHasCompletedTutorial(true);
    localStorage.removeItem('tutorialState');
    localStorage.setItem('tutorialCompleted', 'true');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // End the tutorial if we're at the last step
      endTutorial();
    }
  }, [currentStepIndex, endTutorial]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const pauseTutorial = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resumeTutorial = useCallback(() => {
    setIsPaused(false);
  }, []);

  const goToStep = useCallback((stepId: string) => {
    const stepIndex = tutorialSteps.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
    }
  }, []);

  const value = {
    isActive,
    currentStep,
    progress,
    isPaused,
    hasCompletedTutorial,
    startTutorial,
    endTutorial,
    nextStep,
    prevStep,
    pauseTutorial,
    resumeTutorial,
    goToStep
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      <TutorialPopover 
        isActive={isActive}
        currentStep={currentStep}
        progress={progress}
        isPaused={isPaused}
        nextStep={nextStep}
        prevStep={prevStep}
        pauseTutorial={pauseTutorial}
        resumeTutorial={resumeTutorial}
        endTutorial={endTutorial}
      />
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => useContext(TutorialContext);