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
      subtitle={`${character.info.race.name} - ${t(character.info.professionId)} - ${character.experience.availableLevel}`}
      image={character.imageUrl || resolveRaceImage(character.info.race.name)}
      onClick={handleCharacterClick}
    />
  );
};

export default CharacterCard;
