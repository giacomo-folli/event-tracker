import React, { useEffect } from 'react';
import { TutorialProvider, useTutorial, TutorialFlow } from '@/hooks/useTutorial';
import TutorialPopover from './TutorialPopover';
import TutorialButton from './TutorialButton';
import { useLocation } from 'wouter';

// This component handles automatic tutorial launching
// based on the current route
const TutorialController: React.FC = () => {
  const { isActive, startTutorial, hasTutorialBeenSeen } = useTutorial();
  const [location] = useLocation();

  // Determine which tutorial flow to use based on the current route
  const getCurrentFlow = (): TutorialFlow | null => {
    if (location === '/') return 'main';
    if (location.startsWith('/events')) return 'events';
    if (location.startsWith('/courses')) return 'courses';
    if (location.startsWith('/media')) return 'media';
    if (location.startsWith('/calendar')) return 'calendar';
    if (location.startsWith('/settings')) return 'settings';
    return null;
  };

  // Check if we should auto-start the tutorial
  useEffect(() => {
    const currentFlow = getCurrentFlow();
    
    // If user is on a main page and hasn't seen the tutorial yet,
    // and no tutorial is currently active, show the tutorial
    if (
      currentFlow && 
      !hasTutorialBeenSeen(currentFlow) && 
      !isActive && 
      // Only auto-start the main tutorial
      currentFlow === 'main'
    ) {
      // Small delay to make sure the page is fully loaded
      const timer = setTimeout(() => {
        startTutorial(currentFlow);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [location, isActive, hasTutorialBeenSeen, startTutorial]);

  return <TutorialPopover />;
};

// Floating action button that shows on all pages
export const TutorialFAB: React.FC = () => {
  const [location] = useLocation();

  // Determine which tutorial flow to use based on the current route
  const getCurrentFlow = (): TutorialFlow => {
    if (location.startsWith('/events')) return 'events';
    if (location.startsWith('/courses')) return 'courses';
    if (location.startsWith('/media')) return 'media';
    if (location.startsWith('/calendar')) return 'calendar';
    if (location.startsWith('/settings')) return 'settings';
    return 'main';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TutorialButton 
        variant="icon" 
        flow={getCurrentFlow()}
        className="shadow-lg hover:shadow-xl transition-shadow"
      />
    </div>
  );
};

// The main onboarding provider component
const OnboardingTutorial: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TutorialProvider>
      <TutorialController />
      <TutorialFAB />
      {children}
    </TutorialProvider>
  );
};

export default OnboardingTutorial;