
import { useState, useEffect, useCallback } from 'react';
import { SuperAbility } from './useCharacterCustomization';

type Position = {
  x: number;
  y: number;
  z: number;
};

type GameControls = {
  position: Position;
  rotation: number;
  isJumping: boolean;
  isFalling: boolean;
  isAbilityActive: boolean;
  movement: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
};

export const useGameControls = (superAbility: SuperAbility | null) => {
  const [controls, setControls] = useState<GameControls>({
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    isJumping: false,
    isFalling: false,
    isAbilityActive: false,
    movement: {
      forward: false,
      backward: false,
      left: false,
      right: false,
    },
  });

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, forward: true },
        }));
        break;
      case 'KeyS':
      case 'ArrowDown':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, backward: true },
        }));
        break;
      case 'KeyA':
      case 'ArrowLeft':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, left: true },
        }));
        break;
      case 'KeyD':
      case 'ArrowRight':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, right: true },
        }));
        break;
      case 'Space':
        // Handle jump if not already jumping
        if (!controls.isJumping && !controls.isFalling) {
          setControls((prev) => ({ ...prev, isJumping: true }));
        }
        // Toggle super ability
        if (superAbility) {
          setControls((prev) => ({
            ...prev,
            isAbilityActive: !prev.isAbilityActive,
          }));
        }
        break;
      default:
        break;
    }
  }, [controls.isJumping, controls.isFalling, superAbility]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, forward: false },
        }));
        break;
      case 'KeyS':
      case 'ArrowDown':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, backward: false },
        }));
        break;
      case 'KeyA':
      case 'ArrowLeft':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, left: false },
        }));
        break;
      case 'KeyD':
      case 'ArrowRight':
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, right: false },
        }));
        break;
      default:
        break;
    }
  }, []);

  // Handle jumping physics
  useEffect(() => {
    if (controls.isJumping) {
      const jumpHeight = 2;
      const jumpDuration = 500; // ms
      
      // Simulate jumping
      let startY = controls.position.y;
      const jumpInterval = setInterval(() => {
        setControls((prev) => {
          const jumpProgress = (Date.now() - startTime) / jumpDuration;
          
          if (jumpProgress >= 1) {
            clearInterval(jumpInterval);
            return { ...prev, isJumping: false, isFalling: true };
          }
          
          // Parabolic jump curve
          const height = startY + jumpHeight * Math.sin(jumpProgress * Math.PI);
          return {
            ...prev,
            position: { ...prev.position, y: height },
          };
        });
      }, 16);
      
      const startTime = Date.now();
      
      return () => clearInterval(jumpInterval);
    }
    
    if (controls.isFalling) {
      const fallDuration = 300; // ms
      const fallInterval = setInterval(() => {
        setControls((prev) => {
          const fallProgress = (Date.now() - startTime) / fallDuration;
          
          if (fallProgress >= 1 || prev.position.y <= 0) {
            clearInterval(fallInterval);
            return {
              ...prev,
              isFalling: false,
              position: { ...prev.position, y: 0 },
            };
          }
          
          const height = Math.max(0, prev.position.y - 0.1);
          return {
            ...prev,
            position: { ...prev.position, y: height },
          };
        });
      }, 16);
      
      const startTime = Date.now();
      
      return () => clearInterval(fallInterval);
    }
  }, [controls.isJumping, controls.isFalling]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Movement system
  useEffect(() => {
    const moveSpeed = 0.1;
    const moveInterval = setInterval(() => {
      setControls((prev) => {
        const { forward, backward, left, right } = prev.movement;
        
        if (!forward && !backward && !left && !right) return prev;
        
        let newRotation = prev.rotation;
        let xDelta = 0;
        let zDelta = 0;
        
        if (forward) {
          zDelta -= moveSpeed;
        }
        if (backward) {
          zDelta += moveSpeed;
        }
        if (left) {
          xDelta -= moveSpeed;
          newRotation = Math.PI * 0.5;
        }
        if (right) {
          xDelta += moveSpeed;
          newRotation = -Math.PI * 0.5;
        }
        
        if (forward && left) newRotation = Math.PI * 0.25;
        if (forward && right) newRotation = -Math.PI * 0.25;
        if (backward && left) newRotation = Math.PI * 0.75;
        if (backward && right) newRotation = -Math.PI * 0.75;
        
        return {
          ...prev,
          position: {
            x: prev.position.x + xDelta,
            y: prev.position.y,
            z: prev.position.z + zDelta,
          },
          rotation: forward || backward ? newRotation : prev.rotation,
        };
      });
    }, 16);
    
    return () => clearInterval(moveInterval);
  }, []);

  // Reset game controls
  const resetControls = () => {
    setControls({
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      isJumping: false,
      isFalling: false,
      isAbilityActive: false,
      movement: {
        forward: false,
        backward: false,
        left: false,
        right: false,
      },
    });
  };

  return {
    controls,
    resetControls,
  };
};
