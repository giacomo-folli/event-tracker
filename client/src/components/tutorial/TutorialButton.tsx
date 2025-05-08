import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HelpCircle, PlayCircle } from 'lucide-react';
import { useTutorial } from '@/hooks/useTutorial';

type TutorialButtonProps = {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showText?: boolean;
  className?: string;
};

const TutorialButton: React.FC<TutorialButtonProps> = ({
  position = 'bottom-right',
  showText = true,
  className = ''
}) => {
  const { startTutorial, isActive } = useTutorial();
  
  if (isActive) return null; // Don't show button while tutorial is active
  
  // Determine position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };
  
  return (
    <motion.div
      className={`fixed ${getPositionStyles()} z-50 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: 1 // Delay appearance for a better UX
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={startTutorial}
        className="bg-primary text-white hover:bg-primary/90 shadow-lg"
        size="lg"
      >
        {showText ? (
          <>
            <PlayCircle className="mr-2 h-5 w-5" />
            Start Tutorial
          </>
        ) : (
          <HelpCircle className="h-5 w-5" />
        )}
      </Button>
    </motion.div>
  );
};

export default TutorialButton;