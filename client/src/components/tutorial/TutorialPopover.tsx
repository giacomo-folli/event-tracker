import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTutorial, TutorialStep } from '@/hooks/useTutorial';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ArrowRight, ArrowLeft, PauseCircle, PlayCircle } from 'lucide-react';

type PositionStyles = {
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  transform?: string;
};

type Highlight = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius?: number;
};

const TutorialPopover: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    progress, 
    nextStep, 
    prevStep, 
    endTutorial, 
    isPaused, 
    pauseTutorial, 
    resumeTutorial 
  } = useTutorial();
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PositionStyles>({});
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [, navigate] = useLocation();
  
  // Handle navigation if needed for the current step
  useEffect(() => {
    if (currentStep?.route && isActive && !isPaused) {
      navigate(currentStep.route);
    }
  }, [currentStep, isActive, isPaused, navigate]);
  
  // Reposition the popover when the currentStep changes or window resizes
  useEffect(() => {
    const calculatePosition = () => {
      if (!currentStep || !isActive) return;
      
      if (currentStep.position === 'center') {
        setPosition({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        });
        setHighlight(null);
        return;
      }
      
      // Find the target element
      const targetElement = document.querySelector(currentStep.targetElement);
      if (!targetElement) {
        // Default to center if target not found
        setPosition({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        });
        setHighlight(null);
        return;
      }
      
      // Get the bounds of the target element
      const bounds = targetElement.getBoundingClientRect();
      
      // Set highlight
      setHighlight({
        top: bounds.top + window.scrollY,
        left: bounds.left + window.scrollX,
        width: bounds.width,
        height: bounds.height,
        borderRadius: parseInt(window.getComputedStyle(targetElement).borderRadius) || 0
      });
      
      // Calculate popover position based on the target and position preference
      const popoverHeight = popoverRef.current?.clientHeight || 200;
      const popoverWidth = popoverRef.current?.clientWidth || 300;
      const margin = 20; // Space between target and popover
      
      switch (currentStep.position) {
        case 'top':
          setPosition({
            top: bounds.top + window.scrollY - popoverHeight - margin,
            left: bounds.left + window.scrollX + (bounds.width / 2) - (popoverWidth / 2)
          });
          break;
        case 'right':
          setPosition({
            top: bounds.top + window.scrollY + (bounds.height / 2) - (popoverHeight / 2),
            left: bounds.right + window.scrollX + margin
          });
          break;
        case 'bottom':
          setPosition({
            top: bounds.bottom + window.scrollY + margin,
            left: bounds.left + window.scrollX + (bounds.width / 2) - (popoverWidth / 2)
          });
          break;
        case 'left':
          setPosition({
            top: bounds.top + window.scrollY + (bounds.height / 2) - (popoverHeight / 2),
            left: bounds.left + window.scrollX - popoverWidth - margin
          });
          break;
        default:
          // Center as fallback
          setPosition({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          });
      }
    };
    
    calculatePosition();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculatePosition);
    
    return () => {
      window.removeEventListener('resize', calculatePosition);
    };
  }, [currentStep, isActive]);
  
  // If not active, don't render anything
  if (!isActive || !currentStep) return null;
  
  return (
    <>
      {/* Semi-transparent overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[9998]"
        onClick={() => pauseTutorial()}
      />
      
      {/* Highlight for the target element */}
      {highlight && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            x: [0, 5, 0, -5, 0],
            y: [0, 5, 0, -5, 0]
          }}
          transition={{ 
            x: { repeat: Infinity, duration: 2 },
            y: { repeat: Infinity, duration: 2.5 }
          }}
          style={{
            position: 'absolute',
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            borderRadius: highlight.borderRadius,
            boxShadow: '0 0 0 4px rgba(24, 144, 255, 0.5)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
      )}
      
      {/* Tutorial popover */}
      <AnimatePresence>
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{
            position: 'absolute',
            ...position,
            zIndex: 10000
          }}
          className="bg-white dark:bg-gray-800 shadow-xl p-6 rounded-lg w-[350px] max-w-[90vw]"
        >
          {/* Header with close button */}
          <div className="flex justify-between items-center mb-2">
            <motion.h3 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-lg font-bold text-primary"
            >
              {currentStep.title}
            </motion.h3>
            <button 
              onClick={endTutorial} 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close tutorial"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Progress bar */}
          <Progress value={progress} className="h-1 mb-4" />
          
          {/* Content */}
          <motion.p 
            key={currentStep.id} 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gray-700 dark:text-gray-300 mb-6"
          >
            {currentStep.description}
          </motion.p>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <div>
              {isPaused ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={resumeTutorial}
                >
                  <PlayCircle size={16} className="mr-1" />
                  Resume
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={pauseTutorial}
                >
                  <PauseCircle size={16} className="mr-1" />
                  Pause
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={prevStep}
                disabled={currentStep.order === 0}
              >
                <ArrowLeft size={16} className="mr-1" />
                Previous
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={nextStep}
              >
                Next
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
          
          {/* Step indicator */}
          <div className="text-xs text-center text-gray-500 mt-4">
            Step {currentStep.order + 1} of {progress === 100 ? currentStep.order + 1 : Math.ceil(100 / (progress / (currentStep.order + 1)))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TutorialPopover;