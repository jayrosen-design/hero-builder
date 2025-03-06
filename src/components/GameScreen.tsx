
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
    colors: {
      head: string;
      torso: string;
      arms: string;
      legs: string;
    };
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

  useEffect(() => {
    if (gameStarted && controls.isAbilityActive && character.superAbility) {
      toast.success(`${character.superAbility.charAt(0).toUpperCase() + character.superAbility.slice(1)} ability activated!`);
    }
  }, [controls.isAbilityActive, character.superAbility, gameStarted]);

  const handleStartGame = () => {
    console.log('Starting game from GameScreen, received button click');
    
    // First reset controls, then update state
    resetControls();
    setGameStarted(true);
    setShowControls(false);
    
    toast.info("Game started! Use WASD or arrow keys to move, SPACE to jump and activate your ability.");
    
    // Force rerender of the game scene
    setTimeout(() => {
      console.log("Forcing game scene refresh");
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-sky-400 to-sky-600">
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Character model container - explicitly set dimensions */}
        <div className="absolute inset-0 w-full h-full">
          <CharacterModel
            character={character}
            isGameMode={true}
            isRotating={false}
            controls={controls}
            isAbilityActive={controls.isAbilityActive}
          />
        </div>
        
        {gameStarted && (
          <div className="absolute top-20 left-4 text-xs text-white bg-black/30 p-2 rounded z-10">
            <div>X: {controls.position.x.toFixed(2)}</div>
            <div>Y: {controls.position.y.toFixed(2)}</div>
            <div>Z: {controls.position.z.toFixed(2)}</div>
            <div>Rotation: {(controls.rotation * 180 / Math.PI).toFixed(0)}°</div>
            <div>
              {controls.isJumping ? "Jumping" : controls.isFalling ? "Falling" : "Grounded"}
            </div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 z-20">
          <Button 
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={() => setShowControls(!showControls)}
          >
            Controls
          </Button>
        </div>
        
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm hover:bg-white/90 flex items-center gap-2"
            onClick={onBackToCustomization}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customization
          </Button>
        </div>
        
        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-sm font-medium flex items-center gap-2 z-20">
          <span>{character.superAbility ? character.superAbility.charAt(0).toUpperCase() + character.superAbility.slice(1) : 'No'} Ability</span>
          <div className={`w-3 h-3 rounded-full ${controls.isAbilityActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        </div>
      </div>
      
      {showControls && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto">
          <div className="glass-panel p-6 rounded-xl max-w-md w-full pointer-events-auto">
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
