
import React, { useState, useEffect } from 'react';
import { useCharacterCustomization } from '../hooks/useCharacterCustomization';
import CharacterModel from '../components/CharacterModel';
import CustomizationControls from '../components/CustomizationControls';
import { useGameControls } from '../hooks/useGameControls';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Index = () => {
  console.log("Index component rendering");
  
  const [gameStarted, setGameStarted] = useState(false);
  const {
    character,
    bodyPartOptions,
    updateBodyPart,
    setSuperAbility,
    getSelectedOption,
    getSelectedAbility,
    updateBodyPartColor,
  } = useCharacterCustomization();
  
  const { controls, resetControls } = useGameControls(character.superAbility);

  useEffect(() => {
    console.log("Index component mounted");
    
    // Force a resize event to ensure Three.js canvas renders correctly on initial load
    window.dispatchEvent(new Event('resize'));
    
    return () => console.log("Index component unmounted");
  }, []);

  const handleStartGame = () => {
    console.log("Starting game - keeping the same view");
    setGameStarted(true);
    resetControls();
    // Force a resize event to ensure Three.js canvas renders correctly
    window.dispatchEvent(new Event('resize'));
    
    toast.info("Game started! Use WASD or arrow keys to move, SPACE to jump and activate your ability. Use mouse to pan camera.");
  };

  const handleBackToCustomization = () => {
    console.log("Going back to customization");
    setGameStarted(false);
    // Force a resize event to ensure Three.js canvas renders correctly
    window.dispatchEvent(new Event('resize'));
  };

  console.log("Index rendering with gameStarted:", gameStarted, "character:", character);
  
  return (
    <div className="min-h-screen flex flex-col bg-hero-base overflow-hidden">
      {/* Header */}
      <header className="relative z-10 glass-panel bg-opacity-70 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-hero-dark">Hero Platformer</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-hero-muted">
              {gameStarted ? 'Game Mode' : 'Customization Mode'}
            </div>
            {gameStarted && (
              <Button 
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur-sm hover:bg-white/90 flex items-center gap-2"
                onClick={handleBackToCustomization}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Customization
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content - ALWAYS showing the 3D view */}
      <main className="flex-1 flex">
        <div className="container mx-auto flex flex-col lg:flex-row gap-8 py-8 px-4">
          {/* Character preview - always shown */}
          <div className="flex-1 glass-panel rounded-xl overflow-hidden flex items-center justify-center">
            <div className="relative w-full h-full min-h-[400px]">
              <CharacterModel 
                character={character} 
                isRotating={!gameStarted}
                controls={gameStarted ? controls : undefined}
                isAbilityActive={gameStarted && controls.isAbilityActive}
                allowMouseControls={true}
              />
            </div>
          </div>
          
          {/* Controls panel - shows customization or game controls */}
          <div className="flex-1 flex items-center justify-center">
            {!gameStarted ? (
              <CustomizationControls
                bodyPartOptions={bodyPartOptions}
                getSelectedOption={getSelectedOption}
                updateBodyPart={updateBodyPart}
                updateBodyPartColor={updateBodyPartColor}
                selectedAbility={character.superAbility}
                setSuperAbility={setSuperAbility}
                onComplete={handleStartGame}
              />
            ) : (
              <div className="glass-panel p-6 rounded-xl w-full max-w-sm">
                <div className="text-center space-y-4">
                  <h2 className="text-xl font-semibold">Game Controls</h2>
                  <p className="text-sm text-hero-muted">
                    Use WASD or arrow keys to move<br />
                    SPACE to jump and activate ability<br />
                    Mouse to look around the scene
                  </p>
                  
                  {character.superAbility && (
                    <div className="bg-hero-accent/20 px-3 py-2 rounded-lg text-sm">
                      <p className="font-medium">Your Ability: {character.superAbility}</p>
                      <div className="flex items-center justify-center mt-2 gap-2">
                        <span>Status:</span>
                        <div className={`w-3 h-3 rounded-full ${controls.isAbilityActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Debug info panel when in game mode */}
      {gameStarted && (
        <div className="absolute top-20 left-4 text-xs text-white bg-black/30 p-2 rounded z-30">
          <div>X: {controls.position.x.toFixed(2)}</div>
          <div>Y: {controls.position.y.toFixed(2)}</div>
          <div>Z: {controls.position.z.toFixed(2)}</div>
          <div>Rotation: {(controls.rotation * 180 / Math.PI).toFixed(0)}°</div>
          <div>
            {controls.isJumping ? "Jumping" : controls.isFalling ? "Falling" : "Grounded"}
          </div>
        </div>
      )}
      
      {/* Footer - always show */}
      <footer className="glass-panel py-3 px-6">
        <div className="container mx-auto text-center text-xs text-hero-muted">
          <p>{gameStarted ? 'Move your hero with WASD keys and use mouse to look around!' : 'Create your custom superhero and test their abilities in the game!'}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
