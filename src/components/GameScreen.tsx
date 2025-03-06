
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SuperAbility } from '../hooks/useCharacterCustomization';
import { useGameControls } from '../hooks/useGameControls';
import CharacterModel from './CharacterModel';
import GameControls from './GameControls';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

interface GameScreenProps {
  character: {
    head: string;
    torso: string;
    arms: string;
    legs: string;
    superAbility: SuperAbility | null;
  };
  onBackToCustomization: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  character,
  onBackToCustomization,
}) => {
  const [showControls, setShowControls] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const { controls, resetControls } = useGameControls(character.superAbility);

  // Show toast when ability is activated
  useEffect(() => {
    if (gameStarted && controls.isAbilityActive && character.superAbility) {
      toast.success(`${character.superAbility.charAt(0).toUpperCase() + character.superAbility.slice(1)} ability activated!`);
    }
  }, [controls.isAbilityActive, character.superAbility, gameStarted]);

  const handleStartGame = () => {
    setGameStarted(true);
    setShowControls(false);
    resetControls();
    
    toast.info("Game started! Use WASD or arrow keys to move, SPACE to jump and activate your ability.");
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Game world container */}
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-sky-300 to-sky-500">
        {/* Game world - in a real implementation this would be a Three.js scene */}
        <div className="absolute inset-0">
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-emerald-600 to-emerald-500"></div>
          
          {/* Platforms */}
          <div className="absolute left-1/4 bottom-1/3 w-1/6 h-8 bg-stone-700 rounded-lg"></div>
          <div className="absolute right-1/3 bottom-1/2 w-1/5 h-8 bg-stone-700 rounded-lg"></div>
          <div className="absolute left-1/3 bottom-2/3 w-1/4 h-8 bg-stone-700 rounded-lg"></div>
          
          {/* Character */}
          <div
            className="absolute transition-all duration-75"
            style={{
              transform: `translate3d(${50 + controls.position.x * 100}px, ${400 - controls.position.y * 100}px, ${controls.position.z * 100}px) rotateY(${controls.rotation}rad)`,
            }}
          >
            <CharacterModel
              character={character}
              isGameMode={true}
              isRotating={false}
              controls={controls}
              isAbilityActive={controls.isAbilityActive}
            />
          </div>
        </div>
        
        {/* Game UI overlay */}
        <div className="absolute bottom-4 left-4">
          <Button 
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={() => setShowControls(!showControls)}
          >
            Controls
          </Button>
        </div>
        
        <div className="absolute top-4 left-4">
          <Button 
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 flex items-center gap-2"
            onClick={onBackToCustomization}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customization
          </Button>
        </div>
        
        {/* Ability indicator */}
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium flex items-center gap-2">
          <span>{character.superAbility ? character.superAbility.charAt(0).toUpperCase() + character.superAbility.slice(1) : 'No'} Ability</span>
          <div className={`w-3 h-3 rounded-full ${controls.isAbilityActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
      </div>
      
      {/* Controls overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="glass-panel p-6 rounded-xl max-w-md w-full">
            <GameControls 
              onStartGame={handleStartGame} 
              character={character}
              gameStarted={gameStarted}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
