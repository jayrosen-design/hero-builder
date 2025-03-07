
import { useState, useEffect, useCallback } from 'react';
import { SuperAbility } from './useCharacterCustomization';

type Position = {
  x: number;
  y: number;
  z: number;
};

type Platform = {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
};

type Coin = {
  id: string;
  x: number;
  y: number;
  z: number;
  collected: boolean;
};

type GameControls = {
  position: Position;
  rotation: number;
  isJumping: boolean;
  isFalling: boolean;
  isAbilityActive: boolean;
  coins: number;
  platforms: Platform[];
  coinObjects: Coin[];
  movement: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
};

// Define platforms in the game world
const gamePlatforms: Platform[] = [
  // Ground platform (large flat surface)
  { x: 0, y: -1.5, z: 0, width: 100, height: 0.5, depth: 100 },
  // Elevated platforms
  { x: -5, y: 0, z: -10, width: 5, height: 0.5, depth: 5 },
  { x: 8, y: 2, z: -8, width: 5, height: 0.5, depth: 5 },
  { x: 0, y: 4, z: -15, width: 5, height: 0.5, depth: 5 },
];

// Define coins in the game world
const initialCoins: Coin[] = [
  // Ground level coins
  { id: 'coin1', x: 2, y: -1, z: 2, collected: false },
  { id: 'coin2', x: -2, y: -1, z: -2, collected: false },
  { id: 'coin3', x: 4, y: -1, z: -3, collected: false },
  // Platform coins
  { id: 'coin4', x: -5, y: 0.5, z: -10, collected: false },
  { id: 'coin5', x: 8, y: 2.5, z: -8, collected: false },
  { id: 'coin6', x: 0, y: 4.5, z: -15, collected: false },
];

