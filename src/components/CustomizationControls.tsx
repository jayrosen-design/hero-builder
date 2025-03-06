
import React from 'react';
import { BodyPart, SuperAbility, superAbilityOptions } from '../hooks/useCharacterCustomization';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Flame, Zap, Sparkles } from 'lucide-react';

interface CustomizationControlsProps {
  bodyPartOptions: Record<BodyPart, any[]>;
  getSelectedOption: (part: BodyPart) => any;
  updateBodyPart: (part: BodyPart, optionId: string) => void;
  selectedAbility: SuperAbility | null;
  setSuperAbility: (ability: SuperAbility | null) => void;
  onComplete: () => void;
}

const CustomizationControls: React.FC<CustomizationControlsProps> = ({
  bodyPartOptions,
  getSelectedOption,
  updateBodyPart,
  selectedAbility,
  setSuperAbility,
  onComplete,
}) => {
  const getAbilityIcon = (ability: string) => {
    switch (ability) {
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

  return (
    <Card className="glass-panel w-full max-w-md rounded-xl p-6 overflow-hidden">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-hero-dark mb-2">Customize Your Hero</h2>
        <p className="text-hero-muted text-sm">Modify body parts and choose a super ability</p>
      </div>
      
      <Tabs defaultValue="head">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="head" className="text-sm">Head</TabsTrigger>
          <TabsTrigger value="torso" className="text-sm">Torso</TabsTrigger>
          <TabsTrigger value="arms" className="text-sm">Arms</TabsTrigger>
          <TabsTrigger value="legs" className="text-sm">Legs</TabsTrigger>
        </TabsList>
        
        {(['head', 'torso', 'arms', 'legs'] as BodyPart[]).map((part) => (
          <TabsContent key={part} value={part} className="space-y-3 min-h-32">
            <div className="grid grid-cols-3 gap-2">
              {bodyPartOptions[part].map((option) => {
                const isSelected = getSelectedOption(part)?.id === option.id;
                return (
                  <div
                    key={option.id}
                    onClick={() => updateBodyPart(part, option.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                               ${isSelected 
                                 ? 'border-hero-accent bg-hero-accent/10 shadow-md' 
                                 : 'border-transparent hover:border-hero-accent/30 hover:bg-hero-accent/5'}`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-hero-dark/20 flex items-center justify-center mb-2">
                        {option.name.charAt(0)}
                      </div>
                      <div className="text-sm font-medium">{option.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-hero-muted mt-2 italic">
              {getSelectedOption(part)?.description || 'Select an option'}
            </p>
          </TabsContent>
        ))}
      </Tabs>
      
      <Separator className="my-6" />
      
      <div>
        <h3 className="text-md font-semibold mb-3">Super Ability</h3>
        <div className="grid grid-cols-3 gap-3 mb-4">
          {superAbilityOptions.map((ability) => {
            const isSelected = selectedAbility === ability.id;
            return (
              <div
                key={ability.id}
                onClick={() => setSuperAbility(ability.id as SuperAbility)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                           ${isSelected 
                             ? 'border-hero-accent bg-hero-accent/10 shadow-md' 
                             : 'border-transparent hover:border-hero-accent/30 hover:bg-hero-accent/5'}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-hero-accent/20 flex items-center justify-center mb-1">
                    {getAbilityIcon(ability.id)}
                  </div>
                  <div className="text-sm font-medium">{ability.name}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        {selectedAbility && (
          <div className="bg-hero-accent/10 p-3 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-hero-accent/20 text-xs">
                {superAbilityOptions.find(a => a.id === selectedAbility)?.name || ''}
              </Badge>
              <span className="text-xs text-hero-muted">Press SPACE to activate in game</span>
            </div>
            <p className="text-xs text-hero-dark/80">
              {superAbilityOptions.find(a => a.id === selectedAbility)?.effect || ''}
            </p>
          </div>
        )}
      </div>
      
      <Button 
        onClick={onComplete}
        disabled={!selectedAbility}
        className="w-full mt-2 bg-hero-accent hover:bg-hero-accent/90 text-white"
      >
        {selectedAbility ? 'Start Game' : 'Select a Super Ability'}
      </Button>
    </Card>
  );
};

export default CustomizationControls;
