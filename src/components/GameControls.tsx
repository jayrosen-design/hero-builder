
import React from 'react';
import { Button } from '@/components/ui/button';
import { CharacterState } from '../hooks/useCharacterCustomization';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space, Sparkles, Flame, Zap } from 'lucide-react';

interface GameControlsProps {
  character: CharacterState;
  onStartGame: () => void;
  gameStarted: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  character,
  onStartGame,
  gameStarted,
}) => {
  const getAbilityIcon = () => {
    switch (character.superAbility) {
      case 'flying':
        return <Zap className="w-5 h-5" />;
      case 'strength':
        return <Flame className="w-5 h-5" />;
      case 'magic':
        return <Sparkles className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const handleStartClick = (e) => {
    e.preventDefault(); // Prevent any default behavior
    console.log('Game controls: Start button clicked, forwarding to parent');
    
    if (typeof onStartGame === 'function') {
      onStartGame();
    } else {
      console.error('onStartGame is not a function', onStartGame);
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Game Controls</h2>
      <p className="text-sm text-hero-muted mb-6">Use these controls to play the game</p>
      
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Movement</h3>
          <Separator />
          <div className="grid grid-cols-3 gap-2">
            <div></div>
            <div className="flex justify-center">
              <Button variant="outline" size="icon" className="w-10 h-10">
                <ArrowUp className="w-5 h-5" />
              </Button>
            </div>
            <div></div>
            
            <div className="flex justify-end">
              <Button variant="outline" size="icon" className="w-10 h-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="icon" className="w-10 h-10">
                <ArrowDown className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-start">
              <Button variant="outline" size="icon" className="w-10 h-10">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-hero-muted">Arrow keys or WASD</p>
        </Card>
        
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-medium">Actions</h3>
          <Separator />
          <div className="flex justify-center">
            <Button variant="outline" className="h-10 px-8">
              <Space className="w-5 h-5 mr-2" /> Space
            </Button>
          </div>
          <p className="text-xs text-hero-muted">Jump & Activate Ability</p>
        </Card>
      </div>
      
      {character.superAbility && (
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm font-medium">Your Ability:</span>
            <div className="bg-hero-accent/20 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              {getAbilityIcon()}
              <span>
                {character.superAbility.charAt(0).toUpperCase() + character.superAbility.slice(1)}
              </span>
            </div>
          </div>
          <p className="text-xs text-hero-muted">
            Press <span className="font-semibold">SPACE</span> to activate your {character.superAbility} ability
          </p>
        </Card>
      )}
      
      <Button 
        onClick={handleStartClick}
        className="w-full bg-hero-accent hover:bg-hero-accent/90 text-white relative z-30"
        disabled={false} // Never disable this button
        type="button"
      >
        {gameStarted ? 'Resume Game' : 'Start Game'}
      </Button>
    </div>
  );
};

export default GameControls;