export const useGameControls = (superAbility: SuperAbility | null) => {
  // Initialize with default values
  const [controls, setControls] = useState<GameControls>({
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    isJumping: false,
    isFalling: false,
    isAbilityActive: false,
    coins: 0,
    platforms: gamePlatforms,
    coinObjects: initialCoins,
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
    
    console.log("Key pressed:", e.code);

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
          console.log("Jump initiated");
          setControls((prev) => ({ ...prev, isJumping: true }));
        }
        // Toggle super ability
        if (superAbility) {
          console.log("Toggling ability:", superAbility);
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

  // Check if character is on a platform
  const isOnPlatform = useCallback((position: Position, platforms: Platform[]) => {
    const characterRadius = 0.5; // approximate character width/2
    
    for (const platform of platforms) {
      // Check if character is within the x-z bounds of the platform
      const withinX = position.x >= platform.x - platform.width/2 - characterRadius && 
                      position.x <= platform.x + platform.width/2 + characterRadius;
      const withinZ = position.z >= platform.z - platform.depth/2 - characterRadius && 
                      position.z <= platform.z + platform.depth/2 + characterRadius;
      
      // Check if character is at the right height (slightly above platform)
      const atRightHeight = Math.abs(position.y - (platform.y + platform.height/2 + 0.1)) < 0.2;
      
      if (withinX && withinZ && atRightHeight) {
        return platform.y + platform.height/2 + 0.1; // Return the platform's top y-position
      }
    }
    return null; // Not on any platform
  }, []);

  // Check coin collection
  const checkCoinCollection = useCallback((position: Position, coinObjects: Coin[]) => {
    const collectionRadius = 1.5; // Increased radius to make collection easier
    let collected = false;
    
    const updatedCoins = coinObjects.map(coin => {
      if (coin.collected) return coin;
      
      const distance = Math.sqrt(
        Math.pow(position.x - coin.x, 2) + 
        Math.pow(position.y - coin.y, 2) + 
        Math.pow(position.z - coin.z, 2)
      );
      
      if (distance < collectionRadius) {
        collected = true;
        console.log(`Collected coin at (${coin.x}, ${coin.y}, ${coin.z}) with distance ${distance}`);
        return { ...coin, collected: true };
      }
      
      return coin;
    });
    
    return { updatedCoins, newCoinCollected: collected };
  }, []);

  // Handle jumping physics
  useEffect(() => {
    if (controls.isJumping) {
      const jumpHeight = 2;
      const jumpDuration = 500; // ms
      const startTime = Date.now();
      const startY = controls.position.y;
      
      console.log("Starting jump from y:", startY);
      
      // Simulate jumping
      const jumpInterval = setInterval(() => {
        setControls((prev) => {
          const jumpProgress = (Date.now() - startTime) / jumpDuration;
          
          if (jumpProgress >= 1) {
            clearInterval(jumpInterval);
            console.log("Jump completed, now falling");
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
      
      return () => clearInterval(jumpInterval);
    }
    
    if (controls.isFalling) {
      const fallDuration = 300; // ms
      const startTime = Date.now();
      
      const fallInterval = setInterval(() => {
        setControls((prev) => {
          const fallProgress = (Date.now() - startTime) / fallDuration;
          
          // Check if character is on a platform
          const platformY = isOnPlatform(prev.position, prev.platforms);
          
          if (fallProgress >= 1 || prev.position.y <= 0 || platformY !== null) {
            clearInterval(fallInterval);
            const landingY = platformY !== null ? platformY : 0;
            console.log("Landing at y:", landingY);
            return {
              ...prev,
              isFalling: false,
              position: { ...prev.position, y: landingY },
            };
          }
          
          const height = Math.max(0, prev.position.y - 0.1);
          return {
            ...prev,
            position: { ...prev.position, y: height },
          };
        });
      }, 16);
      
      return () => clearInterval(fallInterval);
    }
  }, [controls.isJumping, controls.isFalling, isOnPlatform]);

  // Set up event listeners
  useEffect(() => {
    console.log("Setting up game controls event listeners");
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      console.log("Removing game controls event listeners");
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
        
        // Check for coin collection even when not moving
        const { updatedCoins, newCoinCollected } = checkCoinCollection(
          prev.position, 
          prev.coinObjects
        );
        
        if (newCoinCollected) {
          console.log("Coin collected! New count:", prev.coins + 1);
        }
        
        // If not moving and not collecting coins, just return the previous state with updated coins
        if (!forward && !backward && !left && !right && !prev.isAbilityActive) {
          if (newCoinCollected) {
            return {
              ...prev,
              coinObjects: updatedCoins,
              coins: prev.coins + 1
            };
          }
          return prev;
        }
        
        let newRotation = prev.rotation;
        let xDelta = 0;
        let zDelta = 0;
        let yDelta = 0;
        
        // Adjust movement direction based on key presses
        if (forward) {
          zDelta -= moveSpeed;
          newRotation = 0;
          // When flying and moving forward, also move up
          if (prev.isAbilityActive && superAbility === 'flying') {
            yDelta += 0.05; // Ascend when flying forward
          }
        }
        if (backward) {
          zDelta += moveSpeed;
          newRotation = Math.PI;
        }
        if (left) {
          xDelta -= moveSpeed;
          newRotation = Math.PI * 0.5;
        }
        if (right) {
          xDelta += moveSpeed;
          newRotation = -Math.PI * 0.5;
        }
        
        // Diagonal movement
        if (forward && left) newRotation = Math.PI * 0.25;
        if (forward && right) newRotation = -Math.PI * 0.25;
        if (backward && left) newRotation = Math.PI * 0.75;
        if (backward && right) newRotation = -Math.PI * 0.75;
        
        // Calculate new position
        const newPosition = {
          x: prev.position.x + xDelta,
          y: prev.position.y + yDelta,
          z: prev.position.z + zDelta,
        };
        
        // Apply character's ability effects to movement
        if (prev.isAbilityActive && superAbility === 'flying' && !prev.isJumping && !prev.isFalling) {
          // When flying and not moving forward, hover in place
          if (!forward) {
            newPosition.y = Math.max(newPosition.y, 0.5); // Maintain minimum hover height
          }
          
          // Max height limit for flying
          if (newPosition.y > 5) {
            newPosition.y = 5;
          }
        }
        
        // Console log movement for debugging
        if (forward || backward || left || right) {
          console.log(`Moving: x:${xDelta.toFixed(2)} y:${yDelta.toFixed(2)} z:${zDelta.toFixed(2)} rot:${(newRotation * 180 / Math.PI).toFixed(0)}°`);
        }
        
        return {
          ...prev,
          position: newPosition,
          rotation: newRotation,
          coinObjects: updatedCoins,
          coins: newCoinCollected ? prev.coins + 1 : prev.coins
        };
      });
    }, 16); // ~60fps update rate
    
    return () => clearInterval(moveInterval);
  }, [superAbility, checkCoinCollection]);

  // Reset game controls
  const resetControls = () => {
    console.log("Resetting game controls");
    setControls({
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      isJumping: false,
      isFalling: false,
      isAbilityActive: false,
      coins: 0,
      platforms: gamePlatforms,
      coinObjects: initialCoins,
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
