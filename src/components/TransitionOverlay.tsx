
import React, { useEffect, useState } from 'react';

interface TransitionOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const TransitionOverlay: React.FC<TransitionOverlayProps> = ({
  isVisible,
  onComplete,
}) => {
  const [animationClass, setAnimationClass] = useState('');
  
  useEffect(() => {
    if (isVisible) {
      // Start with fade in
      setAnimationClass('animate-fade-in');
      
      // After fade in completes, notify parent
      const timeout = setTimeout(() => {
        if (onComplete) onComplete();
        
        // Then fade out
        setTimeout(() => {
          setAnimationClass('animate-fade-out');
        }, 200);
      }, 500);
      
      return () => clearTimeout(timeout);
    } else {
      setAnimationClass('');
    }
  }, [isVisible, onComplete]);
  
  if (!isVisible && !animationClass) return null;
  
  return (
    <div className={`fixed inset-0 bg-black z-50 ${animationClass}`}></div>
  );
};

export default TransitionOverlay;
