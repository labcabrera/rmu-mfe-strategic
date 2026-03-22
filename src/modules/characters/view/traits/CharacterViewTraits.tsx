import React, { Dispatch, FC, SetStateAction, useState } from 'react';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { Character, CharacterTrait } from '../../../api/character.dto';
import { imageBaseUrl } from '../../../services/config';
import { gridSizeCard } from '../../../services/display';
import { toRoman } from '../../../services/roman-number-service';
import AddButton from '../../../shared/buttons/AddButton';
import RmuCard from '../../../shared/cards/RmuCard';
import CategorySeparator from '../../../shared/display/CategorySeparator';
import AddTraitDialog from './AddTraitDialog';
import CharacterViewTraitDialog from './CharacterViewTraitDialog';

const CharacterViewTraits: FC<{
  character: Character;
  setCharacter: Dispatch<SetStateAction<Character>>;
}> = ({ character, setCharacter }) => {
  const [openAddTraitDialog, setOpenAddTraitDialog] = useState(false);
  const [openTraitDialog, setOpenTraitDialog] = useState(false);
  const [traitId, setTraitId] = useState<string | null>(null);
  const [characterTrait, setCharacterTrait] = useState<CharacterTrait>();

  if (!character) return <div>Loading for character...</div>;

  const handleTraitView = (trait: CharacterTrait) => {
    setCharacterTrait(trait);
    setTraitId(traitId);
    setOpenTraitDialog(true);
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <CategorySeparator text={t('Traits')}>
            <AddButton onClick={() => setOpenAddTraitDialog(true)} />
          </CategorySeparator>
        </Grid>
        <Grid size={12}>
          <Grid container spacing={1}>
            {character.traits.map((trait, index) => (
              <Grid size={gridSizeCard} key={index}>
                <RmuCard
                  size="small"
                  key={index}
                  image={
                    trait.isTalent
                      ? `${imageBaseUrl}images/generic/trait.png`
                      : `${imageBaseUrl}images/generic/disease.png`
                  }
                  onClick={() => handleTraitView(trait)}
                >
                  <Stack direction="column">
                    <Typography>
                      {t(trait.traitId)} {toRoman(trait.tier)}
                    </Typography>
                    <Typography color="secondary">
                      <em>{trait.specialization ? t(trait.specialization) : 'None'}</em>
                    </Typography>
                  </Stack>
                </RmuCard>
              </Grid>
            ))}
          </Grid>
          {character.traits.length === 0 && <div>This character has no traits.</div>}
        </Grid>
      </Grid>
      <AddTraitDialog
        character={character}
        setCharacter={setCharacter}
        open={openAddTraitDialog}
        onClose={() => setOpenAddTraitDialog(false)}
      />
      <CharacterViewTraitDialog
        character={character}
        setCharacter={setCharacter}
        characterTrait={characterTrait!}
        open={openTraitDialog}
        onClose={() => setOpenTraitDialog(false)}
      />
    </>
  );
};

export default CharacterViewTraits;
