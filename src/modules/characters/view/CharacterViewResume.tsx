import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { useAuth } from 'react-oidc-context';
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
  const auth = useAuth();
  const { showError } = useError();

  const onImageUpdated = (imageId: string) => {
    const dto = { imageUrl: imageId };
    updateCharacter(character.id, dto, auth)
      .then((character) => setCharacter(character))
      .catch((error) => showError(error.message));
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
      {character.experience.availableDevPoints > 0 && (
        <Typography variant="body1" color="success" sx={{ mt: 2 }}>
          {`${character.experience.availableDevPoints} unspent dev points`}
        </Typography>
      )}
      {character.experience.availableStatLevelUp > 0 && (
        <Typography variant="body1" color="success" sx={{ mt: 2 }}>
          {`${character.experience.availableStatLevelUp} stats updates`}
        </Typography>
      )}
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
        {character.description}
      </Typography>
    </>
  );
};

export default CharacterViewResume;
