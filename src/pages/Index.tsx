
import React, { useState } from 'react';
import { useCharacterCustomization } from '../hooks/useCharacterCustomization';
import CharacterModel from '../components/CharacterModel';
import CustomizationControls from '../components/CustomizationControls';
import GameScreen from '../components/GameScreen';
import TransitionOverlay from '../components/TransitionOverlay';

const Index = () => {
  const [gameMode, setGameMode] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const {
    character,
    bodyPartOptions,
    updateBodyPart,
    setSuperAbility,
    getSelectedOption,
    getSelectedAbility,
  } = useCharacterCustomization();

  const handleStartGame = () => {
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    setGameMode(true);
  };

  const handleBackToCustomization = () => {
    setShowTransition(true);
    setTimeout(() => {
      setGameMode(false);
      setShowTransition(false);
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col bg-hero-base overflow-hidden">
      <TransitionOverlay 
        isVisible={showTransition} 
        onComplete={handleTransitionComplete} 
      />
      
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
                selectedAbility={character.superAbility}
                setSuperAbility={setSuperAbility}
                onComplete={handleStartGame}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
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
