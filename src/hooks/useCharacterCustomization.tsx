
import { useState } from 'react';

// Define types for character customization
export type BodyPart = 'head' | 'torso' | 'arms' | 'legs';
export type SuperAbility = 'flying' | 'strength' | 'magic';
export type BodyPartOption = {
  id: string;
  name: string;
  description?: string;
};

export type CharacterState = {
  head: string;
  torso: string;
  arms: string;
  legs: string;
  superAbility: SuperAbility | null;
};

// Options for each body part
const bodyPartOptions: Record<BodyPart, BodyPartOption[]> = {
  head: [
    { id: 'head-1', name: 'Helmet', description: 'Sleek metallic helmet' },
    { id: 'head-2', name: 'Mask', description: 'Mysterious face mask' },
    { id: 'head-3', name: 'Hood', description: 'Shadowy hood' },
  ],
  torso: [
    { id: 'torso-1', name: 'Armor', description: 'Reinforced body armor' },
    { id: 'torso-2', name: 'Suit', description: 'Flexible combat suit' },
    { id: 'torso-3', name: 'Jacket', description: 'Tactical jacket' },
  ],
  arms: [
    { id: 'arms-1', name: 'Gauntlets', description: 'Power gauntlets' },
    { id: 'arms-2', name: 'Bracers', description: 'Reinforced arm bracers' },
    { id: 'arms-3', name: 'Sleeves', description: 'Enhanced sleeves' },
  ],
  legs: [
    { id: 'legs-1', name: 'Boots', description: 'Gravity-defying boots' },
    { id: 'legs-2', name: 'Greaves', description: 'Armored leg protection' },
    { id: 'legs-3', name: 'Pants', description: 'Tactical combat pants' },
  ],
};

// Super ability options with descriptions
export const superAbilityOptions = [
  { 
    id: 'flying', 
    name: 'Flying', 
    description: 'Soar through the air with a majestic cape', 
    effect: 'Adds a flowing cape to your hero' 
  },
  { 
    id: 'strength', 
    name: 'Strength', 
    description: 'Unleash devastating power with enhanced muscles', 
    effect: 'Enlarges your hero\'s arms for powerful attacks' 
  },
  { 
    id: 'magic', 
    name: 'Magic', 
    description: 'Harness mystical energies with glowing hands', 
    effect: 'Makes your hero\'s hands glow with arcane energy' 
  },
];

export const useCharacterCustomization = () => {
  // Initialize character with default options
  const [character, setCharacter] = useState<CharacterState>({
    head: bodyPartOptions.head[0].id,
    torso: bodyPartOptions.torso[0].id,
    arms: bodyPartOptions.arms[0].id,
    legs: bodyPartOptions.legs[0].id,
    superAbility: null,
  });

  // Function to update a body part
  const updateBodyPart = (part: BodyPart, optionId: string) => {
    setCharacter((prev) => ({
      ...prev,
      [part]: optionId,
    }));
  };

  // Function to set the super ability
  const setSuperAbility = (ability: SuperAbility | null) => {
    setCharacter((prev) => ({
      ...prev,
      superAbility: ability,
    }));
  };

  // Get the currently selected option for a body part
  const getSelectedOption = (part: BodyPart) => {
    const optionId = character[part];
    return bodyPartOptions[part].find((option) => option.id === optionId);
  };

  // Get the currently selected super ability
  const getSelectedAbility = () => {
    if (!character.superAbility) return null;
    return superAbilityOptions.find(
      (option) => option.id === character.superAbility
    );
  };

  return {
    character,
    bodyPartOptions,
    superAbilityOptions,
    updateBodyPart,
    setSuperAbility,
    getSelectedOption,
    getSelectedAbility,
  };
};
