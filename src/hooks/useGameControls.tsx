import { useState, useEffect, useCallback } from 'react';
import { SuperAbility } from './useCharacterCustomization';
import { 
  playCoinSound, 
  playJumpSound, 
  playFlyingSound, 
  startFootstepSound, 
  stopFootstepSound 
} from '../utils/soundEffects';

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
  broken?: boolean; // Added to track broken platforms
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
    up: boolean;    // Added for Q key (fly up)
    down: boolean;  // Added for E key (fly down)
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
      up: false,    // Added for Q key
      down: false,  // Added for E key
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
      case 'KeyQ': // Changed from flying upward to activating ability
        // If flying ability is active, use Q for flying up
        if (superAbility === 'flying' && controls.isAbilityActive) {
          setControls((prev) => ({
            ...prev,
            movement: { ...prev.movement, up: true },
          }));
          playFlyingSound();
        } 
        // Otherwise, Q toggles the ability for all ability types
        else if (superAbility) {
          console.log("Toggling ability:", superAbility);
          setControls((prev) => ({
            ...prev,
            isAbilityActive: !prev.isAbilityActive,
          }));
        }
        break;
      case 'KeyE': // E key is still used for flying downward
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, down: true },
        }));
        // Play flying sound if ability is active and flying
        if (controls.isAbilityActive && superAbility === 'flying') {
          playFlyingSound();
        }
        break;
      case 'Space':
        // Handle jump if not already jumping
        if (!controls.isJumping && !controls.isFalling) {
          console.log("Jump initiated");
          playJumpSound(); // Play jump sound when jumping
          setControls((prev) => ({ ...prev, isJumping: true }));
        }
        break;
      default:
        break;
    }
  }, [controls.isJumping, controls.isFalling, superAbility, controls.isAbilityActive]);

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
      case 'KeyQ': // Only reset up movement if flying ability is active
        if (superAbility === 'flying' && controls.isAbilityActive) {
          setControls((prev) => ({
            ...prev,
            movement: { ...prev.movement, up: false },
          }));
        }
        break;
      case 'KeyE': // Added E key release
        setControls((prev) => ({
          ...prev,
          movement: { ...prev.movement, down: false },
        }));
        break;
      default:
        break;
    }
  }, [superAbility, controls.isAbilityActive]);

  // Check if character is on a platform
  const isOnPlatform = useCallback((position: Position, platforms: Platform[]) => {
    const characterRadius = 0.5; // approximate character width/2
    
    for (const platform of platforms) {
      // Skip broken platforms
      if (platform.broken) continue;
      
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

  // Check if character is near a platform (for Strength ability)
  const isNearPlatform = useCallback((position: Position, platforms: Platform[]) => {
    const proximityRange = 2; // Distance to consider "near" a platform
    
    return platforms.findIndex(platform => {
      if (platform.broken) return false;
      
      // Skip the ground platform (can't break the main ground)
      if (platform.width >= 50) return false;
      
      const distanceX = Math.abs(position.x - platform.x);
      const distanceY = Math.abs(position.y - platform.y);
      const distanceZ = Math.abs(position.z - platform.z);
      
      return distanceX < proximityRange && 
             distanceY < proximityRange && 
             distanceZ < proximityRange;
    });
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
        // Play the coin collection sound
        playCoinSound();
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

  // Handle platform destruction with Strength ability
  useEffect(() => {
    if (controls.isAbilityActive && superAbility === 'strength') {
      const platformIndex = isNearPlatform(controls.position, controls.platforms);
      
      if (platformIndex >= 0) {
        console.log(`Breaking platform at index ${platformIndex}`);
        
        setControls(prev => {
          const updatedPlatforms = [...prev.platforms];
          updatedPlatforms[platformIndex] = {
            ...updatedPlatforms[platformIndex],
            broken: true
          };
          
          return {
            ...prev,
            platforms: updatedPlatforms
          };
        });
      }
    }
  }, [controls.isAbilityActive, controls.position, superAbility, isNearPlatform]);

  // Movement system
  useEffect(() => {
    const moveSpeed = 0.1;
    const flySpeed = 0.15;
    const coinAttractionSpeed = 0.2; // Speed at which coins move toward player
    
    const moveInterval = setInterval(() => {
      setControls((prev) => {
        const { forward, backward, left, right, up, down } = prev.movement;
        
        // Check for coin collection even when not moving
        const { updatedCoins, newCoinCollected } = checkCoinCollection(
          prev.position, 
          prev.coinObjects
        );
        
        if (newCoinCollected) {
          console.log("Coin collected! New count:", prev.coins + 1);
        }
        
        // Apply magic ability - attract coins
        let magicUpdatedCoins = [...updatedCoins];
        if (prev.isAbilityActive && superAbility === 'magic') {
          magicUpdatedCoins = updatedCoins.map(coin => {
            if (coin.collected) return coin;
            
            // Calculate direction vector from coin to player
            const dirX = prev.position.x - coin.x;
            const dirY = prev.position.y - coin.y;
            const dirZ = prev.position.z - coin.z;
            
            // Normalize the direction vector
            const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
            if (length > 0) {
              // Move coin towards player
              return {
                ...coin,
                x: coin.x + (dirX / length) * coinAttractionSpeed,
                y: coin.y + (dirY / length) * coinAttractionSpeed,
                z: coin.z + (dirZ / length) * coinAttractionSpeed
              };
            }
            
            return coin;
          });
        }
        
        // If not moving and not collecting coins, stop footstep sound and return previous state
        if (!forward && !backward && !left && !right && !up && !down) {
          stopFootstepSound();
          if (newCoinCollected || prev.isAbilityActive) {
            return {
              ...prev,
              coinObjects: magicUpdatedCoins,
              coins: newCoinCollected ? prev.coins + 1 : prev.coins
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
        
        // Apply flying vertical controls when ability is active
        if (prev.isAbilityActive && superAbility === 'flying') {
          if (up) {
            yDelta += flySpeed; // Q key for flying up
          }
          if (down) {
            yDelta -= flySpeed; // E key for flying down
          }
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
          // Maintain minimum hover height when flying
          if (newPosition.y < 0.5) {
            newPosition.y = 0.5;
          }
          
          // Max height limit for flying
          if (newPosition.y > 10) { // Increased max height for more flying freedom
            newPosition.y = 10;
          }
        }
        
        // Manage footstep sounds based on movement state
        const isGrounded = prev.position.y <= 0.1 || isOnPlatform(prev.position, prev.platforms) !== null;
        const isMovingHorizontally = (forward || backward || left || right);
        const isFlying = prev.isAbilityActive && superAbility === 'flying';
        
        if (isGrounded && isMovingHorizontally && !prev.isJumping && !prev.isFalling && !isFlying) {
          startFootstepSound();
        } else {
          stopFootstepSound();
        }
        
        // Console log movement for debugging
        if (forward || backward || left || right || up || down) {
          console.log(`Moving: x:${xDelta.toFixed(2)} y:${yDelta.toFixed(2)} z:${zDelta.toFixed(2)} rot:${(newRotation * 180 / Math.PI).toFixed(0)}°`);
        }
        
        return {
          ...prev,
          position: newPosition,
          rotation: newRotation,
          coinObjects: magicUpdatedCoins,
          coins: newCoinCollected ? prev.coins + 1 : prev.coins
        };
      });
    }, 16);
    
    return () => {
      clearInterval(moveInterval);
      stopFootstepSound();
    };
  }, [superAbility, checkCoinCollection, isOnPlatform, isNearPlatform]);

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
        up: false,
        down: false,
      },
    });
  };

  return {
    controls,
    resetControls,
  };
};
