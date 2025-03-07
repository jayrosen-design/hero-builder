
/**
 * Utility functions for managing sound effects in the game
 */

// Preload the coin sound
const coinSound = new Audio('https://cdn.pixabay.com/audio/2024/10/31/audio_9f88ea50ad.mp3');
coinSound.preload = 'auto';

// Preload the jump sound
const jumpSound = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_514df0ed60.mp3');
jumpSound.preload = 'auto';

// Preload the flying sound
const flyingSound = new Audio('https://cdn.pixabay.com/audio/2024/07/31/audio_10586d301d.mp3');
flyingSound.preload = 'auto';

// Preload the footstep sound
const footstepSound = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_5b3f53f852.mp3');
footstepSound.preload = 'auto';

/**
 * Play the coin collection sound effect
 */
export const playCoinSound = () => {
  // Create a new instance each time to allow overlapping sounds
  const sound = coinSound.cloneNode() as HTMLAudioElement;
  sound.volume = 0.5; // Set to 50% volume
  sound.play().catch(err => {
    console.error("Error playing coin sound:", err);
  });
};

/**
 * Play the jump sound effect
 */
export const playJumpSound = () => {
  // Create a new instance each time to allow overlapping sounds
  const sound = jumpSound.cloneNode() as HTMLAudioElement;
  sound.volume = 0.4; // Set to 40% volume
  sound.play().catch(err => {
    console.error("Error playing jump sound:", err);
  });
};

/**
 * Play the flying sound effect
 */
export const playFlyingSound = () => {
  // Create a new instance each time to allow overlapping sounds
  const sound = flyingSound.cloneNode() as HTMLAudioElement;
  sound.volume = 0.3; // Set to 30% volume
  sound.play().catch(err => {
    console.error("Error playing flying sound:", err);
  });
};

// Variable to track footstep sound timing
let lastFootstepTime = 0;
const FOOTSTEP_INTERVAL = 350; // Milliseconds between footstep sounds

/**
 * Play the footstep sound effect with rate limiting
 */
export const playFootstepSound = () => {
  const now = Date.now();
  // Only play footstep sound if enough time has passed since the last one
  if (now - lastFootstepTime > FOOTSTEP_INTERVAL) {
    const sound = footstepSound.cloneNode() as HTMLAudioElement;
    sound.volume = 0.2; // Set to 20% volume (footsteps should be subtle)
    sound.play().catch(err => {
      console.error("Error playing footstep sound:", err);
    });
    lastFootstepTime = now;
  }
};
