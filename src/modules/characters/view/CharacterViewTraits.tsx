import React, { FC, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { addTrait } from '../../api/character';
import { AddTraitDto, Character } from '../../api/character.dto';
import AddButton from '../../shared/buttons/AddButton';
import TextCard from '../../shared/cards/TextCard';
import CharacterAddTraitDialog from './CharacterViewAddTraitDialog';

const CharacterViewTraits: FC<{
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  const { showError } = useError();
  const [openAddTraitDialog, setOpenAddTraitDialog] = useState(false);

  if (!character) return <div>Loading...</div>;

  if (!character.traits) return <div>No traits available.</div>;

  const handleAddTrait = (addTraitDto: AddTraitDto) => {
    addTrait(character.id, addTraitDto)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        setOpenAddTraitDialog(false);
      })
      .catch((error) => {
        showError(error.message);
      });
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={12}>
          <Box display="flex" alignItems="center">
            <Typography variant="h6" color="primary" display="inline">
              {t('traits')}
            </Typography>
            <AddButton onClick={() => setOpenAddTraitDialog(true)} />
          </Box>
        </Grid>
        {character.traits.map((trait, index) => (
          <TextCard
            key={index}
            value={trait.traitId}
            subtitle={trait.tier ? `Tier ${trait.tier}` : ''}
            image={trait.isTalent ? '/static/images/generic/trait.png' : '/static/images/generic/disease.png'}
          />
        ))}
        <pre>{JSON.stringify(character.traits, null, 2)}</pre>
      </Grid>
      <CharacterAddTraitDialog
        open={openAddTraitDialog}
        character={character}
        onClose={() => setOpenAddTraitDialog(false)}
        onTraitAdded={(addTraitDto) => handleAddTrait(addTraitDto)}
      />
    </>
  );
};

export default CharacterViewTraits;
