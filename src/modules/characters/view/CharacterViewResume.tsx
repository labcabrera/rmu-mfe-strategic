import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Typography } from '@mui/material';
import { Character, EditableAvatar, updateCharacter } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { getAvatarImages } from '../../services/image-service';

const defaultCharacterImage = `${imageBaseUrl}images/npcs/unknown.png`;

const CharacterViewResume: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character | undefined>>;
}> = ({ character, setCharacter }) => {
  const { showError } = useError();

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
      <EditableAvatar
        imageUrl={character.imageUrl || defaultCharacterImage}
        onImageChange={onImageUpdated}
        images={getAvatarImages()}
      />
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
