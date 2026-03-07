import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { updateCharacter } from '../../api/character';
import { Character } from '../../api/character.dto';
import { StrategicGame } from '../../api/strategic-game.dto';
import { imageBaseUrl } from '../../services/config';
import EditableAvatar from '../../shared/avatars/EditableAvatar';

const defaultCharacterImage = `${imageBaseUrl}images/npcs/unknown.png`;

const CharacterViewResume: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
  strategicGame: StrategicGame;
}> = ({ character, setCharacter, strategicGame }) => {
  const { showError } = useError();
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const onImageUpdated = (imageId: string) => {
    updateCharacter(character.id, { ...character, imageUrl: imageId })
      .then((character) => {
        setCharacter(character);
      })
      .catch((error: Error) => {
        showError(error.message);
      });
  };

  if (!character) return <div>Loading...</div>;

  return (
    <>
      <EditableAvatar imageUrl={character.imageUrl || defaultCharacterImage} onImageChange={onImageUpdated} />
      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
        {character.name}
      </Typography>
      {character.experience.availableDevelopmentPoints > 0 && (
        <Typography variant="body1" color="success" sx={{ mt: 2 }}>
          {`${character.experience.availableDevelopmentPoints} unspent dev points`}
        </Typography>
      )}
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {character.description}
      </Typography>
    </>
  );
};

export default CharacterViewResume;
