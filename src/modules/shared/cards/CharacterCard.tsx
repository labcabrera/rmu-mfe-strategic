import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';
import { resolveRaceImage } from '../../services/race-avatar-service';
import CardListItem from './CardListItem';

const CharacterCard: FC<{
  character: Character;
}> = ({ character }) => {
  const navigate = useNavigate();

  const handleCharacterClick = () => {
    navigate(`/strategic/characters/view/${character.id}`, { state: { character } });
  };

  if (!character) return <p>Loading...</p>;

  return (
    <CardListItem
      title={character.name}
      subtitle={`${character.info.raceName} - ${t(character.info.professionId)} - ${character.experience.availableLevel}`}
      image={resolveRaceImage(character.info.raceName)}
      onClick={handleCharacterClick}
    />
  );
};

export default CharacterCard;
