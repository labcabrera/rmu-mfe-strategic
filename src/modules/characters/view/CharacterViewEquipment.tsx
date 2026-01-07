import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Character } from '../../api/character.dto';
import CharacterEquipmentLayout from './CharacterEquipment';

const slots = ['mainHand', 'offHand', 'body', 'head', 'arms', 'legs'];

const CharacterViewEquipment: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  return <CharacterEquipmentLayout character={character} setCharacter={setCharacter} />;
};

export default CharacterViewEquipment;
