
/**
 * Utility functions for managing sound effects in the game
 */

// Preload the coin sound
const coinSound = new Audio('https://cdn.pixabay.com/audio/2024/10/31/audio_9f88ea50ad.mp3');
coinSound.preload = 'auto';

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
