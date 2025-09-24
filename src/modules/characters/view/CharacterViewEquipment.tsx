import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character } from '../../api/character.dto';
import EquipmentSlotCard from '../../shared/cards/EquipmentSlotCard';

const slots = ['mainHand', 'offHand', 'body', 'head', 'arms', 'legs'];

const CharacterViewEquipment: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  return (
    <>
      <Typography variant="h6" color="primary" display="inline">
        {t('equipment')}
      </Typography>
      <Grid container spacing={2} mt={2}>
        {slots.map((slot) => (
          <EquipmentSlotCard
            key={slot}
            character={character}
            setCharacter={setCharacter}
            slot={slot}
            itemId={character.equipment[slot]}
          />
        ))}
      </Grid>
    </>
  );
};

export default CharacterViewEquipment;
