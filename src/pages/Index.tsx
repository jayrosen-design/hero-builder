import React, { useState, useEffect } from 'react';
import { useCharacterCustomization } from '../hooks/useCharacterCustomization';
import CharacterModel from '../components/CharacterModel';
import CustomizationControls from '../components/CustomizationControls';
import GameScreen from '../components/GameScreen';
import TransitionOverlay from '../components/TransitionOverlay';

const Index = () => {
  console.log("Index component rendering");
  
  const [gameMode, setGameMode] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const {
    character,
    bodyPartOptions,
    updateBodyPart,
    setSuperAbility,
    getSelectedOption,
    getSelectedAbility,
    updateBodyPartColor,
  } = useCharacterCustomization();

  useEffect(() => {
    console.log("Index component mounted");
    
    // Force a resize event to ensure Three.js canvas renders correctly on initial load
    window.dispatchEvent(new Event('resize'));
    
    return () => console.log("Index component unmounted");
  }, []);

  const handleStartGame = () => {
    console.log("Starting game - keeping the same view");
    // We're keeping the same 3D view and just enabling controls
    setGameMode(true);
    // Force a resize event to ensure Three.js canvas renders correctly
    window.dispatchEvent(new Event('resize'));
  };

  const handleBackToCustomization = () => {
    console.log("Going back to customization");
    setGameMode(false);
    // Force a resize event to ensure Three.js canvas renders correctly
    window.dispatchEvent(new Event('resize'));
  };

  console.log("Index rendering with gameMode:", gameMode, "showTransition:", showTransition, "character:", character);
  
  return (
    <div className="min-h-screen flex flex-col bg-hero-base overflow-hidden">
      {/* Header */}
      <header className="relative z-10 glass-panel bg-opacity-70 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-hero-dark">Hero Platformer</h1>
          <div className="text-sm text-hero-muted">
            {gameMode ? 'Game Mode' : 'Customization Mode'}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex">
        {!gameMode ? (
          // Customization mode
          <div className="container mx-auto flex flex-col lg:flex-row gap-8 py-8 px-4">
            {/* Character preview */}
            <div className="flex-1 glass-panel rounded-xl overflow-hidden flex items-center justify-center">
              <div className="relative w-full h-full min-h-[400px]">
                <CharacterModel 
                  character={character} 
                  isRotating={true} 
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex-1 flex items-center justify-center">
              <CustomizationControls
                bodyPartOptions={bodyPartOptions}
                getSelectedOption={getSelectedOption}
                updateBodyPart={updateBodyPart}
                updateBodyPartColor={updateBodyPartColor}
                selectedAbility={character.superAbility}
                setSuperAbility={setSuperAbility}
                onComplete={handleStartGame}
              />
            </div>
          </div>
        ) : (
          // Game mode - full screen game view without transitions
          <div className="w-full h-full flex-1 flex">
            <GameScreen 
              character={character} 
              onBackToCustomization={handleBackToCustomization} 
            />
          </div>
        )}
      </main>
      
      {/* Footer - only show in customization mode */}
      {!gameMode && (
        <footer className="glass-panel py-3 px-6">
          <div className="container mx-auto text-center text-xs text-hero-muted">
            <p>Create your custom superhero and test their abilities in the game!</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;
