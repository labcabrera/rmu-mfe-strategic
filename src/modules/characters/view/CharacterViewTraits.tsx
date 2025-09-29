import React, { FC, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { addTrait, deleteTrait } from '../../api/character';
import { AddTraitDto, Character, CharacterTrait } from '../../api/character.dto';
import { toRoman } from '../../services/roman-number-service';
import AddButton from '../../shared/buttons/AddButton';
import DeleteButton from '../../shared/buttons/DeleteButton';
import TextCard from '../../shared/cards/TextCard';
import CharacterViewAddTraitDialog from './CharacterViewAddTraitDialog';
import CharacterViewTraitDialog from './CharacterViewTraitDialog';

const CharacterViewTraits: FC<{
  character: Character;
  setCharacter: React.Dispatch<React.SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  const { showError } = useError();
  const [openAddTraitDialog, setOpenAddTraitDialog] = useState(false);
  const [openTraitDialog, setOpenTraitDialog] = useState(false);
  const [traitId, setTraitId] = useState<string | null>(null);

  if (!character) return <div>Loading for character...</div>;

  const handleTraitView = (traitId: string) => {
    setTraitId(traitId);
    setOpenTraitDialog(true);
  };

  const onAddTrait = (addTraitDto: AddTraitDto) => {
    addTrait(character.id, addTraitDto)
      .then((updatedCharacter) => {
        setCharacter(updatedCharacter);
        setOpenAddTraitDialog(false);
      })
      .catch((err) => showError(err.message));
  };

  const onDeleteTrait = (trait: CharacterTrait) => {
    deleteTrait(character.id, trait)
      .then((updatedCharacter) => setCharacter(updatedCharacter))
      .catch((error) => showError(error.message));
  };

  const getTraitName = (trait: CharacterTrait): string => {
    const name = trait.tier ? `${trait.traitName} ${toRoman(trait.tier)}` : trait.traitName;
    return trait.specialization ? `${name}: ${t(trait.specialization)}` : name;
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
          <Grid size={12}>
            <Box display="flex" alignItems="center" gap={2}>
              <TextCard
                key={index}
                value={getTraitName(trait)}
                subtitle={trait.tier ? `Tier ${trait.tier}` : ''}
                image={trait.isTalent ? '/static/images/generic/trait.png' : '/static/images/generic/disease.png'}
                minWidth={500}
                maxWidth={500}
                onClick={() => handleTraitView(trait.traitId)}
              />
              <DeleteButton onClick={() => onDeleteTrait(trait)} />
            </Box>
          </Grid>
        ))}
        {character.traits.length === 0 && <div>This character has no traits.</div>}
      </Grid>
      <CharacterViewAddTraitDialog
        open={openAddTraitDialog}
        onClose={() => setOpenAddTraitDialog(false)}
        onTraitAdded={(addTraitDto) => onAddTrait(addTraitDto)}
      />
      <CharacterViewTraitDialog traitId={traitId} open={openTraitDialog} onClose={() => setOpenTraitDialog(false)} />
    </>
  );
};

export default CharacterViewTraits;
