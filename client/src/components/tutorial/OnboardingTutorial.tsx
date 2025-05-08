import React, { useEffect } from 'react';
import { TutorialProvider } from '@/hooks/useTutorial';
import TutorialButton from './TutorialButton';

interface OnboardingTutorialProps {
  children: React.ReactNode;
  autoStart?: boolean;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ 
  children, 
  autoStart = false 
}) => {
  return (
    <TutorialProvider>
      {children}
      <TutorialButton position="bottom-right" showText={true} />
    </TutorialProvider>
  );
};

export default OnboardingTutorial;